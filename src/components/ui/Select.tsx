import { useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption { value: string; label: string }

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

export function Select({ label, options, id, className = "", ...rest }: SelectProps) {
  const auto = useId();
  const selectId = id ?? auto;
  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">{label}</label>
      <div className="relative">
        <select id={selectId} className={`h-11 w-full min-w-36 appearance-none rounded-xl border border-line bg-surface pl-4 pr-10 ${className}`} {...rest}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}
