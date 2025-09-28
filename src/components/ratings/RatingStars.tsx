import React from 'react';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
}) => {
  const stars = [1,2,3,4,5];
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <div className="flex gap-1">
      {stars.map(s => {
        const filled = s <= value;
        return (
          <button
            key={s}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(s)}
            className={`${cls} ${readonly ? 'cursor-default' : 'cursor-pointer'} ${
              filled ? 'text-yellow-500' : 'text-gray-300'
            }`}
            aria-label={`Set rating ${s}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};