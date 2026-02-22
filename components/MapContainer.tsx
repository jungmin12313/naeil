'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Minus, Crosshair, MapPin, Edit, Trash2 } from 'lucide-react';

declare global {
    interface Window {
        kakao: any;
    }
}

interface MapContainerProps {
    places: any[];
    onEdit: (place: any) => void;
    initialCenter: { lat: number; lng: number };
    level: number;
    onMapLoad: (map: any) => void;
}

export default function MapContainer({ places, onEdit, initialCenter, level, onMapLoad }: MapContainerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [clusterer, setClusterer] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]); // Keep track of markers to clear them

    // Filters
    const [filterRestroom, setFilterRestroom] = useState(false);
    const [filterParking, setFilterParking] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);

    // Initialize Map
    useEffect(() => {
        if (!window.kakao || !mapRef.current) return;

        window.kakao.maps.load(() => {
            const options = {
                center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
                level: level,
            };
            const mapInstance = new window.kakao.maps.Map(mapRef.current, options);

            // Clusterer
            const clustererInstance = new window.kakao.maps.MarkerClusterer({
                map: mapInstance,
                averageCenter: true,
                minLevel: 6,
            });

            setMap(mapInstance);
            setClusterer(clustererInstance);
            onMapLoad(mapInstance);
            setIsLoading(false);
        });
    }, [initialCenter.lat, initialCenter.lng, level]); // Init once usually, but depend on initial configs

    // Handle Markers & Filtering
    useEffect(() => {
        if (!map || !clusterer) return;

        // Clear existing markers
        if (clusterer) {
            clusterer.clear();
        }
        markers.forEach(m => m.setMap(null));
        setMarkers([]);

        const newMarkers: any[] = [];

        places.forEach((place) => {
            // Filter Logic
            if (filterRestroom && !place.has_restroom) return;
            if (filterParking && !place.has_parking) return;

            const markerPosition = new window.kakao.maps.LatLng(place.lat, place.lng);

            // Marker Image based on Grade
            let imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'; // Default
            if (place.grade === 'GREEN') imageSrc = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
            if (place.grade === 'YELLOW') imageSrc = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png';
            if (place.grade === 'RED') imageSrc = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
            // Size adjustments for leaflet markers if used, or use simple colors

            // Using standard Kakao markers or custom images. 
            // For simplicity/reliability, let's use standard markers but maybe different sprite or just default for now, 
            // OR use the color coding if we can.
            // Let's stick to default blue for now to ensure it works, or try to color code if possible.
            // Actually, let's use simple color dots if possible, but images are easier.
            // Using placeholder colored markers from a CDN is risky if they break.
            // Let's use default markers but rely on InfoWindow for details.

            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                clickable: true,
                // image: markerImage // Optional
            });

            // Click Event
            window.kakao.maps.event.addListener(marker, 'click', () => {
                setSelectedPlace(place);
                // Pan to marker
                map.panTo(markerPosition);
            });

            newMarkers.push(marker);
        });

        // Add to Clusterer
        clusterer.addMarkers(newMarkers);
        setMarkers(newMarkers);

    }, [map, clusterer, places, filterRestroom, filterParking]);

    // Map Controls
    const zoomIn = () => map?.setLevel(map.getLevel() - 1);
    const zoomOut = () => map?.setLevel(map.getLevel() + 1);

    const moveToCurrentLocation = () => {
        if (!map) return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const locPosition = new window.kakao.maps.LatLng(lat, lng);
                    map.panTo(locPosition);
                },
                (err) => {
                    console.error(err);
                    alert('위치 정보를 가져올 수 없습니다.');
                }
            );
        } else {
            alert('위치 정보 사용 불가');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/places?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('삭제되었습니다.');
                window.location.reload(); // Simple reload to refresh data
            } else {
                alert('삭제 실패');
            }
        } catch (e) {
            console.error(e);
            alert('오류 발생');
        }
    };

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
                    <p className="text-lg font-bold text-gray-600">🗺️ 지도 불러오는 중...</p>
                </div>
            )}

            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {/* Filter Buttons */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                <button
                    onClick={() => setFilterRestroom(!filterRestroom)}
                    className={`px-4 py-2 rounded-full font-bold shadow-lg transition-all text-sm flex items-center gap-1
            ${filterRestroom ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                    <span>🚻</span> 화장실 {filterRestroom && '(ON)'}
                </button>
                <button
                    onClick={() => setFilterParking(!filterParking)}
                    className={`px-4 py-2 rounded-full font-bold shadow-lg transition-all text-sm flex items-center gap-1
            ${filterParking ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                    <span>🅿️</span> 주차장 {filterParking && '(ON)'}
                </button>
            </div>

            {/* Map Controls */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10 flex flex-col gap-2">
                <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                    <button onClick={zoomIn} className="p-3 hover:bg-gray-50 border-b border-gray-100">
                        <Plus size={20} className="text-gray-700" />
                    </button>
                    <button onClick={zoomOut} className="p-3 hover:bg-gray-50">
                        <Minus size={20} className="text-gray-700" />
                    </button>
                </div>
                <button onClick={moveToCurrentLocation} className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 text-blue-600">
                    <Crosshair size={20} />
                </button>
            </div>

            {/* Info Window (Bottom Sheet Style) */}
            {selectedPlace && (
                <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl z-20 p-5 animate-slide-up">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{selectedPlace.name}</h3>
                            <p className="text-sm text-gray-500">{selectedPlace.address}</p>
                        </div>
                        <button onClick={() => setSelectedPlace(null)} className="text-gray-400 p-1">
                            <Plus size={24} className="transform rotate-45" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold 
                            ${selectedPlace.grade === 'GREEN' ? 'bg-green-100 text-green-700' :
                                selectedPlace.grade === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {selectedPlace.grade} 등급
                        </span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-600">{selectedPlace.ramp}</span>
                    </div>

                    <div className="flex gap-2 mb-4 overflow-x-auto">
                        {selectedPlace.images && selectedPlace.images.length > 0 ? (
                            selectedPlace.images.map((img: any, i: number) => (
                                <img key={i} src={img.url} alt="Place" className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                            ))
                        ) : selectedPlace.image_url ? (
                            <img src={selectedPlace.image_url} alt="Place" className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                        ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">No Image</div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(selectedPlace)}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        >
                            <Edit size={16} /> 수정
                        </button>
                        <button
                            onClick={() => handleDelete(selectedPlace.id)}
                            className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} /> 삭제
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
