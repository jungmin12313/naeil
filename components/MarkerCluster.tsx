'use client';
import { MapMarker, CustomOverlayMap, useMap } from 'react-kakao-maps-sdk';
import { getMarkerType } from '@/lib/markerUtils';
import type { Report } from '@prisma/client';

interface MarkerClusterProps {
    reports: unknown[]; // Using unknown[] temporarily to avoid strict Report check if type not fully generated yet
    onMarkerClick: (report: any) => void;
}

export default function MarkerCluster({ reports, onMarkerClick }: MarkerClusterProps) {
    return (
        <>
            {(reports as Report[]).map((report) => {
                const config = getMarkerType(report);

                return (
                    <div key={report.id}>
                        {/* 1. Base Marker */}
                        <MapMarker
                            position={{ lat: report.latitude, lng: report.longitude }}
                            image={{
                                src: config.type === 'ALPHA'
                                    ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png' // Placeholder for Alpha
                                    : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png',   // Placeholder for Normal
                                size: { width: 24, height: 35 },
                                options: {
                                    // opacity: config.opacity // Kakao Marker Image options might not support opacity directly this way
                                }
                            }}
                            onClick={() => onMarkerClick(report)}
                            zIndex={config.zIndex}
                            opacity={config.opacity} // MapMarker supports opacity prop
                        />

                        {/* 2. Glow Effect (Custom Overlay) */}
                        {config.hasPulse && (
                            <CustomOverlayMap
                                position={{ lat: report.latitude, lng: report.longitude }}
                                yAnchor={0.5}
                                zIndex={config.zIndex - 1} // Behind the marker
                            >
                                <div className="relative">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-400 rounded-full opacity-40 blur-sm"></div>
                                </div>
                            </CustomOverlayMap>
                        )}

                        {/* 3. Quest Badge (Example logic for later) */}
                        {config.type === 'QUEST' && (
                            <CustomOverlayMap
                                position={{ lat: report.latitude, lng: report.longitude }}
                                yAnchor={1.5}
                                zIndex={config.zIndex + 1}
                            >
                                <div className="bg-red-500 text-white text-xs px-1 rounded shadow-sm font-bold">!</div>
                            </CustomOverlayMap>
                        )}
                    </div>
                );
            })}
        </>
    );
}
