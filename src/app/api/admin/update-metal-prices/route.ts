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

export async function POST() {
  return handler();
}

export async function GET() {
  return handler();
}
