import {NextRequest} from 'next/server';
import {getSession} from './session';
import {adminLogins} from './config';
export async function requireSession(){const s=await getSession();if(!s)throw new Error('UNAUTHORIZED');return s;}
export async function requireAdmin(){const s=await requireSession();if(!adminLogins().includes(s.login.toLowerCase()))throw new Error('FORBIDDEN');return s;}
export function assertSameOrigin(req:NextRequest){const o=req.headers.get('origin');if(o&&o!==new URL(req.url).origin)throw new Error('BAD_ORIGIN');}
