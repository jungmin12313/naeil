'use client';

import { createContext, useContext, useState, ReactNode, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GWANGJU_LOCATIONS } from '@/lib/gwangju_locations';

// Define the shape of District Data (based on usage)
interface DistrictData {
    name: string;
    neighborhoods: { name: string; lat: number; lng: number }[];
}

interface RegionContextType {
    selectedDistrict: string;
    selectedNeighborhood: string;
    setSelectedDistrict: (district: string) => void;
    setSelectedNeighborhood: (neighborhood: string) => void;
    activeDistrictData: DistrictData | undefined;
    setActiveDistrictData: (data: DistrictData | undefined) => void;
    // Keep aliases for backward compatibility
    setDistrict: (district: string) => void;
    setNeighborhood: (neighborhood: string) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

// 1. Separate Component for URL Sync (Uses useSearchParams)
function RegionURLSync() {
    const searchParams = useSearchParams();
    const { setSelectedDistrict, setActiveDistrictData, setSelectedNeighborhood } = useRegion();

    // ★ CRITICAL: Sync State with URL Params Globally
    useEffect(() => {
        const distParam = searchParams.get('district');
        const dongParam = searchParams.get('neighborhood');

        if (distParam) {
            // 1. Update District
            setSelectedDistrict(distParam);

            // 2. Force Update Active Data
            const distData = GWANGJU_LOCATIONS.find((d) => d.name === distParam);
            setActiveDistrictData(distData);

            // 3. Update Neighborhood
            if (dongParam && distData) {
                const isValidDong = distData.neighborhoods.some(n => n.name === dongParam);
                if (isValidDong) {
                    setSelectedNeighborhood(dongParam);
                } else {
                    if (distData.neighborhoods.length > 0) {
                        setSelectedNeighborhood(distData.neighborhoods[0].name);
                    }
                }
            }
        }
    }, [searchParams, setSelectedDistrict, setActiveDistrictData, setSelectedNeighborhood]);

    return null; // This component renders nothing visual
}

// 2. Main Provider (Always renders Context)
export function RegionProvider({ children }: { children: ReactNode }) {
    // Default State: Back to Buk-gu / Yongbong-dong (User Request)
    const [selectedDistrict, setSelectedDistrict] = useState<string>('북구');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('용봉동');
    const [activeDistrictData, setActiveDistrictData] = useState<DistrictData | undefined>(
        GWANGJU_LOCATIONS.find((d) => d.name === '북구')
    );

    // Aliases
    const setDistrict = (d: string) => {
        setSelectedDistrict(d);
        const distData = GWANGJU_LOCATIONS.find((loc) => loc.name === d);
        setActiveDistrictData(distData);
        // Reset neighborhood when district changes
        setSelectedNeighborhood('');
    };
    const setNeighborhood = (n: string) => setSelectedNeighborhood(n);

    return (
        <RegionContext.Provider value={{
            selectedDistrict,
            setSelectedDistrict,
            selectedNeighborhood,
            setSelectedNeighborhood,
            activeDistrictData,
            setActiveDistrictData,
            setDistrict,
            setNeighborhood
        }}>
            {/* 3. Wrap URL Sync in Suspense so it doesn't block the Provider */}
            <Suspense fallback={null}>
                <RegionURLSync />
            </Suspense>
            {children}
        </RegionContext.Provider>
    );
}

export function useRegion() {
    const context = useContext(RegionContext);
    if (context === undefined) {
        throw new Error('useRegion must be used within a RegionProvider');
    }
    return context;
}
