'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const [showButton, setShowButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => {
            setShowButton(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        setIsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success
                    setIsLoading(false);
                    onFinish();
                },
                (error) => {
                    // Error
                    console.error(error);
                    setIsLoading(false);
                    alert('위치 권한을 허용해야 내 주변 편의시설을 찾을 수 있습니다.\n브라우저 설정에서 위치 권한을 허용해주세요.');
                }
            );
        } else {
            alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
            setIsLoading(false);
            onFinish(); // Fallback to let them in anyway? Or block? Usually let in.
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6">
            {/* Logo Section */}
            <div className="flex flex-col items-center animate-pulse-slow">
                <img
                    src="/logo.png"
                    alt="App Logo"
                    className="w-[180px] sm:w-[200px] object-contain mb-4"
                />
                <p className="text-gray-400 text-sm font-light tracking-widest">
                    모두의 더 나은 내일을 위해
                </p>
            </div>

            {/* Bottom Button Section */}
            <div className={`absolute bottom-20 transition-all duration-700 transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                <button
                    onClick={handleStart}
                    disabled={isLoading}
                    className="bg-blue-50 text-[#52a5ff] px-8 py-4 rounded-full font-bold shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-100 active:scale-95 transition-all text-lg"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-[#52a5ff] border-t-transparent rounded-full animate-spin" />
                            <span>위치 확인 중...</span>
                        </>
                    ) : (
                        <>
                            <span>내 주변 장소 찾기</span>
                            <span>📍</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
