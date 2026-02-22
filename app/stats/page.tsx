'use client';

import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import RegionSelector from '@/components/RegionSelector';
import { GWANGJU_LOCATIONS } from '@/lib/gwangju_locations';

interface Place {
    id: string;
    name: string;
    address: string;
    grade: string;
    ramp: string;
    threshold: number | null;
    slope: number | null;
    door_width: number | null;
    ramp_width: number | null;
    ramp_slope: number | null;
    has_bell: boolean;
    district: string | null;
    neighborhood: string | null;
}

export default function StatsPage() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    // Filters
    const [selectedDistrict, setSelectedDistrict] = useState<string>('북구');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('용봉동');
    const [filters, setFilters] = useState({
        highThreshold: false,
        steepSlope: false,
        narrowWidth: false,
        noBell: false
    });

    useEffect(() => {
        fetch('/api/places')
            .then(res => res.json())
            .then(data => {
                setPlaces(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const filteredPlaces = places.filter(p => {
        // Robust Matching
        const matchDistrict = selectedDistrict ? (p.district?.includes(selectedDistrict) || selectedDistrict === '전체') : true;
        const matchNeighborhood = selectedNeighborhood ? (p.neighborhood?.includes(selectedNeighborhood) || selectedNeighborhood === '전체') : true;

        if (!matchDistrict || !matchNeighborhood) return false;

        // Logic Filters
        if (filters.highThreshold && (p.threshold || 0) <= 2) return false;
        if (filters.steepSlope && (p.ramp === '경사로' ? (p.ramp_slope || 0) < 4.8 : true)) return false;
        // Note: Logic simplified for brevity, assuming standard check

        if (filters.narrowWidth) {
            const doorW = p.door_width || 999;
            const rampW = p.ramp === '경사로' ? (p.ramp_width || 999) : 999;
            if (doorW >= 90 && rampW >= 90) return false;
        }

        if (filters.noBell && p.has_bell) return false;

        return true;
    });

    // Chart Data
    const violationStats = [
        { name: '높은 턱', count: filteredPlaces.filter(p => (p.threshold || 0) > 2).length, color: '#ef4444' },
        { name: '급경사', count: filteredPlaces.filter(p => p.ramp === '경사로' && (p.ramp_slope || 0) >= 4.8).length, color: '#f59e0b' },
        { name: '좁은 폭', count: filteredPlaces.filter(p => (p.door_width || 999) < 90 || (p.ramp === '경사로' && (p.ramp_width || 999) < 90)).length, color: '#3b82f6' },
        { name: '벨 미설치', count: filteredPlaces.filter(p => !p.has_bell).length, color: '#8b5cf6' },
    ];

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredPlaces.map(p => ({
            장소명: p.name,
            주소: p.address,
            등급: p.grade,
            진입로: p.ramp,
            턱높이: p.threshold,
            경사도: p.ramp_slope,
            출입문폭: p.door_width,
            도움벨: p.has_bell ? '있음' : '없음'
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Places");
        XLSX.writeFile(wb, "accessibility_data.xlsx");
    };

    // Handle Region Change
    const handleDistrictChange = (newDistrict: string) => {
        setSelectedDistrict(newDistrict);
        // Reset neighborhood logic
        const distData = GWANGJU_LOCATIONS.find(d => d.name === newDistrict);
        if (distData && distData.neighborhoods.length > 0) {
            setSelectedNeighborhood(distData.neighborhoods[0].name);
        } else {
            setSelectedNeighborhood('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 bg-white z-20 shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-[#52a5ff]">📊</span> 내일 데이터 랩
                    </h1>
                </div>

                {/* Region Selector (Reused) */}
                <div className="mb-4">
                    <RegionSelector
                        selectedDistrict={selectedDistrict}
                        selectedNeighborhood={selectedNeighborhood}
                        onDistrictChange={handleDistrictChange}
                        onNeighborhoodChange={setSelectedNeighborhood}
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setFilters(f => ({ ...f, highThreshold: !f.highThreshold }))}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition ${filters.highThreshold ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        🚨 턱 2cm 초과
                    </button>
                    <button
                        onClick={() => setFilters(f => ({ ...f, steepSlope: !f.steepSlope }))}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition ${filters.steepSlope ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        📉 경사 4.8도 이상
                    </button>
                    <button
                        onClick={() => setFilters(f => ({ ...f, narrowWidth: !f.narrowWidth }))}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition ${filters.narrowWidth ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        🚪 유효폭 90cm 미만
                    </button>
                    <button
                        onClick={() => setFilters(f => ({ ...f, noBell: !f.noBell }))}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition ${filters.noBell ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        🔔 벨 미설치
                    </button>
                </div>
            </header>

            <main className="p-4 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold mb-1">총 장소 수</p>
                        <p className="text-2xl font-black text-gray-800">{filteredPlaces.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold mb-1">영역 내 위반율</p>
                        <p className="text-2xl font-black text-red-500">
                            {places.length > 0 ? Math.round((filteredPlaces.length / places.length) * 100) : 0}%
                            <span className="text-xs text-gray-400 font-normal ml-1">(필터 적용 시)</span>
                        </p>
                    </div>
                </div>

                {/* Charts */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">유형별 물리적 장벽 현황</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={violationStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {violationStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* List Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">세부 목록</h3>
                        <button
                            onClick={exportToExcel}
                            className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-green-100 transition"
                        >
                            <Download size={14} /> 엑셀 저장
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">장소명</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">등급</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">문제점</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">주소</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPlaces.slice(0, 10).map((place) => (
                                    <tr key={place.id}>
                                        <td className="px-4 py-3 font-medium text-gray-800">{place.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold
                                                ${place.grade === 'GREEN' ? 'bg-green-100 text-green-700' :
                                                    place.grade === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {place.grade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {(place.threshold || 0) > 2 ? '턱높음 ' : ''}
                                            {place.ramp === '경사로' && (place.ramp_slope || 0) >= 4.8 ? '급경사 ' : ''}
                                            {!place.has_bell ? '벨없음' : ''}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[150px]">{place.address}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPlaces.length > 10 && (
                            <div className="p-3 text-center text-xs text-gray-400 bg-gray-50">
                                + {filteredPlaces.length - 10}개의 장소가 더 있습니다 (엑셀 다운로드로 확인)
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
