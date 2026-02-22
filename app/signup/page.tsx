'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                router.push('/login');
            } else {
                const data = await res.json();
                alert(data.message || '회원가입 실패');
            }
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F6] flex flex-col justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full mx-auto"
            >
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#191F28] mb-8">
                        환영합니다!<br />계정을 만들어주세요
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#8B95A1] mb-1">이름</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#3182F6] transition text-[#191F28]"
                                placeholder="홍길동"
                                required
                            />
                        </div>
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
                            {loading ? '가입 중...' : '회원가입'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-[#8B95A1] hover:text-[#3182F6] transition">
                            이미 계정이 있으신가요? 로그인
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
