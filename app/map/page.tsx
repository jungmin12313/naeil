'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Map, ZoomControl } from 'react-kakao-maps-sdk';
import { useRegion } from '@/context/RegionContext';
import RegionSelector from '@/components/RegionSelector';
import BottomNav from '@/components/BottomNav';
import MarkerCluster from '@/components/MarkerCluster';
import POIDetailCard from '@/components/POIDetailCard';
import { useSession } from 'next-auth/react';

function MapContent() {
    const { selectedDistrict, selectedNeighborhood, activeDistrictData, setDistrict, setNeighborhood } = useRegion();
    const [map, setMap] = useState<any>(null);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    const { data: session } = useSession();
    const router = useRouter();

    // Load Reports
    useEffect(() => {
        // Wait for map to be ready or just fetch immediately
        async function fetchReports() {
            try {
                const query = new URLSearchParams();
                if (selectedDistrict) query.set('district', selectedDistrict);
                if (selectedNeighborhood) query.set('neighborhood', selectedNeighborhood);

                const res = await fetch(`/api/reports?${query.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setReports(data);
                }
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            }
        }
        fetchReports();
    }, [selectedDistrict, selectedNeighborhood]);

    // Sync Map Center when Region changes
    useEffect(() => {
        if (map && selectedNeighborhood && activeDistrictData) {
            const targetDong = activeDistrictData.neighborhoods.find(n => n.name === selectedNeighborhood);
            if (targetDong) {
                const moveLatLon = new window.kakao.maps.LatLng(targetDong.lat, targetDong.lng);
                map.panTo(moveLatLon);
            }
        }
    }, [map, selectedNeighborhood, activeDistrictData]);

    return (
        <div className="w-full h-screen relative overflow-hidden">
            {/* Region Selector Overlay */}
            <div className="absolute top-4 left-0 right-0 z-10 px-4 flex justify-center pointer-events-none">
                <div className="pointer-events-auto">
                    <RegionSelector
                        variant="floating" // Assuming floating variant exists or falls back
                        selectedDistrict={selectedDistrict}
                        selectedNeighborhood={selectedNeighborhood}
                        onDistrictChange={setDistrict}
                        onNeighborhoodChange={setNeighborhood}
                    />
                </div>
            </div>

            {/* Kakao Map */}
            <Map
                center={{ lat: 35.1765, lng: 126.9135 }}
                style={{ width: "100%", height: "100%" }}
                level={4}
                onCreate={setMap}
            >
                <ZoomControl position={"RIGHT"} />

                {/* New Marker System */}
                <MarkerCluster
                    reports={reports}
                    onMarkerClick={setSelectedReport}
                />
            </Map>

            {/* Floating Report Button */}
            <div className="absolute bottom-24 right-4 z-20">
                <button
                    onClick={() => router.push('/report')}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg font-bold flex items-center justify-center hover:bg-blue-700 transition transform hover:scale-105"
                >
                    📷 제보하기
                </button>
            </div>

            {/* POI Detail Card (Bottom Sheet) */}
            {selectedReport && (
                <POIDetailCard
                    poi={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}

            <BottomNav />
        </div>
    );
}

export default function MapPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Map...</div>}>
            <MapContent />
        </Suspense>
    );
}
