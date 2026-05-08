import React, { useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/light.css';
import './DateRangePicker.css';

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, placeholder = "Select Date Range..." }) {
  const fpRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;

    fpRef.current = flatpickr(inputRef.current, {
      mode: 'range',
      dateFormat: 'j M, Y',
      defaultDate: [startDate || null, endDate || null],
      onChange: (selectedDates) => {
        if (selectedDates.length === 0) {
          onStartChange('');
          onEndChange('');
        } else if (selectedDates.length === 1) {
          // Add timezone offset to prevent shifting
          const startObj = selectedDates[0];
          const localStart = new Date(startObj.getTime() - (startObj.getTimezoneOffset() * 60000));
          const startStr = localStart.toISOString().split('T')[0];
          onStartChange(startStr);
          onEndChange(''); // wait for end date
        } else if (selectedDates.length === 2) {
          const startObj = selectedDates[0];
          const endObj = selectedDates[1];
          const localStart = new Date(startObj.getTime() - (startObj.getTimezoneOffset() * 60000));
          const localEnd = new Date(endObj.getTime() - (endObj.getTimezoneOffset() * 60000));
          onStartChange(localStart.toISOString().split('T')[0]);
          onEndChange(localEnd.toISOString().split('T')[0]);
        }
      }
    });

    return () => {
      if (fpRef.current) {
        fpRef.current.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (fpRef.current) {
      if (!startDate && !endDate) {
         fpRef.current.clear(false); 
      }
    }
  }, [startDate, endDate]);

  return (
    <div className="custom-date-range-picker unified">
      <Calendar size={14} className="cdrp-icon" />
      <input
        ref={inputRef}
        className="cdrp-input single-range"
        placeholder={placeholder}
      />
    </div>
  );
}
