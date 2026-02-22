import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Providers from './providers';
import { RegionProvider } from '@/context/RegionContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Barrier-free Map',
    description: 'Map for accessible places',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className={inter.className}>
                <Script
                    src="//dapi.kakao.com/v2/maps/sdk.js?appkey=51185183d2c42640edb524d23b7b9fac&libraries=services,clusterer&autoload=false"
                    strategy="beforeInteractive"
                />
                <Providers>
                    <RegionProvider>
                        {children}
                    </RegionProvider>
                </Providers>
            </body>
        </html>
    );
}
