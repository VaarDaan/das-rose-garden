import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys missing from environment');
            return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
        }

        const { amount, receipt } = await req.json();

        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // convert to paise
                currency: 'INR',
                receipt,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Razorpay Error:', data);
            return NextResponse.json({ error: 'Failed to create Razorpay order', details: data }, { status: response.status });
        }

        return NextResponse.json({
            id: data.id,
            currency: data.currency,
            amount: data.amount
        });
    } catch (error: any) {
        console.error('Razorpay exception:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
