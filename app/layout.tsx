import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'1337 Football Cup — MVP',description:'MVP voting for the 1337 Football Cup 2026'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
