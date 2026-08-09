import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export function DateFilter({ onDateRangeChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('last30days');

  const dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Last 90 Days', value: 'last90days' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Custom Range', value: 'custom' },
  ];

  const getDateRange = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: yesterday.toISOString().split('T')[0],
          end: yesterday.toISOString().split('T')[0],
        };
      case 'last7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return {
          start: sevenDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'last30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return {
          start: thirtyDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'last90days':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return {
          start: ninetyDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'thisMonth':
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          start: firstDayThisMonth.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'lastMonth':
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          start: firstDayLastMonth.toISOString().split('T')[0],
          end: lastDayLastMonth.toISOString().split('T')[0],
        };
      default:
        return {
          start: '',
          end: '',
        };
    }
  };

  const handleRangeSelect = (range: string) => {
    setSelectedRange(range);
    const { start, end } = getDateRange(range);
    onDateRangeChange(start, end);
    setIsOpen(false);
  };

  const selectedLabel = dateRanges.find(r => r.value === selectedRange)?.label || 'Select Range';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
      >
        <Calendar className="h-4 w-4" />
        {selectedLabel}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="p-2">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => handleRangeSelect(range.value)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    selectedRange === range.value
                      ? 'bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
