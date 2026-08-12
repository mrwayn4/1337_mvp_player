import {NextRequest, NextResponse} from 'next/server';
import {createSession} from '../../../../../lib/session';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const saved = req.cookies.get('oauth_state')?.value;

  if (!code || !state || !saved || state !== saved) {
    return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 400 });
  }

  const clientId = process.env.FORTYTWO_CLIENT_ID || '';
  const clientSecret = process.env.FORTYTWO_CLIENT_SECRET || '';
  const redirectUri = process.env.FORTYTWO_REDIRECT_URI || '';

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch('https://api.intra.42.fr/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body,
    cache: 'no-store',
  });

  const token = await tokenRes.json();
  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'Could not exchange 42 code', details: token }, { status: 502 });
  }

  const meRes = await fetch('https://api.intra.42.fr/v2/me', {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: 'no-store',
  });

  if (!meRes.ok) {
    return NextResponse.json({ error: 'Could not fetch 42 profile', status: meRes.status }, { status: 502 });
  }

  const me = await meRes.json();
  await createSession({
    id: Number(me.id),
    login: String(me.login),
    displayname: String(me.displayname || me.login),
    imageUrl: me.image_url ? String(me.image_url) : undefined,
  });

  const r = NextResponse.redirect(new URL('/', req.url));
  r.cookies.delete('oauth_state');
  return r;
}

