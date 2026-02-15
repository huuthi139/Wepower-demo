'use client';

import { useState } from 'react';
import { Button } from './Button';

export interface FilterState {
  priceRange: [number, number];
  minRating: number;
  duration: string;
}

interface AdvancedFiltersProps {
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

export function AdvancedFilters({ onApply, onReset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000000],
    minRating: 0,
    duration: 'all',
  });

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      priceRange: [0, 10000000],
      minRating: 0,
      duration: 'all',
    };
    setFilters(resetFilters);
    onReset();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white hover:border-red transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="text-sm font-semibold">Bộ lọc nâng cao</span>
        {isOpen ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-black border border-gray-800 rounded-xl p-6 shadow-card z-50 animate-slideDown">
          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 text-sm">Khoảng giá</label>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]
                    })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-red"
                    placeholder="Từ"
                  />
                </div>
                <div className="flex items-center text-gray-500">-</div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters,
                      priceRange: [filters.priceRange[0], parseInt(e.target.value) || 10000000]
                    })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-red"
                    placeholder="Đến"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, priceRange: [0, 1000000] })}
                  className="flex-1 px-2 py-1 bg-gray-900 hover:bg-red rounded text-xs text-white transition-colors"
                >
                  &lt; 1M
                </button>
                <button
                  onClick={() => setFilters({ ...filters, priceRange: [1000000, 3000000] })}
                  className="flex-1 px-2 py-1 bg-gray-900 hover:bg-red rounded text-xs text-white transition-colors"
                >
                  1M - 3M
                </button>
                <button
                  onClick={() => setFilters({ ...filters, priceRange: [3000000, 10000000] })}
                  className="flex-1 px-2 py-1 bg-gray-900 hover:bg-red rounded text-xs text-white transition-colors"
                >
                  &gt; 3M
                </button>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 text-sm">Đánh giá tối thiểu</label>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilters({ ...filters, minRating: rating })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filters.minRating === rating
                      ? 'bg-red text-white'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {rating === 0 ? 'Tất cả' : (
                    <span className="flex items-center justify-center gap-1">
                      {rating}
                      <svg className="w-4 h-4 text-yellow" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 text-sm">Thời lượng</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'short', label: '< 5 giờ' },
                { value: 'medium', label: '5-20 giờ' },
                { value: 'long', label: '> 20 giờ' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters({ ...filters, duration: option.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filters.duration === option.value
                      ? 'bg-red text-white'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handleReset}
            >
              Đặt lại
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handleApply}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
