import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { PathaoToken } from '@/models/PathaoToken';
import { verifyAdminSession } from '@/lib/auth';
import { encryptText } from '@/lib/encryption';

const MASKED_SECRET = '************';

export async function PUT(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await req.json();
    const {
      logo,
      favicon,
      businessPhone,
      whatsappNumber,
      supportEmail,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      courier
    } = body;

    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = new WebsiteSettings();
    }

    settings.logo = logo !== undefined ? logo : settings.logo;
    settings.favicon = favicon !== undefined ? favicon : settings.favicon;
    settings.businessPhone = businessPhone !== undefined ? businessPhone : settings.businessPhone;
    settings.whatsappNumber = whatsappNumber !== undefined ? whatsappNumber : settings.whatsappNumber;
    settings.supportEmail = supportEmail !== undefined ? supportEmail : settings.supportEmail;
    settings.facebookUrl = facebookUrl !== undefined ? facebookUrl : settings.facebookUrl;
    settings.instagramUrl = instagramUrl !== undefined ? instagramUrl : settings.instagramUrl;
    settings.tiktokUrl = tiktokUrl !== undefined ? tiktokUrl : settings.tiktokUrl;

    let invalidateTokenNeeded = false;

    if (courier && courier.pathao) {
      const sAny = settings as any;
      if (!sAny.courier) {
        sAny.courier = {};
      }
      if (!sAny.courier.pathao) {
        sAny.courier.pathao = {};
      }

      const pReq = courier.pathao;
      const pExisting = sAny.courier.pathao || {};

      if (
        (pReq.enabled !== undefined && pReq.enabled !== pExisting.enabled) ||
        (pReq.baseUrl !== undefined && pReq.baseUrl !== pExisting.baseUrl) ||
        (pReq.clientId !== undefined && pReq.clientId !== pExisting.clientId) ||
        (pReq.username !== undefined && pReq.username !== pExisting.username) ||
        (pReq.storeId !== undefined && pReq.storeId !== pExisting.storeId)
      ) {
        invalidateTokenNeeded = true;
      }

      sAny.courier.pathao.enabled = pReq.enabled !== undefined ? pReq.enabled : pExisting.enabled;
      sAny.courier.pathao.baseUrl = 'https://api-hermes.pathao.com';
      sAny.courier.pathao.clientId = pReq.clientId !== undefined ? pReq.clientId : pExisting.clientId;
      sAny.courier.pathao.username = pReq.username !== undefined ? pReq.username : pExisting.username;
      sAny.courier.pathao.storeId = pReq.storeId !== undefined ? pReq.storeId : pExisting.storeId;

      if (pReq.clientSecret && pReq.clientSecret.trim() !== '' && pReq.clientSecret !== MASKED_SECRET) {
        sAny.courier.pathao.clientSecret = encryptText(pReq.clientSecret.trim());
        invalidateTokenNeeded = true;
      }

      if (pReq.password && pReq.password.trim() !== '' && pReq.password !== MASKED_SECRET) {
        sAny.courier.pathao.password = encryptText(pReq.password);
        invalidateTokenNeeded = true;
      }

      settings.markModified('courier');
    }

    await settings.save();

    if (invalidateTokenNeeded) {
      console.log('[PATHAO] Courier settings updated. Flushing cached Pathao OAuth token...');
      await PathaoToken.deleteMany({});
    }

    const responseSettings: any = settings.toObject();
    if (responseSettings.courier && responseSettings.courier.pathao) {
      const p = responseSettings.courier.pathao;
      const clientSecretConfigured = Boolean(p.clientSecret);
      const passwordConfigured = Boolean(p.password);

      responseSettings.courier.pathao = {
        ...p,
        clientSecret: clientSecretConfigured ? MASKED_SECRET : '',
        password: passwordConfigured ? MASKED_SECRET : '',
        clientSecretConfigured,
        passwordConfigured
      };
    }

    return NextResponse.json({ success: true, settings: responseSettings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
