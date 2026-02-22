'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        kakao: any;
    }
}

interface LocationPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);

    // Initial Map Setup
    useEffect(() => {
        if (!window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            const container = mapRef.current;
            const options = {
                center: new window.kakao.maps.LatLng(lat || 37.5665, lng || 126.9780),
                level: 3,
            };
            const kakaoMap = new window.kakao.maps.Map(container, options);
            setMap(kakaoMap);

            // Removed draggable marker logic.
            // Instead, we listen for map movement.

            // Event: Drag end (User finished moving map) -> Update Reference
            window.kakao.maps.event.addListener(kakaoMap, 'dragend', function () {
                const center = kakaoMap.getCenter();
                // Update parent state with new center
                onChange(center.getLat(), center.getLng());
            });

            // Optional: If you want smooth updates while checking (might be too frequent),
            // or just rely on dragend for the actual data commit.
            // 'center_changed' fires continuously. 'dragend' is better for form state.
        });
    }, []);

    // Sync map center if props change externally (e.g. "Current Location" button clicked)
    useEffect(() => {
        if (!map) return;

        const currentCenter = map.getCenter();
        const latDiff = Math.abs(currentCenter.getLat() - lat);
        const lngDiff = Math.abs(currentCenter.getLng() - lng);

        // Only pan if the difference is significant (to avoid jitter loops)
        // This threshold handles floating point minor differences
        if (latDiff > 0.0001 || lngDiff > 0.0001) {
            const newCenter = new window.kakao.maps.LatLng(lat, lng);
            map.setCenter(newCenter);
        }
    }, [lat, lng, map]);

    return (
        <div className="w-full h-64 rounded-xl border border-gray-300 overflow-hidden relative group">
            <div ref={mapRef} className="w-full h-full" />

            {/* Fixed Center Pin Logic */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none -mt-4">
                <div className="flex flex-col items-center animate-bounce">
                    <span className="text-4xl filter drop-shadow-lg">📍</span>
                    <div className="w-2 h-1 bg-black/20 rounded-full blur-[1px] mt-[-2px]"></div>
                </div>
            </div>

            {/* Helper Text Overlay */}
            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                    지도를 움직여 위치를 맞추세요
                </span>
            </div>
        </div>
    );
}
