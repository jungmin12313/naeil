/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import type { Report } from '@prisma/client';

interface POIDetailCardProps {
    poi: any; // Using any for flexibility during dev
    onClose: () => void;
}

export default function POIDetailCard({ poi, onClose }: POIDetailCardProps) {
    const [snapPoint, setSnapPoint] = useState<40 | 90>(40);

    // Format relative time (Simple version)
    const getRelativeTime = (dateStr: string | Date) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return '방금 전';
        if (hours < 24) return `${hours}시간 전`;
        const days = Math.floor(hours / 24);
        return `${days}일 전`;
    };

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-all duration-300 z-50 flex flex-col`}
            style={{ height: `${snapPoint}%` }}
        >
            {/* Handle Bar */}
            <div
                className="w-full flex justify-center py-4 cursor-pointer shrink-0"
                onClick={() => setSnapPoint(snapPoint === 40 ? 90 : 40)}
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{poi.placeName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${poi.status === 'ACCESSIBLE' ? 'bg-blue-100 text-blue-700' :
                                poi.status === 'INACCESSIBLE' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {poi.status === 'ACCESSIBLE' ? '출입 가능' :
                                    poi.status === 'INACCESSIBLE' ? '진입 불가' : poi.status}
                            </span>
                            <span className="text-xs text-gray-500">
                                • {getRelativeTime(poi.updatedAt)} 업데이트
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                {/* Freshness/Trust Indicator */}
                <div className="mb-6 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        ✓
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">신뢰할 수 있는 정보예요</p>
                        <p className="text-xs text-gray-500">{poi.validationCount || 0}명이 확인했어요</p>
                    </div>
                </div>

                {/* Accessibility Grid */}
                <h3 className="text-sm font-semibold text-gray-900 mb-3">접근성 상세</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="border border-gray-200 rounded-xl p-3">
                        <span className="text-2xl mb-1 block">📐</span>
                        <p className="text-xs text-gray-500 mb-0.5">단차 높이</p>
                        <p className="font-semibold text-gray-900">
                            {poi.stepHeightCm ? `${poi.stepHeightCm}cm` : '정보 없음'}
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3">
                        <span className="text-2xl mb-1 block">🛤️</span>
                        <p className="text-xs text-gray-500 mb-0.5">경사로</p>
                        <p className="font-semibold text-gray-900">
                            {poi.slopeType === 'FLAT' ? '평지' :
                                poi.slopeType === 'MODERATE' ? '완만함' :
                                    poi.slopeType === 'STEEP' ? '가파름' : '정보 없음'}
                        </p>
                    </div>
                </div>

                {/* Photos */}
                <h3 className="text-sm font-semibold text-gray-900 mb-3">현장 사진</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {poi.photoUrl1 && (
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                            <img src={poi.photoUrl1} alt="입구 전경" className="w-full h-full object-cover" />
                        </div>
                    )}
                    {poi.photoUrl2 && (
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                            <img src={poi.photoUrl2} alt="단차 상세" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* User Memo */}
                {poi.userMemo && (
                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-900">
                        &quot;{poi.userMemo}&quot;
                    </div>
                )}

            </div>
        </div>
    );
}
