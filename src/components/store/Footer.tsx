'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';

export default function Footer() {
  const [socials, setSocials] = useState({
    facebookUrl: 'https://facebook.com/forrabix',
    instagramUrl: 'https://instagram.com/forrabix',
    tiktokUrl: 'https://tiktok.com/@forrabix'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiFetch('/settings');
        if (data.success && data.settings) {
          setSocials({
            facebookUrl: data.settings.facebookUrl || 'https://facebook.com/forrabix',
            instagramUrl: data.settings.instagramUrl || 'https://instagram.com/forrabix',
            tiktokUrl: data.settings.tiktokUrl || 'https://tiktok.com/@forrabix'
          });
        }
      } catch (err) {
        console.error('Error fetching settings for footer social links:', err);
      }
    };
    fetchSettings();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cream-light/35 border-t border-primary/10 mt-auto font-sans tracking-wide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* BRAND COLUMN */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="inline-block hover:opacity-85 transition-opacity">
              <img 
                src="/logo.png" 
                alt="FORRABIX Logo" 
                className="h-9 sm:h-11 w-auto object-contain" 
              />
            </Link>
            <p className="text-xs text-primary/70 max-w-xs leading-relaxed">
              Premium minimal apparel for those who move differently. Intentional, raw, and constructed to last.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-primary">Explore</h4>
            <div className="flex flex-col space-y-2 text-xs text-primary/85">
              <Link href="/about" className="hover:text-primary hover:underline transition-all">About FORRABIX</Link>
              <Link href="/contact" className="hover:text-primary hover:underline transition-all">Contact Us</Link>
              <Link href="/delivery-policy" className="hover:text-primary hover:underline transition-all">Delivery Policy</Link>
              <Link href="/return-policy" className="hover:text-primary hover:underline transition-all">Return Policy</Link>
              <Link href="/privacy-policy" className="hover:text-primary hover:underline transition-all">Privacy Policy</Link>
            </div>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="flex flex-col space-y-3">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-primary">Connect</h4>
            <div className="flex space-x-4 text-xs text-primary/85">
              {socials.facebookUrl && (
                <a href={socials.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-all">
                  Facebook
                </a>
              )}
              {socials.instagramUrl && (
                <a href={socials.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-all">
                  Instagram
                </a>
              )}
              {socials.tiktokUrl && (
                <a href={socials.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-all">
                  TikTok
                </a>
              )}
            </div>
            <p className="text-[10px] text-primary/50 pt-2">
              Payment via Cash on Delivery inside Bangladesh.
            </p>
          </div>
        </div>

        {/* COPYRIGHT & DEVELOPER CREDIT */}
        <div className="border-t border-primary/5 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-primary/60 gap-2 sm:gap-0">
          <p>© {currentYear} FORRABIX. All Rights Reserved.</p>
          <p className="text-primary/70">
            Developed by{' '}
            <a 
              href="https://afnanalamanan.dev" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-medium text-primary hover:underline transition-colors"
            >
              Afnan Alam Anan
            </a>
          </p>
          <div className="flex space-x-4">
            <span>Premium E-Commerce</span>
            <Link href="/admin/login" className="hover:underline hover:text-primary">Admin Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
