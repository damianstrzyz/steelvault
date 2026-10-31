import { useId, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string | null;
  hint?: string;
}

export function Input({ label, icon, error, hint, id, className = "", ...rest }: InputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const noteId = `${inputId}-note`;
  return (
    <div>
      {label && <label htmlFor={inputId} className="mb-1.5 block text-sm text-muted">{label}</label>}
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? noteId : undefined}
          className={`h-11 w-full rounded-xl border bg-surface px-4 placeholder:text-muted ${error ? "border-danger" : "border-line"} ${icon ? "pl-10" : ""} ${className}`}
          {...rest}
        />
      </div>
      {(error || hint) && <p id={noteId} className={`mt-1.5 text-sm ${error ? "text-danger" : "text-muted"}`}>{error ?? hint}</p>}
    </div>
  );
}
