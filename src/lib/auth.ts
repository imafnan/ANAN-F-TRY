import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import { Admin } from '@/models/Admin';

export interface AdminTokenPayload {
  id: string;
}

export function generateAdminToken(id: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing from environment variables');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
  });
}

export async function verifyAdminSession(req: NextRequest): Promise<{ admin: any; errorResponse?: NextResponse }> {
  await connectDB();

  let token = req.cookies.get('token')?.value;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return {
      admin: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Not authorized to access this resource' },
        { status: 401 }
      ),
    };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return {
      admin: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Server configuration error: JWT_SECRET missing' },
        { status: 500 }
      ),
    };
  }

  try {
    const decoded = jwt.verify(token, secret) as AdminTokenPayload;
    const admin = await Admin.findById(decoded.id).select('-password').lean();

    if (!admin) {
      return {
        admin: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'Admin session not found or invalid' },
          { status: 401 }
        ),
      };
    }

    return { admin };
  } catch {
    return {
      admin: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Not authorized, session token invalid or expired' },
        { status: 401 }
      ),
    };
  }
}

export async function seedDefaultAdmin(): Promise<void> {
  try {
    await connectDB();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@forrabix.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('[SEED] ADMIN_EMAIL or ADMIN_PASSWORD not set in environment. Skipping default admin seed.');
      return;
    }

    const admins = await Admin.find({});
    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await Admin.create({
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`[SEED] Default admin created with email: "${adminEmail}"`);
    } else {
      for (const adminDoc of admins) {
        const isMatch = await bcrypt.compare(adminPassword, adminDoc.password);
        if (!isMatch) {
          adminDoc.password = await bcrypt.hash(adminPassword, 10);
          await adminDoc.save();
          console.log(`[SEED] Updated password hash for admin: "${adminDoc.email}"`);
        }
      }
    }
  } catch (error) {
    console.error('[SEED] Error seeding default admin:', error);
  }
}
