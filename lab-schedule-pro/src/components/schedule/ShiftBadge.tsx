import React from 'react';
import { cn } from '../../utils/cn';
import type { ShiftType } from '../../types';
import { getShiftDefinition } from '../../data/shifts';

interface ShiftBadgeProps {
  shift: ShiftType;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'text-[10px] px-1.5 py-0.5 min-w-[38px]',
  sm: 'text-xs px-2 py-1 min-w-[46px]',
  md: 'text-sm px-2.5 py-1.5 min-w-[56px]',
};

export const ShiftBadge = ({ shift, onClick, size = 'sm', showLabel = false, className }: ShiftBadgeProps) => {
  const def = getShiftDefinition(shift);

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        backgroundColor: def.bgColor,
        color: def.textColor,
        borderColor: `${def.color}30`,
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold border select-none transition-all duration-150',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80 active:scale-95',
        className
      )}
      title={def.label}
    >
      {showLabel ? def.label : def.shortLabel}
    </span>
  );
};

interface ShiftPickerProps {
  value?: ShiftType;
  onChange: (shift: ShiftType) => void;
  onClear?: () => void;
  compact?: boolean;
}

import { SHIFT_ORDER } from '../../data/shifts';

export const ShiftPicker = ({ value, onChange, onClear, compact = false }: ShiftPickerProps) => {
  return (
    <div className={cn('flex flex-wrap gap-1.5', compact && 'gap-1')}>
      {SHIFT_ORDER.map((shiftId) => {
        const def = getShiftDefinition(shiftId);
        return (
          <button
            key={shiftId}
            type="button"
            onClick={() => onChange(shiftId)}
            style={{
              backgroundColor: value === shiftId ? def.color : def.bgColor,
              color: value === shiftId ? '#ffffff' : def.textColor,
              borderColor: def.color,
            }}
            className={cn(
              'rounded-lg border font-semibold transition-all duration-150 active:scale-95',
              compact ? 'text-[10px] px-1.5 py-0.5 min-w-[42px]' : 'text-xs px-2.5 py-1.5 min-w-[52px]'
            )}
            title={def.label}
          >
            {compact ? def.shortLabel : def.label}
          </button>
        );
      })}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-slate-300 bg-slate-100 text-slate-600 font-semibold text-xs px-2.5 py-1.5 hover:bg-slate-200 transition-all active:scale-95"
        >
          Clear
        </button>
      )}
    </div>
  );
};
