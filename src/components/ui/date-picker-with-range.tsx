import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';

interface DatePickerWithRangeProps {
  date: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onDateChange: (date: { from: Date | undefined; to: Date | undefined }) => void;
}

export const DatePickerWithRange = ({ date, onDateChange }: DatePickerWithRangeProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <Calendar
        mode="range"
        selected={{
          from: date.from,
          to: date.to
        }}
        onSelect={(range) => {
          if (range) {
            onDateChange({
              from: range.from,
              to: range.to
            });
          }
        }}
        locale={ptBR}
        numberOfMonths={2}
        className="rounded-md border"
      />
    </div>
  );
};