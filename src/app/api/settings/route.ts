import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WebsiteSettings } from '@/models/WebsiteSettings';

export async function GET() {
  try {
    await connectDB();
    let settingsDoc = await WebsiteSettings.findOne();
    if (!settingsDoc) {
      settingsDoc = new WebsiteSettings({
        logo: '',
        favicon: '',
        businessPhone: '+8801700000000',
        whatsappNumber: '+8801700000000',
        supportEmail: 'support@forrabix.com',
        facebookUrl: 'https://facebook.com/forrabix',
        instagramUrl: 'https://instagram.com/forrabix',
        tiktokUrl: 'https://tiktok.com/@forrabix'
      });
    }

    const settingsObj: any = settingsDoc.toObject();

    if (settingsObj.courier && settingsObj.courier.pathao) {
      delete settingsObj.courier.pathao.clientSecret;
      delete settingsObj.courier.pathao.password;
      delete settingsObj.courier.pathao.username;
      delete settingsObj.courier.pathao.clientId;
    }

    return NextResponse.json({ success: true, settings: settingsObj });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
