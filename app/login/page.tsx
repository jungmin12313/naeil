'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });
        setLoading(false);
        if (result?.ok) {
            router.push('/');
        } else {
            alert('이메일 또는 비밀번호를 확인해주세요.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F6] flex flex-col justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full mx-auto"
            >
                <div className="bg-white rounded-3xl p-8 shadow-sm relative">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/')}
                        className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <h1 className="text-2xl font-bold text-[#191F28] mb-8 mt-6">
                        이메일로<br />로그인해주세요
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#8B95A1] mb-1">이메일</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#3182F6] transition text-[#191F28]"
                                placeholder="example@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#8B95A1] mb-1">비밀번호</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#3182F6] transition text-[#191F28]"
                                placeholder="비밀번호 입력"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#3182F6] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition disabled:opacity-50 mt-4"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/signup" className="text-sm text-[#8B95A1] hover:text-[#3182F6] transition">
                            계정이 없으신가요? 회원가입
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
