import axios from 'axios';
import connectDB from './mongodb';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { PathaoToken } from '@/models/PathaoToken';
import { decryptText } from './encryption';

const locationCache: Record<string, { data: any; expiresAt: number }> = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const PATHAO_PRODUCTION_BASE_URL = 'https://api-hermes.pathao.com';

export interface PathaoCredentials {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId: string;
  source: 'database';
}

class PathaoService {
  public async getCreds(): Promise<PathaoCredentials> {
    await connectDB();
    try {
      const settings: any = await WebsiteSettings.findOne().lean();
      const p = settings?.courier?.pathao;

      if (p && (p.clientId || p.username || p.clientSecret || p.storeId)) {
        const clientSecret = p.clientSecret ? decryptText(p.clientSecret) : '';
        const password = p.password ? decryptText(p.password) : '';

        return {
          baseUrl: PATHAO_PRODUCTION_BASE_URL,
          clientId: (p.clientId || '').trim(),
          clientSecret: (clientSecret || '').trim(),
          username: (p.username || '').trim(),
          password: password || '',
          storeId: (p.storeId || '').trim(),
          source: 'database'
        };
      }
    } catch (err: any) {
      console.warn('[PATHAO] Failed to read database settings:', err.message);
    }

    throw new Error('Pathao Courier is not configured. Please configure Pathao credentials in Admin Settings.');
  }

  public async validateCreds(): Promise<PathaoCredentials> {
    const creds = await this.getCreds();
    const missing: string[] = [];
    if (!creds.clientId) missing.push('Client ID');
    if (!creds.clientSecret) missing.push('Client Secret');
    if (!creds.username) missing.push('Username / Email');
    if (!creds.password) missing.push('Password');
    if (!creds.storeId) missing.push('Store ID');

    if (missing.length > 0) {
      throw new Error(`Pathao configuration incomplete: Missing ${missing.join(', ')}. Please update Admin Settings.`);
    }
    return creds;
  }

