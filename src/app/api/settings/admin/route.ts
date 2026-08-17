import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { verifyAdminSession } from '@/lib/auth';

const MASKED_SECRET = '************';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = await verifyAdminSession(req);
    if (errorResponse) return errorResponse;

    await connectDB();
    let settingsDoc = await WebsiteSettings.findOne();
    if (!settingsDoc) {
      settingsDoc = new WebsiteSettings();
      await settingsDoc.save();
    }

    const settingsObj: any = settingsDoc.toObject();

    if (settingsObj.courier && settingsObj.courier.pathao) {
      const p = settingsObj.courier.pathao;
      const clientSecretConfigured = Boolean(p.clientSecret);
      const passwordConfigured = Boolean(p.password);

      settingsObj.courier.pathao = {
        ...p,
        clientSecret: clientSecretConfigured ? MASKED_SECRET : '',
        password: passwordConfigured ? MASKED_SECRET : '',
        clientSecretConfigured,
        passwordConfigured
      };
    } else {
      settingsObj.courier = {
        pathao: {
          enabled: false,
          baseUrl: 'https://api-hermes.pathao.com',
          clientId: '',
          clientSecret: '',
          username: '',
          password: '',
          storeId: '',
          clientSecretConfigured: false,
          passwordConfigured: false
        }
      };
    }

    return NextResponse.json({ success: true, settings: settingsObj });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
