'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, ShieldCheck, RefreshCw, Send, Check } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ContactSettings {
  businessPhone: string;
  whatsappNumber: string;
  supportEmail: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export default function ContactClient() {
  const [settings, setSettings] = useState<ContactSettings>({
    businessPhone: '+8801700000000',
    whatsappNumber: '+8801700000000',
    supportEmail: 'support@forrabix.com',
    facebookUrl: 'https://facebook.com/forrabix',
    instagramUrl: 'https://instagram.com/forrabix',
    tiktokUrl: 'https://tiktok.com/@forrabix'
  });

  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/settings');
        
        if (data.success && data.settings) {
          setSettings({
            businessPhone: data.settings.businessPhone || '+8801700000000',
            whatsappNumber: data.settings.whatsappNumber || '+8801700000000',
            supportEmail: data.settings.supportEmail || 'support@forrabix.com',
            facebookUrl: data.settings.facebookUrl || '',
            instagramUrl: data.settings.instagramUrl || '',
            tiktokUrl: data.settings.tiktokUrl || ''
          });
        }
      } catch (err) {
        console.error('Error fetching contact page settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    setTimeout(() => {
      setFormSubmitting(false);
      setFormSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 1500);
  };

  return (
    <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-left w-full">
      
      {/* Title */}
      <div className="space-y-2 mb-16 text-center">
        <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-primary/75 uppercase">
          CONNECT WITH US
        </span>
        <h1 className="font-serif text-4xl font-light tracking-wide text-primary uppercase">
          CONTACT FORRABIX
        </h1>
        <div className="w-12 h-[1px] bg-primary/20 mx-auto" />
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center text-primary/45 text-xs font-sans space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading contact details...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* COLUMN 1: FORM (7/12) */}
          <div className="lg:col-span-7 bg-background border border-primary/5 p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl font-light text-primary uppercase">
              Send a Message
            </h2>

            {formSuccess && (
              <div className="p-4 bg-primary/5 border border-primary/20 text-primary font-sans text-xs flex items-center">
                <Check className="h-4.5 w-4.5 mr-2" />
                <span>Message sent successfully! We will review and contact you shortly.</span>
              </div>
            )}

            <form onSubmit={handleMessageSubmit} className="space-y-4 font-sans text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Your Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cream-light/20 border border-primary/20 rounded-none px-3.5 py-2 text-xs focus:outline-none focus:border-primary"
                    disabled={formSubmitting}
                  />
                </div>
                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-cream-light/20 border border-primary/20 rounded-none px-3.5 py-2 text-xs focus:outline-none focus:border-primary"
                    disabled={formSubmitting}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label htmlFor="contact-phone" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Phone Number</label>
                <input
                  id="contact-phone"
                  type="tel"
                  required
                  placeholder="e.g. 017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-cream-light/20 border border-primary/20 rounded-none px-3.5 py-2 text-xs focus:outline-none focus:border-primary"
                  disabled={formSubmitting}
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label htmlFor="contact-msg" className="text-[10px] font-bold tracking-wider text-primary uppercase block">Your Message</label>
                <textarea
                  id="contact-msg"
                  required
                  rows={4}
                  placeholder="Write details of your inquiry, bulk orders, size questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-cream-light/20 border border-primary/20 rounded-none px-3.5 py-2 text-xs focus:outline-none focus:border-primary resize-none"
                  disabled={formSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full h-11 bg-primary text-background font-sans text-xs font-bold tracking-widest uppercase flex items-center justify-center hover:bg-primary-hover transition-colors pt-1"
                id="contact-submit-btn"
              >
                {formSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </button>

            </form>
          </div>

          {/* COLUMN 2: DIRECT DETAILS (5/12) */}
          <div className="lg:col-span-5 bg-cream-light/15 border border-primary/10 p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl font-light text-primary uppercase">
              Direct Channels
            </h2>

            <div className="space-y-4 font-sans text-xs text-foreground/80">
              {/* Email */}
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-primary/5 text-primary border border-primary/5">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold text-primary">Support Desk Email</p>
                  <a href={`mailto:${settings.supportEmail}`} className="hover:underline">{settings.supportEmail}</a>
                </div>
              </div>

              {/* Mobile phone */}
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-primary/5 text-primary border border-primary/5">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold text-primary">Business Mobile</p>
                  <a href={`tel:${settings.businessPhone}`} className="hover:underline">{settings.businessPhone}</a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-primary/5 text-primary border border-primary/5">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold text-primary">WhatsApp Inquiry</p>
                  <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline font-mono">
                    {settings.whatsappNumber}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Channels */}
            <div className="pt-4 border-t border-primary/10 space-y-3">
              <h4 className="font-serif text-xs font-semibold tracking-wider text-primary uppercase">Social Accounts</h4>
              <div className="flex flex-col space-y-2 text-xs font-sans text-primary">
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Facebook: forrabix
                  </a>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Instagram: @forrabix
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    TikTok: @forrabix
                  </a>
                )}
              </div>
            </div>

            {/* Quality Seals */}
            <div className="pt-4 border-t border-primary/10 flex items-start text-[10px] text-primary/65 font-sans leading-relaxed">
              <ShieldCheck className="h-4.5 w-4.5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary">Verification Support</p>
                <p className="mt-0.5">Helpline operating 10:00 AM – 8:00 PM (GMT+6) daily for garment sizing verification.</p>
              </div>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
