/* eslint-disable @next/next/no-img-element */
'use client';
import { useRef, useState } from 'react';

interface PhotoUploaderProps {
    onUpload: (file: File) => void;
    showGuide?: boolean;
    guideType?: 'entrance' | 'step_detail';
}

export default function PhotoUploader({ onUpload, showGuide, guideType }: PhotoUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onUpload(file);
        }
    };

    return (
        <div
            className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <div className="text-center p-4">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm font-medium text-gray-500">
                        {guideType === 'entrance' ? '입구 전경 촬영' : '단차 상세 촬영'}
                    </p>
                </div>
            )}

            {/* Guide Overlay */}
            {showGuide && !preview && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {guideType === 'entrance' && (
                        <div className="w-[80%] h-[60%] border-2 border-white/70 rounded-lg flex items-center justify-center">
                            <span className="text-white/90 text-xs bg-black/30 px-2 py-1 rounded">입구 전체가 나오게</span>
                        </div>
                    )}
                    {guideType === 'step_detail' && (
                        <div className="w-[60%] h-[40%] border-2 border-yellow-400/70 rounded-lg flex items-end justify-center pb-2">
                            <span className="text-yellow-400 text-xs bg-black/30 px-2 py-1 rounded">손가락으로 높이 비교</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
