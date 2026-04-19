import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface EquationLineProps {
  reactants: string[];
  products: string[];
  conditions?: string;
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

export function EquationLine({ reactants, products, conditions, className }: EquationLineProps) {
  const rawCond = (conditions ?? '').trim();
  const cond =
    !rawCond || rawCond === '无' || rawCond === '无条件'
      ? ''
      : normalizeConditionText(rawCond);

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
        <span className="text-xl">{reactants.join(' + ')}</span>

        <span className="inline-flex flex-col items-center justify-center px-2 select-none">
          {cond ? (
            <span className="text-xs font-bold text-gray-500 leading-none whitespace-nowrap">
              {cond}
            </span>
          ) : null}
          <span className="text-2xl leading-none">→</span>
        </span>

        <span className="text-xl">{products.join(' + ')}</span>
      </div>
    </div>
  );
}
