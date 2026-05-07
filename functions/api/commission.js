export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const { name, email, style, text, support, gold, notes } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        { status: 400, headers }
      );
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mtavruli Space <noreply@mtavruli.space>',
        to: [env.CONTACT_EMAIL],   // შენი email
        reply_to: email,
        subject: `✦ Commission Enquiry — ${name}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;padding:32px;background:#1a1208;color:#f4ede0;">
            <h2 style="color:#D4AB5C;margin-bottom:24px;">New Commission Enquiry</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#B8924A;width:130px;">Name</td><td style="padding:8px 0;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#B8924A;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#f4ede0;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#B8924A;">Script style</td><td style="padding:8px 0;">${style || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#B8924A;">Support</td><td style="padding:8px 0;">${support || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#B8924A;">Gilding</td><td style="padding:8px 0;">${gold || '—'}</td></tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:#110e0b;border-left:2px solid #B8924A;">
              <p style="color:#B8924A;font-size:12px;margin-bottom:8px;">TEXT TO BE WRITTEN</p>
              <p style="margin:0;">${text || '—'}</p>
            </div>
            ${notes ? `<div style="margin-top:16px;padding:16px;background:#110e0b;border-left:2px solid #B8924A;"><p style="color:#B8924A;font-size:12px;margin-bottom:8px;">NOTES</p><p style="margin:0;">${notes}</p></div>` : ''}
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Email failed' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true }), { headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// Handle preflight CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
