import {SignJWT,jwtVerify} from 'jose';
import {cookies} from 'next/headers';
const COOKIE='mvp_session';
const secret=new TextEncoder().encode(process.env.SESSION_SECRET||'dev-secret-change-me');
export type Session={id:number;login:string;displayname:string;imageUrl?:string};
export async function createSession(s:Session){const token=await new SignJWT(s as any).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret);cookies().set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800});}
export async function getSession():Promise<Session|null>{const token=cookies().get(COOKIE)?.value;if(!token)return null;try{const {payload}=await jwtVerify(token,secret);return{id:Number(payload.id),login:String(payload.login),displayname:String(payload.displayname),imageUrl:payload.imageUrl?String(payload.imageUrl):undefined};}catch{return null;}}
export function destroySession(){cookies().delete(COOKIE)}
