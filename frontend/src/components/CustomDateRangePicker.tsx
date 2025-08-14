import React, { useState } from 'react';
import { 
  FiCalendar, 
  FiX, 
  FiChevronLeft, 
  FiClock
} from 'react-icons/fi';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface CustomDateRangePickerProps {
  onRangeChange: (range: DateRange) => void;
  currentRange?: DateRange;
}

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  onRangeChange,
  currentRange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    currentRange || {
      startDate: subDays(new Date(), 1),
      endDate: new Date()
    }
  );

  const predefinedRanges = [
    {
      label: 'Last Hour',
      range: {
        startDate: subHours(new Date(), 1),
        endDate: new Date()
      }
    },
    {
      label: 'Last 24 Hours',
      range: {
        startDate: subDays(new Date(), 1),
        endDate: new Date()
      }
    },
    {
      label: 'Last 7 Days',
      range: {
        startDate: subDays(new Date(), 7),
        endDate: new Date()
      }
    },
    {
      label: 'Last 30 Days',
      range: {
        startDate: subDays(new Date(), 30),
        endDate: new Date()
      }
    },
    {
      label: 'Today',
      range: {
        startDate: startOfDay(new Date()),
        endDate: endOfDay(new Date())
      }
    },
    {
      label: 'Yesterday',
      range: {
        startDate: startOfDay(subDays(new Date(), 1)),
        endDate: endOfDay(subDays(new Date(), 1))
      }
    }
  ];

  const handleRangeSelect = (range: DateRange) => {
    setSelectedRange(range);
    onRangeChange(range);
    setIsOpen(false);
  };

  const handleCustomRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    const newRange = {
      ...selectedRange,
      [field]: new Date(value)
    };
    setSelectedRange(newRange);
  };

  const applyCustomRange = () => {
    onRangeChange(selectedRange);
    setIsOpen(false);
  };

  const clearRange = () => {
    const defaultRange = {
      startDate: subDays(new Date(), 1),
      endDate: new Date()
    };
    setSelectedRange(defaultRange);
    onRangeChange(defaultRange);
    setIsOpen(false);
  };

  const formatRangeDisplay = () => {
    if (!currentRange) return 'Select Date Range';
    
    const start = format(currentRange.startDate, 'MMM dd, yyyy');
    const end = format(currentRange.endDate, 'MMM dd, yyyy');
    
    if (start === end) {
      return format(currentRange.startDate, 'MMM dd, yyyy');
    }
    
    return `${start} - ${end}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <FiCalendar className="w-4 h-4" />
        <span>{formatRangeDisplay()}</span>
        <FiChevronLeft className="w-4 h-4 transform rotate-90" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Date Range</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Predefined Ranges */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Select</h4>
              <div className="grid grid-cols-2 gap-2">
                {predefinedRanges.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleRangeSelect(item.range)}
                    className="text-left p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">
                      {format(item.range.startDate, 'MMM dd')} - {format(item.range.endDate, 'MMM dd, yyyy')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Range</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={format(selectedRange.startDate, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => handleCustomRangeChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={format(selectedRange.endDate, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => handleCustomRangeChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Selected Range Preview */}
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FiClock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Selected Range</span>
              </div>
              <div className="text-sm text-blue-800">
                {format(selectedRange.startDate, 'MMM dd, yyyy HH:mm')} - {format(selectedRange.endDate, 'MMM dd, yyyy HH:mm')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={clearRange}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCustomRange}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateRangePicker;
