import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the contact request (replace with email service in production)
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      product: data.product || '',
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@tiptobv.be',
    //   to: 'info@tiptobv.be',
    //   subject: `Nieuwe offerte aanvraag van ${data.name}`,
    //   html: `...`,
    // });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
