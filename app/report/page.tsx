/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhotoUploader from '@/components/PhotoUploader';
import { useRegion } from '@/context/RegionContext';
import { useSession } from 'next-auth/react';

type Step = 'PHOTO1' | 'PHOTO2' | 'DETAILS' | 'REVIEW' | 'SUBMITTING' | 'SUCCESS';

function ReportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { selectedDistrict, selectedNeighborhood } = useRegion();

    const [step, setStep] = useState<Step>('PHOTO1');
    const [photos, setPhotos] = useState<{ p1: File | null; p2: File | null }>({ p1: null, p2: null });
    const [formData, setFormData] = useState({
        placeName: searchParams.get('placeName') || '',
        stepHeightCm: '',
        slopeType: 'FLAT', // Default to Flat
        userMemo: ''
    });
    const [result, setResult] = useState<any>(null); // Gamification result

    // Redirect if not logged in? Or allow guest for now? Assuming login required for points.
    useEffect(() => {
        if (!session) {
            // router.push('/login'); 
            // For now, let's allow guest reporting or just warn
        }
    }, [session, router]);

    const handleNext = () => {
        if (step === 'PHOTO1' && photos.p1) setStep('PHOTO2');
        else if (step === 'PHOTO2' && photos.p2) setStep('DETAILS');
        else if (step === 'DETAILS') setStep('REVIEW');
        else if (step === 'REVIEW') handleSubmit();
    };

    const handleSubmit = async () => {
        setStep('SUBMITTING');

        try {
            const dataPayload = {
                userId: session?.user?.email || 'guest_user', // Using email as ID for demo if ID not available in session easily
                placeName: formData.placeName,
                district: selectedDistrict,
                neighborhood: selectedNeighborhood,
                // Mock lat/lng for now - in real app, get from current location or map center passed via query
                latitude: 35.1765,
                longitude: 126.9135,
                stepHeightCm: parseFloat(formData.stepHeightCm) || 0,
                slopeType: formData.slopeType,
                userMemo: formData.userMemo
            };

            const formDataToSend = new FormData();
            if (photos.p1) formDataToSend.append('photo1', photos.p1);
            if (photos.p2) formDataToSend.append('photo2', photos.p2);
            formDataToSend.append('data', JSON.stringify(dataPayload));

            const res = await fetch('/api/reports', {
                method: 'POST',
                body: formDataToSend
            });

            if (!res.ok) throw new Error('Failed to submit');

            const data = await res.json();
            setResult(data);
            setStep('SUCCESS');

        } catch (error) {
            console.error(error);
            alert('제보 실패. 다시 시도해주세요.');
            setStep('REVIEW');
        }
    };

    if (step === 'SUCCESS') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 animate-fade-in">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-extrabold mb-2">제보 완료!</h1>
                <p className="text-blue-100 mb-8">소중한 정보 감사합니다.</p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm border border-white/20 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-blue-200">획득 점수</span>
                        <span className="text-2xl font-bold text-yellow-300">+{result?.pointsAwarded || 50} P</span>
                    </div>
                    <div className="h-px bg-white/20 my-4" />
                    <div className="flex justify-between items-center">
                        <span className="text-blue-200">현재 레벨</span>
                        <span className="text-xl font-bold">Lv. {result?.newLevel || 1}</span>
                    </div>
                    <div className="mt-2 text-right text-sm text-blue-200">
                        {result?.newTitle}
                    </div>
                </div>

                <button
                    onClick={() => router.push('/map')}
                    className="w-full max-w-sm bg-white text-blue-600 font-bold py-4 rounded-xl shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-1"
                >
                    지도에서 확인하기
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => router.back()} className="text-gray-500">←</button>
                <h1 className="font-bold text-lg">장소 제보하기</h1>
            </div>

            <div className="flex-1 p-6 max-w-md mx-auto w-full">
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${(step === 'PHOTO1' && i === 1) || (step === 'PHOTO2' && i <= 2) || (['DETAILS', 'REVIEW'].includes(step) && i <= 3)
                            ? 'bg-blue-500' : 'bg-gray-200'
                            }`} />
                    ))}
                </div>

                {step === 'PHOTO1' && (
                    <div className="animate-slide-in">
                        <h2 className="text-2xl font-bold mb-2">입구 사진을<br />찍어주세요</h2>
                        <p className="text-gray-500 mb-6">전체적인 모습이 잘 보여야 해요.</p>
                        <PhotoUploader
                            onUpload={(file) => {
                                setPhotos({ ...photos, p1: file });
                                setStep('PHOTO2');
                            }}
                            showGuide={true}
                            guideType="entrance"
                        />
                    </div>
                )}

                {step === 'PHOTO2' && (
                    <div className="animate-slide-in">
                        <h2 className="text-2xl font-bold mb-2">단차 높이를<br />확인해주세요</h2>
                        <p className="text-gray-500 mb-6">손가락으로 비교하면 더 정확해요.</p>
                        <PhotoUploader
                            onUpload={(file) => {
                                setPhotos({ ...photos, p2: file });
                                setStep('DETAILS');
                            }}
                            showGuide={true}
                            guideType="step_detail"
                        />
                    </div>
                )}

                {step === 'DETAILS' && (
                    <div className="animate-slide-in space-y-6">
                        <h2 className="text-2xl font-bold mb-2">상세 정보를<br />입력해주세요</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">장소명</label>
                            <input
                                type="text"
                                value={formData.placeName}
                                onChange={e => setFormData({ ...formData, placeName: e.target.value })}
                                className="w-full p-3 border rounded-xl"
                                placeholder="예: 스타벅스 용봉점"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">단차 높이 (cm)</label>
                            <input
                                type="number"
                                value={formData.stepHeightCm}
                                onChange={e => setFormData({ ...formData, stepHeightCm: e.target.value })}
                                className="w-full p-3 border rounded-xl"
                                placeholder="예: 5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">경사로 종류</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'FLAT', label: '평지 (없음)' },
                                    { id: 'MODERATE', label: '완만함' },
                                    { id: 'STEEP', label: '급경사' },
                                    { id: 'UNSAFE', label: '위험/파손' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setFormData({ ...formData, slopeType: opt.id })}
                                        className={`p-3 rounded-xl border font-medium ${formData.slopeType === opt.id
                                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                                            : 'border-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">한마디 메모</label>
                            <textarea
                                value={formData.userMemo}
                                onChange={e => setFormData({ ...formData, userMemo: e.target.value })}
                                className="w-full p-3 border rounded-xl h-24"
                                placeholder="예: 문이 무거워요"
                            />
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4"
                        >
                            다음으로
                        </button>
                    </div>
                )}

                {step === 'REVIEW' && (
                    <div className="animate-slide-in space-y-6">
                        <h2 className="text-2xl font-bold mb-2">입력한 내용을<br />확인해주세요</h2>

                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex gap-2 mb-4">
                                {photos.p1 && <img src={URL.createObjectURL(photos.p1)} alt="preview 1" className="w-16 h-16 rounded object-cover" />}
                                {photos.p2 && <img src={URL.createObjectURL(photos.p2)} alt="preview 2" className="w-16 h-16 rounded object-cover" />}
                            </div>
                            <h3 className="font-bold text-lg mb-1">{formData.placeName}</h3>
                            <p className="text-gray-500">{formData.stepHeightCm}cm / {formData.slopeType}</p>
                            <p className="text-gray-400 text-sm mt-2">&quot;{formData.userMemo}&quot;</p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg"
                        >
                            제보하고 점수 받기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportContent />
        </Suspense>
    );
}
