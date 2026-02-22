'use client';

import { useEffect, useState } from 'react';
import LocationPicker from './LocationPicker';
import { X, Camera } from 'lucide-react';

declare global {
    interface Window {
        kakao: any;
    }
}

// Define grading options
const RAMP_OPTIONS = ['평지', '경사로', '계단만'];
const DOOR_OPTIONS = ['자동문', '여닫이', '미닫이'];
const SPACE_OPTIONS = ['여유로움', '협소함'];

interface PlaceFormProps {
    onClose: () => void;
    onRefresh: () => void;
    initialData?: any;
}

export default function PlaceForm({ onClose, onRefresh, initialData }: PlaceFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        lat: 0,
        lng: 0,
        ramp: '평지',
        door: '자동문',
        space: '여유로움',
        threshold: 0 as number | null,
        door_width: 100 as number | null,
        image_url: '',
        images: [] as string[],
        has_restroom: false,
        has_parking: false,
        slope: 0,
        ramp_slope: 0 as number | null,
        ramp_width: 0 as number | null,
        has_bell: false,
        bell_status: '',
        district: '',
        neighborhood: '',
    });

    const [unknowns, setUnknowns] = useState({
        threshold: false,
        door_width: false,
        ramp_slope: false,
        ramp_width: false,
    });

    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(!initialData);

    useEffect(() => {
        if (initialData) {
            const loadedImages = initialData.images?.map((img: any) => img.url) || (initialData.image_url ? [initialData.image_url] : []);

            setFormData({
                ...initialData,
                threshold: initialData.threshold ?? 0,
                door_width: initialData.door_width ?? 100,
                ramp_slope: initialData.ramp_slope ?? 0,
                ramp_width: initialData.ramp_width ?? 0,
                images: loadedImages
            });

            setUnknowns({
                threshold: initialData.threshold === null,
                door_width: initialData.door_width === null,
                ramp_slope: initialData.ramp_slope === null,
                ramp_width: initialData.ramp_width === null,
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (initialData || !locating) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setFormData((prev) => ({ ...prev, lat, lng }));

                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                        const geocoder = new window.kakao.maps.services.Geocoder();
                        geocoder.coord2Address(lng, lat, (result: any, status: any) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                const addr = result[0].address.address_name;
                                const district = result[0].address.region_2depth_name;
                                const neighborhood = result[0].address.region_3depth_name;
                                setFormData((prev) => ({
                                    ...prev,
                                    address: addr,
                                    district,
                                    neighborhood
                                }));
                            }
                            setLocating(false);
                        });
                    } else {
                        setLocating(false);
                    }
                },
                (err) => {
                    console.error(err);
                    setLocating(false);
                }
            );
        } else {
            setLocating(false);
        }
    }, [initialData, locating]);

    useEffect(() => {
        if (!formData.lat || !formData.lng) return;
        if (initialData && formData.lat === initialData.lat && formData.lng === initialData.lng) return;

        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(formData.lng, formData.lat, (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    const addr = result[0].address.address_name;
                    const district = result[0].address.region_2depth_name;
                    const neighborhood = result[0].address.region_3depth_name;

                    setFormData(prev => {
                        if (prev.address === addr) return prev;
                        return { ...prev, address: addr, district, neighborhood };
                    });
                }
            });
        }
    }, [formData.lat, formData.lng, initialData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages: string[] = [];
            let processedCount = 0;

            if (formData.images.length + files.length > 5) {
                alert('사진은 최대 5장까지 등록 가능합니다.');
                return;
            }

            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push(reader.result as string);
                    processedCount++;
                    if (processedCount === files.length) {
                        setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, ...newImages]
                        }));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const toggleUnknown = (field: keyof typeof unknowns) => {
        setUnknowns(prev => {
            const newState = { ...prev, [field]: !prev[field] };
            if (newState[field]) {
                setFormData(prevData => ({ ...prevData, [field]: null }));
            } else {
                setFormData(prevData => ({ ...prevData, [field]: 0 }));
            }
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const isAnyUnknown = Object.values(unknowns).some(v => v);
        if ((isAnyUnknown || true) && formData.images.length === 0) {
            alert('⚠️ 정확한 정보를 위해 사진을 최소 1장 등록해주세요!');
            setLoading(false);
            return;
        }

        try {
            const url = '/api/places';
            const method = initialData ? 'PUT' : 'POST';
            const body = initialData ? { ...formData, id: initialData.id } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json();
                if (res.status === 401) throw new Error('로그인이 필요합니다.');
                throw new Error(errData.error || 'Failed to submit');
            }

            onRefresh();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message || '저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto border-t-4 border-primary">
            <h2 className="text-xl font-bold mb-4 text-black flex items-center justify-between">
                <span className="flex items-center gap-2">
                    {initialData ? '✏️ 장소 수정' : '📍 장소 제보'}
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">Barrier Free</span>
                </span>
                <button onClick={onClose}><X className="text-gray-400" /></button>
            </h2>

            {locating ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-500">현재 위치 확인 중...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">장소명</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-3 text-black focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                placeholder="예: 스타벅스 강남점"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">주소</label>
                            <input
                                required
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">위치 수정</label>
                            <LocationPicker
                                lat={formData.lat}
                                lng={formData.lng}
                                onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div>
                        <label className="block text-base font-bold text-gray-800 mb-2">① 진입로 형태는?</label>
                        <div className="grid grid-cols-3 gap-2">
                            {RAMP_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, ramp: opt })}
                                    className={`py-3 rounded-lg font-bold text-sm transition-all border
                                        ${formData.ramp === opt
                                            ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            {formData.ramp === '계단만' && (
                                <div className="text-center py-2">
                                    <p className="text-red-500 font-bold text-lg">⛔ 휠체어 진입 불가</p>
                                    <p className="text-gray-500 text-sm mt-1">이 장소는 &apos;RED&apos; 등급으로 등록됩니다.</p>
                                </div>
                            )}

                            {formData.ramp === '평지' && (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-bold text-gray-700">턱 높이 (cm)</label>
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={unknowns.threshold}
                                                onChange={() => toggleUnknown('threshold')}
                                                className="rounded text-primary focus:ring-primary"
                                            />
                                            <span className="text-xs text-gray-500">잘 모르겠어요</span>
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        disabled={unknowns.threshold}
                                        value={formData.threshold === null ? '' : formData.threshold}
                                        onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg p-3 disabled:bg-gray-100 disabled:text-gray-400"
                                        placeholder="0"
                                    />
                                </div>
                            )}

                            {formData.ramp === '경사로' && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-sm font-bold text-gray-700">경사로 각도 (도)</label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={unknowns.ramp_slope}
                                                    onChange={() => toggleUnknown('ramp_slope')}
                                                    className="rounded text-primary focus:ring-primary"
                                                />
                                                <span className="text-xs text-gray-500">잘 모르겠어요</span>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            disabled={unknowns.ramp_slope}
                                            value={formData.ramp_slope === null ? '' : formData.ramp_slope}
                                            onChange={(e) => setFormData({ ...formData, ramp_slope: Number(e.target.value) })}
                                            className={`w-full border rounded-lg p-3 disabled:bg-gray-100 disabled:text-gray-400 ${(formData.ramp_slope || 0) > 30 ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-sm font-bold text-gray-700">유효 폭 (cm)</label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={unknowns.ramp_width}
                                                    onChange={() => toggleUnknown('ramp_width')}
                                                    className="rounded text-primary focus:ring-primary"
                                                />
                                                <span className="text-xs text-gray-500">잘 모르겠어요</span>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            disabled={unknowns.ramp_width}
                                            value={formData.ramp_width === null ? '' : formData.ramp_width}
                                            onChange={(e) => setFormData({ ...formData, ramp_width: Number(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg p-3 disabled:bg-gray-100 disabled:text-gray-400"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-base font-bold text-gray-800 mb-2">② 출입문 & 내부</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">문 형태</label>
                                <select
                                    value={formData.door}
                                    onChange={(e) => setFormData({ ...formData, door: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                                >
                                    {DOOR_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-bold text-gray-600">문 폭 (cm)</label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={unknowns.door_width}
                                            onChange={() => toggleUnknown('door_width')}
                                            className="rounded text-primary focus:ring-primary"
                                        />
                                        <span className="text-[10px] text-gray-500">모름</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    disabled={unknowns.door_width}
                                    value={formData.door_width === null ? '' : formData.door_width}
                                    onChange={(e) => setFormData({ ...formData, door_width: Number(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg p-2 disabled:bg-gray-100 text-black"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-base font-bold text-gray-800 mb-2">③ 시설 사진 <span className="text-xs text-gray-400 font-normal">(최대 5장)</span></label>

                        <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
                            <label className="flex-shrink-0 w-24 h-24 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer transition">
                                <Camera className="text-gray-400 mb-1" size={20} />
                                <span className="text-xs text-gray-500 font-medium">사진 추가</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 group">
                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover rounded-xl border border-gray-100" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition
                            ${formData.has_restroom ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                            <input
                                type="checkbox"
                                checked={formData.has_restroom}
                                onChange={(e) => setFormData({ ...formData, has_restroom: e.target.checked })}
                                className="hidden"
                            />
                            <span>🚻 장애인 화장실</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition
                            ${formData.has_parking ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                            <input
                                type="checkbox"
                                checked={formData.has_parking}
                                onChange={(e) => setFormData({ ...formData, has_parking: e.target.checked })}
                                className="hidden"
                            />
                            <span>🅿️ 장애인 주차장</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition">취소</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-400 disabled:opacity-50 font-bold shadow-lg shadow-blue-200 transition transform active:scale-95"
                        >
                            {loading ? '저장 중...' : (initialData ? '수정 완료' : '등록하기')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
