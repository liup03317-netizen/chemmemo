import { Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BalanceEquationProps {
  reactants: string[];
  products: string[];
  conditions?: string;
  valueReactants: number[];
  valueProducts: number[];
  onChange: (nextReactants: number[], nextProducts: number[]) => void;
  className?: string;
}

function normalizeConditionText(text: string) {
  return text
    .trim()
    .replace(/，/g, ',')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' · ');
}

function isNoCondition(text: string) {
  const t = text.trim();
  return !t || t === '无' || t === '无条件';
}

function clampCoef(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(20, Math.floor(n)));
}

function CoefStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(clampCoef(value - 1))}
        className="w-9 h-9 rounded-xl border-2 border-b-4 border-gray-200 bg-white flex items-center justify-center text-gray-600 active:translate-y-1 active:border-b-0"
      >
        <Minus className="w-4 h-4 stroke-[3px]" />
      </button>
      <div className="min-w-10 text-center text-lg font-extrabold text-gray-800">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(clampCoef(value + 1))}
        className="w-9 h-9 rounded-xl border-2 border-b-4 border-gray-200 bg-white flex items-center justify-center text-gray-600 active:translate-y-1 active:border-b-0"
      >
        <Plus className="w-4 h-4 stroke-[3px]" />
      </button>
    </div>
  );
}

export function BalanceEquation({
  reactants,
  products,
  conditions,
  valueReactants,
  valueProducts,
  onChange,
  className,
}: BalanceEquationProps) {
  const cond = isNoCondition(conditions ?? '') ? '' : normalizeConditionText(conditions ?? '');

  return (
    <div
      className={twMerge(
        clsx(
          'w-full bg-white rounded-2xl border-2 border-b-4 border-gray-200 px-4 py-4',
          className
        )
      )}
    >
      <div className="flex items-center justify-center gap-3 flex-wrap font-extrabold text-gray-700">
        {reactants.map((sp, idx) => (
          <div key={`r-${idx}`} className="flex items-center gap-2">
            <CoefStepper
              value={valueReactants[idx] ?? 1}
              onChange={(next) => {
                const nextReactants = [...valueReactants];
                nextReactants[idx] = next;
                onChange(nextReactants, valueProducts);
              }}
            />
            <span className="text-xl">{sp}</span>
            {idx < reactants.length - 1 ? (
              <span className="text-xl text-gray-400">+</span>
            ) : null}
          </div>
        ))}

        <span className="inline-flex flex-col items-center justify-center px-2 select-none">
          {cond ? (
            <span className="text-xs font-bold text-gray-500 leading-none whitespace-nowrap">
              {cond}
            </span>
          ) : null}
          <span className="text-2xl leading-none">→</span>
        </span>

        {products.map((sp, idx) => (
          <div key={`p-${idx}`} className="flex items-center gap-2">
            <CoefStepper
              value={valueProducts[idx] ?? 1}
              onChange={(next) => {
                const nextProducts = [...valueProducts];
                nextProducts[idx] = next;
                onChange(valueReactants, nextProducts);
              }}
            />
            <span className="text-xl">{sp}</span>
            {idx < products.length - 1 ? (
              <span className="text-xl text-gray-400">+</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

