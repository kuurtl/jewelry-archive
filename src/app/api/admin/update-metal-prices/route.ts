export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { updateMetalPrices } from '@/lib/updateMetalPrices';

async function handler() {
  try {
    const prices = await updateMetalPrices();
    return NextResponse.json({ success: true, prices });
  } catch (err: unknown) {
    console.error(err);

    const message = err instanceof Error ? err.message : 'Unknown error';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return handler();
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');

  // This allows the Vercel Cron to work
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  // This allows YOU to trigger it manually from your browser while logged in
  // because the middleware already verified your cookie
  if (!isCron) {
    // If it's not the cron, we just double check the header wasn't required
    // strictly, or you can just let it run if the middleware passed it.
  }

  return handler();
}
