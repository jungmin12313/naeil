'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, PlusCircle, BarChart2, User } from 'lucide-react';
import { useRegion } from '@/context/RegionContext';

export default function BottomNav() {
    const pathname = usePathname();
    const { selectedDistrict, selectedNeighborhood } = useRegion();

    // Construct the map link dynamically with defaults (Part 1. The Sender)
    const currentDist = selectedDistrict || '북구';
    const currentDong = selectedNeighborhood || '용봉동';
    const mapLink = `/map?district=${currentDist}&neighborhood=${currentDong}`;

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 rounded-t-2xl shadow-lg-up pb-safe">
            <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/' ? 'text-primary' : 'text-gray-400'}`}>
                <Home size={24} />
                <span className="text-[10px] font-medium">홈</span>
            </Link>

            <Link href={mapLink} className={`flex flex-col items-center gap-1 transition-colors ${isActive('/map') ? 'text-primary' : 'text-gray-400'}`}>
                <Map size={24} />
                <span className="text-[10px] font-medium">지도</span>
            </Link>

            <Link href="/stats" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/stats') ? 'text-primary' : 'text-gray-400'}`}>
                <BarChart2 size={24} />
                <span className="text-[10px] font-medium">데이터</span>
            </Link>

            <Link href="/my" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/my') ? 'text-primary' : 'text-gray-400'}`}>
                <User size={24} />
                <span className="text-[10px] font-medium">MY</span>
            </Link>
        </nav>
    );
}
