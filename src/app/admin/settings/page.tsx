'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Save,
  RefreshCw,
  AlertCircle,
  Phone,
  MessageSquare,
  Mail,
  Link as LinkIcon,
  Truck,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Brand Form Fields
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  // Courier Form Fields (Pathao)
  const [courierEnabled, setCourierEnabled] = useState(false);
  const [pathaoBaseUrl, setPathaoBaseUrl] = useState('https://api-hermes.pathao.com');
  const [pathaoClientId, setPathaoClientId] = useState('');
  const [pathaoClientSecret, setPathaoClientSecret] = useState('');
  const [pathaoClientSecretConfigured, setPathaoClientSecretConfigured] = useState(false);
  const [pathaoUsername, setPathaoUsername] = useState('');
  const [pathaoPassword, setPathaoPassword] = useState('');
  const [pathaoPasswordConfigured, setPathaoPasswordConfigured] = useState(false);
  const [pathaoStoreId, setPathaoStoreId] = useState('');

  // Secret Visibility Toggles
  const [showSecret, setShowSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Test Connection State
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    authStatus: string;
    storeStatus: string;
    message: string;
  } | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiFetch('/settings/admin');
      
      if (data.success && data.settings) {
        const s = data.settings;
        setLogo(s.logo || '');
        setFavicon(s.favicon || '');
        setBusinessPhone(s.businessPhone || '');
        setWhatsappNumber(s.whatsappNumber || '');
        setSupportEmail(s.supportEmail || '');
        setFacebookUrl(s.facebookUrl || '');
        setInstagramUrl(s.instagramUrl || '');
        setTiktokUrl(s.tiktokUrl || '');

        if (s.courier && s.courier.pathao) {
          const p = s.courier.pathao;
          setCourierEnabled(Boolean(p.enabled));
          setPathaoBaseUrl(p.baseUrl || 'https://api-hermes.pathao.com');
          setPathaoClientId(p.clientId || '');
          setPathaoClientSecret(p.clientSecret || '');
          setPathaoClientSecretConfigured(Boolean(p.clientSecretConfigured));
          setPathaoUsername(p.username || '');
          setPathaoPassword(p.password || '');
          setPathaoPasswordConfigured(Boolean(p.passwordConfigured));
          setPathaoStoreId(p.storeId || '');
        }
      } else {
        setError('Failed to fetch website settings.');
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Connection failure. Unable to pull settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    const payload = {
      logo,
      favicon,
      businessPhone: businessPhone.trim(),
      whatsappNumber: whatsappNumber.trim(),
      supportEmail: supportEmail.trim(),
      facebookUrl: facebookUrl.trim(),
      instagramUrl: instagramUrl.trim(),
      tiktokUrl: tiktokUrl.trim(),
      courier: {
        pathao: {
          enabled: courierEnabled,
          baseUrl: 'https://api-hermes.pathao.com',
          clientId: pathaoClientId.trim(),
          clientSecret: pathaoClientSecret,
          username: pathaoUsername.trim(),
          password: pathaoPassword,
          storeId: pathaoStoreId.trim()
        }
      }
    };

    try {
      const data = await apiFetch('/settings/admin/update', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (data.success) {
        setSuccess('Website & Courier settings updated successfully.');
        fetchSettings(); // Refresh from server
      } else {
        setError(data.message || 'Failed to save settings details');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Connection error. Unable to save changes.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    setError('');

    const testPayload = {
      baseUrl: 'https://api-hermes.pathao.com',
      clientId: pathaoClientId.trim(),
      clientSecret: pathaoClientSecret,
      username: pathaoUsername.trim(),
      password: pathaoPassword,
      storeId: pathaoStoreId.trim()
    };

    try {
      const data = await apiFetch('/admin/pathao/test-connection', {
        method: 'POST',
        body: JSON.stringify(testPayload)
      });

      setTestResult({
        success: Boolean(data.success),
        authStatus: data.authStatus || (data.success ? 'Connected' : 'Failed'),
        storeStatus: data.storeStatus || 'Unverified',
        message: data.message || (data.success ? 'Pathao Connection Successful' : 'Pathao Connection Failed')
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        authStatus: 'Failed',
        storeStatus: 'Unverified',
        message: err.message || 'Pathao authentication test failed.'
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-primary/40 font-sans text-xs flex items-center justify-center space-x-2">
        <RefreshCw className="h-5 w-5 animate-spin" />
        <span>Synchronizing Website Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans max-w-4xl pb-12">
      
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-light text-primary">ADMIN SETTINGS</h1>
        <p className="text-[10px] text-primary/60 tracking-wider uppercase font-semibold mt-0.5">
          Configure website identity, contact channels, and Pathao Courier integration
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0 text-emerald-600" />
          {success}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="border border-primary/10 bg-cream-light/5 p-6 space-y-8 text-left">
        
        {/* SECTION 1: IDENTITY */}
        <div className="space-y-4">
          <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase border-b border-primary/10 pb-1">
            Brand Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logo Text */}
            <div className="space-y-1">
              <label htmlFor="settings-logo" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Brand Logo Name</label>
              <input
                id="settings-logo"
                type="text"
                placeholder="FORRABIX"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                disabled={actionLoading}
              />
            </div>
            {/* Favicon URL */}
            <div className="space-y-1">
              <label htmlFor="settings-fav" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Favicon Asset URL</label>
              <input
                id="settings-fav"
                type="text"
                placeholder="e.g. /favicon.ico"
                value={favicon}
                onChange={(e) => setFavicon(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                disabled={actionLoading}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CHANNELS */}
        <div className="space-y-4">
          <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase border-b border-primary/10 pb-1">
            Contact Channels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Business Phone */}
            <div className="space-y-1">
              <label htmlFor="settings-phone" className="text-[10px] font-bold tracking-wider text-primary uppercase block flex items-center">
                <Phone className="h-3 w-3 mr-1 text-primary" /> Business Phone
              </label>
              <input
                id="settings-phone"
                type="text"
                required
                placeholder="+88017XXXXXXXX"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary font-medium"
                disabled={actionLoading}
              />
            </div>
            {/* WhatsApp Phone */}
            <div className="space-y-1">
              <label htmlFor="settings-wa" className="text-[10px] font-bold tracking-wider text-primary uppercase block flex items-center">
                <MessageSquare className="h-3 w-3 mr-1 text-primary" /> WhatsApp Phone
              </label>
              <input
                id="settings-wa"
                type="text"
                required
                placeholder="+88017XXXXXXXX"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary font-medium"
                disabled={actionLoading}
              />
            </div>
            {/* Support Email */}
            <div className="space-y-1">
              <label htmlFor="settings-email" className="text-[10px] font-bold tracking-wider text-primary uppercase block flex items-center">
                <Mail className="h-3 w-3 mr-1 text-primary" /> Support Email
              </label>
              <input
                id="settings-email"
                type="email"
                required
                placeholder="support@forrabix.com"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                disabled={actionLoading}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SOCIAL HANDLES */}
        <div className="space-y-4">
          <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase border-b border-primary/10 pb-1">
            Social Accounts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Facebook */}
            <div className="space-y-1">
              <label htmlFor="settings-fb" className="text-[10px] font-bold tracking-wider text-primary uppercase block flex items-center">
                <LinkIcon className="h-3 w-3 mr-1 text-primary" /> Facebook URL
              </label>
              <input
                id="settings-fb"
                type="url"
                placeholder="https://facebook.com/..."
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                disabled={actionLoading}
              />
            </div>
            {/* Instagram */}
            <div className="space-y-1">
              <label htmlFor="settings-ig" className="text-[10px] font-bold tracking-wider text-primary uppercase block flex items-center">
                <LinkIcon className="h-3 w-3 mr-1 text-primary" /> Instagram URL
              </label>
              <input
                id="settings-ig"
                type="url"
                placeholder="https://instagram.com/..."
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                disabled={actionLoading}
              />
            </div>
            {/* TikTok */}
            <div className="space-y-1">
              <label htmlFor="settings-tt" className="text-[10px] font-bold tracking-wider text-primary uppercase block flex items-center">
                <LinkIcon className="h-3 w-3 mr-1 text-primary" /> TikTok URL
              </label>
              <input
                id="settings-tt"
                type="url"
                placeholder="https://tiktok.com/@..."
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                disabled={actionLoading}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: COURIER INTEGRATION - PATHAO */}
        <div className="space-y-5 pt-4 border-t border-primary/10">
          <div className="flex items-center justify-between border-b border-primary/10 pb-2">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-primary" />
              <h3 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">
                Courier Integration — Pathao Production Settings
              </h3>
            </div>
            
            {/* Enable Toggle */}
            <label htmlFor="courier-enable-toggle" className="flex items-center cursor-pointer space-x-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-primary/70">Integration</span>
              <input
                id="courier-enable-toggle"
                type="checkbox"
                checked={courierEnabled}
                onChange={(e) => setCourierEnabled(e.target.checked)}
                className="h-4 w-4 rounded-none text-primary focus:ring-primary accent-primary cursor-pointer"
                disabled={actionLoading}
              />
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 ${courierEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                {courierEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Base URL (Production API Only) */}
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label htmlFor="pathao-base-url" className="text-[10px] font-bold tracking-wider text-primary uppercase block">
                Production API Base URL
              </label>
              <input
                id="pathao-base-url"
                type="url"
                readOnly
                value="https://api-hermes.pathao.com"
                className="w-full bg-primary/5 border border-primary/20 rounded-none px-3 py-2 text-xs font-mono text-[11px] text-primary/70 cursor-not-allowed"
              />
            </div>

            {/* Client ID */}
            <div className="space-y-1">
              <label htmlFor="pathao-client-id" className="text-[10px] font-bold tracking-wider text-primary uppercase block">
                Client ID
              </label>
              <input
                id="pathao-client-id"
                type="text"
                placeholder="e.g. M7e5AKRe2v"
                value={pathaoClientId}
                onChange={(e) => setPathaoClientId(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                disabled={actionLoading}
              />
            </div>

            {/* Client Secret (Encrypted at Rest) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="pathao-client-secret" className="text-[10px] font-bold tracking-wider text-primary uppercase block flex items-center">
                  <KeyRound className="h-3 w-3 mr-1 text-primary/70" /> Client Secret
                </label>
                {pathaoClientSecretConfigured && (
                  <span className="text-[9px] font-bold tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 uppercase flex items-center">
                    <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Configured
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="pathao-client-secret"
                  type={showSecret ? "text" : "password"}
                  placeholder={pathaoClientSecretConfigured ? "Leave blank to keep existing secret" : "Enter Pathao Client Secret"}
                  value={pathaoClientSecret}
                  onChange={(e) => setPathaoClientSecret(e.target.value)}
                  className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono pr-8"
                  disabled={actionLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2 top-1.5 text-primary/50 hover:text-primary"
                  title={showSecret ? "Hide Secret" : "Show Secret"}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Merchant Email / Username */}
            <div className="space-y-1">
              <label htmlFor="pathao-username" className="text-[10px] font-bold tracking-wider text-primary uppercase block">
                Merchant Email / Username
              </label>
              <input
                id="pathao-username"
                type="text"
                placeholder="merchant@example.com"
                value={pathaoUsername}
                onChange={(e) => setPathaoUsername(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary"
                disabled={actionLoading}
              />
            </div>

            {/* Password (Encrypted at Rest) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="pathao-password" className="text-[10px] font-bold tracking-wider text-primary uppercase block flex items-center">
                  <KeyRound className="h-3 w-3 mr-1 text-primary/70" /> Password
                </label>
                {pathaoPasswordConfigured && (
                  <span className="text-[9px] font-bold tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 uppercase flex items-center">
                    <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Configured
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="pathao-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={pathaoPasswordConfigured ? "Leave blank to keep existing password" : "Enter Pathao Password"}
                  value={pathaoPassword}
                  onChange={(e) => setPathaoPassword(e.target.value)}
                  className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono pr-8"
                  disabled={actionLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1.5 text-primary/50 hover:text-primary"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Store ID */}
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label htmlFor="pathao-store-id" className="text-[10px] font-bold tracking-wider text-primary uppercase block">
                Merchant Store ID
              </label>
              <input
                id="pathao-store-id"
                type="text"
                placeholder="e.g. 388352"
                value={pathaoStoreId}
                onChange={(e) => setPathaoStoreId(e.target.value)}
                className="w-full bg-background border border-primary/20 rounded-none px-3 py-2 text-xs focus:outline-none focus:border-primary font-mono"
                disabled={actionLoading}
              />
            </div>
          </div>

          {/* Connection Test Output Card */}
          {testResult && (
            <div className={`p-4 border text-xs space-y-2 ${testResult.success ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-red-50/70 border-red-200 text-red-900'}`}>
              <div className="flex items-center justify-between font-bold uppercase text-[10px] tracking-wider border-b pb-1.5 border-current/10">
                <span className="flex items-center">
                  {testResult.success ? <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" /> : <XCircle className="h-4 w-4 mr-1.5 text-red-600" />}
                  Connection Test Result
                </span>
                <span>{testResult.success ? 'PASSED' : 'FAILED'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="font-semibold text-primary/70 block uppercase text-[9px]">Authentication:</span>
                  <span className={`font-mono font-bold ${testResult.authStatus === 'Connected' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {testResult.authStatus}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-primary/70 block uppercase text-[9px]">Store ID Verification:</span>
                  <span className={`font-mono font-bold ${testResult.storeStatus === 'Verified' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {testResult.storeStatus}
                  </span>
                </div>
              </div>
              <p className="text-[11px] pt-1 border-t border-current/10 font-medium leading-relaxed">
                {testResult.message}
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={actionLoading || testLoading}
            className="w-full sm:w-auto bg-background border border-primary text-primary px-6 py-2.5 text-xs font-bold tracking-widest hover:bg-primary/5 transition-colors uppercase flex items-center justify-center"
            id="test-pathao-connection-btn"
          >
            {testLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin text-primary" />
            ) : (
              <Activity className="h-4 w-4 mr-2 text-primary" />
            )}
            Test Pathao Connection
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto bg-primary text-background px-8 py-3 text-xs font-bold tracking-widest hover:bg-primary-hover transition-colors uppercase flex items-center justify-center"
            disabled={actionLoading || testLoading}
            id="settings-save-submit"
          >
            {actionLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </button>
        </div>

      </form>

    </div>
  );
}
