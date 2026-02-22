'use client';

import { signOut, useSession } from 'next-auth/react';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface UserStats {
    count: number;
    level: string;
    badge: string;
    nextLevelCount: number;
    places: any[];
}

export default function MyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchStats();
        }
    }, [status, router]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/user/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null;

    return (
        <div className="min-h-screen bg-[#F2F4F6] pb-24">
            <header className="bg-white p-6 mb-6 rounded-b-[32px] shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl">
                        {stats?.badge || '👤'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-[#191F28]">{session.user?.name}</h1>
                            <span className="bg-[#E8F3FF] text-[#3182F6] text-xs font-bold px-2 py-0.5 rounded-full">
                                {stats?.level || '초보자'}
                            </span>
                        </div>
                        <p className="text-sm text-[#8B95A1]">{session.user?.email}</p>
                    </div>
                </div>

                {/* Level Progress */}
                {stats && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-[#333D4B]">다음 레벨까지</span>
                            <span className="text-[#3182F6] font-bold">
                                {stats.level === 'Mapper' ? 'MAX' : `${stats.nextLevelCount - stats.count}개 남음`}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#3182F6]"
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.level === 'Mapper' ? 100 : (stats.count / stats.nextLevelCount) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-[#8B95A1] mt-2">
                            누적 제보 <span className="text-[#191F28] font-bold">{stats.count}</span>건
                        </p>
                    </div>
                )}
            </header>

            <main className="px-5 space-y-4">
                <h3 className="font-bold text-[#191F28] ml-1">나의 활동</h3>

                {stats?.places.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl text-center shadow-sm">
                        <p className="text-[#8B95A1] mb-4">아직 제보한 장소가 없어요.</p>
                        <button
                            onClick={() => router.push('/map?action=report')}
                            className="bg-[#3182F6] text-white px-6 py-2 rounded-xl font-bold text-sm"
                        >
                            첫 제보 하러가기
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden min-h-[200px]">
                        <ul className="divide-y divide-gray-100">
                            {stats?.places.map((place) => (
                                <li key={place.id} className="p-4 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-[#333D4B]">{place.name}</p>
                                            <p className="text-xs text-[#8B95A1] truncate max-w-[200px]">{place.address}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold
                                            ${place.grade === 'GREEN' ? 'bg-green-100 text-green-700' :
                                                place.grade === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {place.grade}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        {new Date(place.createdAt).toLocaleDateString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full bg-white text-[#FF4B4B] py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-red-50 transition"
                    >
                        로그아웃
                    </button>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