  public async getAccessToken(): Promise<string> {
    await connectDB();
    const creds = await this.validateCreds();
    
    let tokenDoc = await PathaoToken.findOne();
    const now = new Date();

    if (tokenDoc && tokenDoc.accessToken && tokenDoc.expiresAt > new Date(now.getTime() + 60 * 1000)) {
      return tokenDoc.accessToken;
    }

    if (tokenDoc && tokenDoc.refreshToken) {
      try {
        console.log('[PATHAO] Refreshing access token...');
        const response = await axios.post(`${creds.baseUrl}/aladdin/api/v1/issue-token`, {
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          refresh_token: tokenDoc.refreshToken,
          grant_type: 'refresh_token'
        });

        const { access_token, refresh_token, expires_in } = response.data;

        tokenDoc.accessToken = access_token;
        tokenDoc.refreshToken = refresh_token;
        tokenDoc.expiresAt = new Date(Date.now() + (expires_in * 1000) - 60000);
        await tokenDoc.save();

        console.log('[PATHAO] Token refreshed successfully');
        return access_token;
      } catch (err: any) {
        console.warn('[PATHAO] Token refresh failed, falling back to full authorization:', err.response?.data?.message || err.message);
      }
    }

    console.log('[PATHAO] Issuing new access token from active credentials...');
    try {
      const response = await axios.post(`${creds.baseUrl}/aladdin/api/v1/issue-token`, {
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        username: creds.username,
        password: creds.password,
        grant_type: 'password'
      });

      const { access_token, refresh_token, expires_in } = response.data;

      if (!tokenDoc) {
        tokenDoc = new PathaoToken();
      }

      tokenDoc.accessToken = access_token;
      tokenDoc.refreshToken = refresh_token;
      tokenDoc.expiresAt = new Date(Date.now() + (expires_in * 1000) - 60000);
      await tokenDoc.save();

      console.log('[PATHAO] Issued new token successfully');
      return access_token;
    } catch (err: any) {
      console.error('[PATHAO] Failed to issue token:', err.response?.data?.message || err.message);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.message?.includes('ENOTFOUND')) {
        throw new Error('Unable to connect to Pathao servers. Please check DNS/Network connection.');
      }
      if (err.response?.status === 400 || err.response?.status === 401) {
        const pathaoMsg = err.response?.data?.message || err.response?.data?.error?.description || 'Credentials rejected by Pathao';
        throw new Error(`Pathao authentication failed: ${pathaoMsg}`);
      }
      const apiMsg = err.response?.data?.message || err.message;
      throw new Error(`Pathao API error: ${apiMsg}`);
    }
  }

  private async getAuthHeaders() {
    const token = await this.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    };
  }

  private async executeWithAuth<T>(apiCallFn: (config: any) => Promise<T>): Promise<T> {
    try {
      const config = await this.getAuthHeaders();
      return await apiCallFn(config);
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.warn('[PATHAO] Received 401 from Pathao API. Purging cached token and retrying...');
        await connectDB();
        await PathaoToken.deleteMany({});
        try {
          const freshConfig = await this.getAuthHeaders();
          return await apiCallFn(freshConfig);
        } catch (retryErr: any) {
          const pathaoMsg = retryErr.response?.data?.message || retryErr.response?.data?.error?.description || retryErr.message;
          throw new Error(`Pathao API error (${retryErr.response?.status || 401}): ${pathaoMsg}`);
        }
      }
      const pathaoMsg = err.response?.data?.message || err.response?.data?.error?.description || err.message;
      throw new Error(`Pathao API error (${err.response?.status || 500}): ${pathaoMsg}`);
    }
  }

  public async testConnection(customCreds?: Partial<PathaoCredentials>): Promise<{
    success: boolean;
    authStatus: string;
    storeStatus: string;
    message: string;
    stores?: any[];
  }> {
    await connectDB();
    try {
      let creds: PathaoCredentials;
      if (customCreds && (customCreds.clientId || customCreds.username)) {
        creds = {
          baseUrl: PATHAO_PRODUCTION_BASE_URL,
          clientId: (customCreds.clientId || '').trim(),
          clientSecret: (customCreds.clientSecret || '').trim(),
          username: (customCreds.username || '').trim(),
          password: customCreds.password || '',
          storeId: (customCreds.storeId || '').trim(),
          source: 'database'
        };

        if (creds.clientSecret === '************' || creds.password === '************' || !creds.clientSecret || !creds.password) {
          try {
            const savedCreds = await this.getCreds();
            if (creds.clientSecret === '************' || !creds.clientSecret) {
              creds.clientSecret = savedCreds.clientSecret;
            }
            if (creds.password === '************' || !creds.password) {
              creds.password = savedCreds.password;
            }
          } catch {
            // Ignore if no saved creds in DB yet
          }
        }
      } else {
        creds = await this.validateCreds();
      }

      console.log('[PATHAO] Testing production authentication with base URL:', creds.baseUrl);

      const tokenRes = await axios.post(`${creds.baseUrl}/aladdin/api/v1/issue-token`, {
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        username: creds.username,
        password: creds.password,
        grant_type: 'password'
      });

      const accessToken = tokenRes.data?.access_token;
      if (!accessToken) {
        return {
          success: false,
          authStatus: 'Failed',
          storeStatus: 'Unverified',
          message: 'Authentication failed: Pathao returned no token.'
        };
      }

      let storeStatus = 'Unverified';
      let storeMessage = '';
      let storeList: any[] = [];

      try {
        const storesRes = await axios.get(`${creds.baseUrl}/aladdin/api/v1/stores`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        });

        const storesData = storesRes.data?.data?.data || storesRes.data?.data || [];
        storeList = Array.isArray(storesData) ? storesData : [];

        if (creds.storeId) {
          const storeMatch = storeList.find((s: any) => String(s.store_id || s.id) === String(creds.storeId));
          if (storeMatch) {
            storeStatus = 'Verified';
            storeMessage = `Store "${storeMatch.store_name || storeMatch.name || creds.storeId}" verified.`;
          } else {
            storeStatus = 'Not Found';
            storeMessage = `Store ID ${creds.storeId} was not found in your Pathao merchant account.`;
          }
        } else {
          storeStatus = 'No Store ID Provided';
        }
      } catch (storeErr: any) {
        console.warn('[PATHAO] Store verification check failed:', storeErr.message);
        storeStatus = 'Store Check Failed';
        storeMessage = storeErr.response?.data?.message || storeErr.message;
      }

      return {
        success: true,
        authStatus: 'Connected',
        storeStatus,
        message: `Pathao Connection Successful! ${storeMessage}`,
        stores: storeList
      };
    } catch (err: any) {
      console.error('[PATHAO] Connection test failed:', err.response?.data || err.message);
      const safeMsg = err.response?.data?.message || err.response?.data?.error?.description || err.message || 'Authentication rejected';
      return {
        success: false,
        authStatus: 'Failed',
        storeStatus: 'Unverified',
        message: `Authentication Failed: ${safeMsg}`
      };
    }
  }

  public async getStores() {
    const creds = await this.getCreds();
    return this.executeWithAuth(config => axios.get(`${creds.baseUrl}/aladdin/api/v1/stores`, config).then(res => res.data));
  }

  public async getCities() {
    const cacheKey = 'cities';
    const now = Date.now();
    if (locationCache[cacheKey] && locationCache[cacheKey].expiresAt > now) {
      return locationCache[cacheKey].data;
    }

    const creds = await this.getCreds();
    const data = await this.executeWithAuth(config => axios.get(`${creds.baseUrl}/aladdin/api/v1/city-list`, config).then(res => res.data));
    
    locationCache[cacheKey] = {
      data,
      expiresAt: now + CACHE_TTL
    };
    return data;
  }

  public async getZones(cityId: string) {
    const cacheKey = `zones_${cityId}`;
    const now = Date.now();
    if (locationCache[cacheKey] && locationCache[cacheKey].expiresAt > now) {
      return locationCache[cacheKey].data;
    }

    const creds = await this.getCreds();
    const data = await this.executeWithAuth(config => axios.get(`${creds.baseUrl}/aladdin/api/v1/cities/${cityId}/zone-list`, config).then(res => res.data));
    
    locationCache[cacheKey] = {
      data,
      expiresAt: now + CACHE_TTL
    };
    return data;
  }

  public async getAreas(zoneId: string) {
    const cacheKey = `areas_${zoneId}`;
    const now = Date.now();
    if (locationCache[cacheKey] && locationCache[cacheKey].expiresAt > now) {
      return locationCache[cacheKey].data;
    }

    const creds = await this.getCreds();
    const data = await this.executeWithAuth(config => axios.get(`${creds.baseUrl}/aladdin/api/v1/zones/${zoneId}/area-list`, config).then(res => res.data));
    
    locationCache[cacheKey] = {
      data,
      expiresAt: now + CACHE_TTL
    };
    return data;
  }

  public async calculatePrice(payload: {
    recipient_city: string;
    recipient_zone: string;
    item_weight: number;
    item_type?: number;
    delivery_type?: number;
  }) {
    const creds = await this.getCreds();
    
    const requestData = {
      store_id: Number(creds.storeId),
      item_type: payload.item_type || 2,
      delivery_type: payload.delivery_type || 48,
      item_weight: payload.item_weight || 0.5,
      recipient_city: Number(payload.recipient_city),
      recipient_zone: Number(payload.recipient_zone)
    };

    return this.executeWithAuth(config => axios.post(`${creds.baseUrl}/aladdin/api/v1/merchant/price-plan`, requestData, config).then(res => res.data));
  }

  public async createOrder(payload: {
    merchant_order_id: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    item_quantity: number;
    item_weight: number;
    item_description: string;
    amount_to_collect: number;
    special_instruction?: string;
  }) {
    const creds = await this.getCreds();

    const requestData = {
      store_id: Number(creds.storeId),
      merchant_order_id: payload.merchant_order_id,
      recipient_name: payload.recipient_name,
      recipient_phone: payload.recipient_phone,
      recipient_address: payload.recipient_address,
      delivery_type: 48,
      item_type: 2,
      special_instruction: payload.special_instruction || '',
      item_quantity: payload.item_quantity,
      item_weight: payload.item_weight || 0.5,
      item_description: payload.item_description,
      amount_to_collect: payload.amount_to_collect
    };

    return this.executeWithAuth(config => axios.post(`${creds.baseUrl}/aladdin/api/v1/orders`, requestData, config).then(res => res.data));
  }

  public async getOrderInfo(consignmentId: string) {
    const creds = await this.getCreds();
    return this.executeWithAuth(config => axios.get(`${creds.baseUrl}/aladdin/api/v1/orders/${consignmentId}/info`, config).then(res => res.data));
  }
}

export const pathaoService = new PathaoService();
