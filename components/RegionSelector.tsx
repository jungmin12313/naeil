'use client';

import { GWANGJU_LOCATIONS } from '@/lib/gwangju_locations';

interface RegionSelectorProps {
    selectedDistrict: string;
    selectedNeighborhood: string;
    onDistrictChange: (district: string) => void;
    onNeighborhoodChange: (neighborhood: string) => void;
    variant?: 'header' | 'floating'; // 'header' for Dashboard, 'floating' for Map
}

export default function RegionSelector({
    selectedDistrict,
    selectedNeighborhood,
    onDistrictChange,
    onNeighborhoodChange,
    variant = 'header'
}: RegionSelectorProps) {

    const currentDistrictData = GWANGJU_LOCATIONS.find(d => d.name === selectedDistrict);
    const neighborhoods = currentDistrictData ? currentDistrictData.neighborhoods : [];

    // Styles
    const containerClass = variant === 'header'
        ? "flex gap-2"
        : "flex gap-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100";

    // Header variant has larger inputs, Floating has compact
    const selectClass = variant === 'header'
        ? "bg-gray-100 rounded-xl px-4 py-3 font-bold text-[#191F28] border-none outline-none flex-1 appearance-none"
        : "bg-gray-50 rounded-lg px-3 py-2 text-sm font-bold text-[#191F28] border-none outline-none flex-1 appearance-none min-w-[80px]";

    const activeSelectClass = variant === 'header'
        ? "bg-[#E8F3FF] text-[#3182F6] rounded-xl px-4 py-3 font-bold border-none outline-none flex-1 appearance-none"
        : "bg-[#E8F3FF] text-[#3182F6] rounded-lg px-3 py-2 text-sm font-bold border-none outline-none flex-1 appearance-none min-w-[80px]";

    return (
        <div className={containerClass}>
            {/* Fixed City - Only show on Header for space */}
            {variant === 'header' && (
                <select
                    className={selectClass}
                    value="광주광역시"
                    disabled
                >
                    <option>광주광역시</option>
                </select>
            )}

            <select
                className={selectClass}
                value={selectedDistrict}
                onChange={(e) => onDistrictChange(e.target.value)}
            >
                {GWANGJU_LOCATIONS.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
            </select>

            <select
                className={activeSelectClass}
                value={selectedNeighborhood}
                onChange={(e) => {
                    const selectedName = e.target.value;

                    // 1. Update the UI state first
                    onNeighborhoodChange(selectedName);

                    // 2. Find the coordinate data from the source file (Lookup)
                    // Note: In our architecture, the parent (MapPage) observes the 
                    // 'selectedNeighborhood' state change and handles the map move (flyTo).
                    const targetData = neighborhoods.find(n => n.name === selectedName);

                    // 3. Move the Map (Handled by Context/Effect in MapPage)
                    if (targetData) {
                        console.log(`Region Changed: ${selectedName}`, targetData);
                    }
                }}
            >
                {neighborhoods.map((dong) => (
                    <option key={dong.name} value={dong.name}>
                        {dong.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
