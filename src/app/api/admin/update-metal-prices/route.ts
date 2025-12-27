import { NextResponse } from 'next/server';
import { updateMetalPrices } from '@/lib/updateMetalPrices';

export async function POST() {
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
