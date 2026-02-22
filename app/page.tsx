'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';
import { Map, AlertTriangle, CheckCircle, ChevronRight, BarChart2 } from 'lucide-react';
import { GWANGJU_LOCATIONS } from '@/lib/gwangju_locations';
import RegionSelector from '@/components/RegionSelector';
import Link from 'next/link';
import { useRegion } from '@/context/RegionContext';

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();

    // Global Region State
    const { selectedDistrict, selectedNeighborhood, setDistrict, setNeighborhood } = useRegion();

    const [places, setPlaces] = useState([]);

    useEffect(() => {
        fetch('/api/places')
            .then(res => res.json())
            .then(data => setPlaces(data))
            .catch(err => console.error(err));
    }, []);

    // Derived Data
    // Derived Data
    const regionPlaces = places.filter((p: any) => {
        // Robust Matching: Check if place.district includes selectedDistrict (e.g. '광주광역시 북구' includes '북구')
        const matchDistrict = selectedDistrict ? (p.district?.includes(selectedDistrict) || selectedDistrict === '전체') : true;
        const matchNeighborhood = selectedNeighborhood ? (p.neighborhood?.includes(selectedNeighborhood) || selectedNeighborhood === '전체') : true;

        return matchDistrict && matchNeighborhood;
    });

    const hasSelection = selectedDistrict && selectedNeighborhood;

    const totalPlaces = regionPlaces.length;
    const greenPlaces = regionPlaces.filter((p: any) => p.grade === 'GREEN').length;
    // Show 0 if no selection OR no places, but UI text differs? User wants "-"
    const accessScore = totalPlaces > 0 ? Math.round((greenPlaces / totalPlaces) * 100) : 0;
    const issueCount = regionPlaces.filter((p: any) => p.grade !== 'GREEN').length;

    const handleDistrictChange = (newDistrict: string) => {
        setDistrict(newDistrict);
        // Reset neighborhood to first in new district
        const newDistData = GWANGJU_LOCATIONS.find(d => d.name === newDistrict);
        if (newDistData && newDistData.neighborhoods.length > 0) {
            setNeighborhood(newDistData.neighborhoods[0].name);
        } else {
            setNeighborhood('');
        }
    };

    const handleReportClick = () => {
        const currentDist = selectedDistrict || '북구';
        const currentDong = selectedNeighborhood || '용봉동';

        if (!session) {
            router.push('/login');
        } else {
            router.push(`/map?action=report&district=${currentDist}&neighborhood=${currentDong}`);
        }
    };

    const handleGoToMap = () => {
        const currentDist = selectedDistrict || '북구';
        const currentDong = selectedNeighborhood || '용봉동';
        router.push(`/map?district=${currentDist}&neighborhood=${currentDong}`);
    };

    return (
        <div className="min-h-screen bg-[#F2F4F6] pb-24">
            {/* Header / Selector Section */}
            <header className="bg-white px-6 pt-8 pb-8 rounded-b-[32px] shadow-sm mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#191F28] mb-1">
                            {session ? `반가워요, ${session.user?.name}님!` : '우리 동네 접근성 보기'}
                        </h1>
                        <p className="text-sm text-[#8B95A1]">관심 있는 지역을 선택해보세요</p>
                    </div>
                </div>

                {/* Region Selector */}
                <RegionSelector
                    selectedDistrict={selectedDistrict}
                    selectedNeighborhood={selectedNeighborhood}
                    onDistrictChange={handleDistrictChange}
                    onNeighborhoodChange={setNeighborhood}
                />
            </header>

            <main className="px-5 space-y-4">
                {/* 1. Main Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-gray-500 font-medium text-sm mb-1">접근성 점수</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-[#191F28]">
                                    {hasSelection ? accessScore : '-'}
                                </span>
                                <span className="text-gray-400 text-lg">/ 100</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-full ${!hasSelection ? 'bg-gray-100 text-gray-400' : accessScore >= 80 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                            <BarChart2 size={24} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-gray-500 text-xs mb-1">등록된 장소</p>
                            <p className="text-xl font-bold text-[#191F28]">
                                {hasSelection ? `${totalPlaces}곳` : '-곳'}
                            </p>
                        </div>
                        <div className="bg-orange-50 rounded-2xl p-4">
                            <p className="text-orange-600 text-xs mb-1">개선 필요</p>
                            <p className="text-xl font-bold text-[#191F28]">
                                {hasSelection ? `${issueCount}건` : '-건'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href={`/map?district=${selectedDistrict || '북구'}&neighborhood=${selectedNeighborhood || '용봉동'}`}
                        className="bg-[#E8F3FF] p-5 rounded-3xl flex flex-col justify-between h-32 hover:bg-blue-100 transition"
                    >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#3182F6] mb-2">
                            <Map size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-[#3182F6]">지도 보기</p>
                            <p className="text-xs text-blue-400 mt-1">내 주변 시설 찾기</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleReportClick}
                        className="bg-white p-5 rounded-2xl shadow-sm hover:bg-gray-50 transition text-left group"
                    >
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 mb-3 group-hover:scale-110 transition">
                            <CheckCircle size={20} />
                        </div>
                        <p className="text-[#333D4B] font-bold">제보조사</p>
                        <p className="text-xs text-[#8B95A1]">장소 정보 업데이트</p>
                    </button>

                    <button
                        onClick={() => router.push(`/stats?district=${selectedDistrict}`)}
                        className="col-span-2 bg-white p-4 rounded-2xl shadow-sm hover:bg-gray-50 transition flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <BarChart2 size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-[#333D4B] font-bold text-sm">데이터 랩 더보기</p>
                                <p className="text-xs text-[#8B95A1]">상세 통계 확인하기</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                </div>

                {/* Banner / Info */}
                <div className="bg-[#E8F3FF] p-5 rounded-2xl flex items-start gap-3">
                    <div className="bg-white p-1.5 rounded-full mt-0.5">
                        <AlertTriangle size={14} className="text-[#3182F6]" />
                    </div>
                    <div>
                        <p className="text-[#3182F6] font-bold text-sm mb-1">알려드립니다</p>
                        <p className="text-xs text-[#4E5968] leading-relaxed">
                            현재 데이터는 시민들의 제보로 이루어집니다.<br />
                            정확하지 않은 정보가 있다면 수정 제보를 부탁드립니다.
                        </p>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
