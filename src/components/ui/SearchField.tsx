import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./Input";

interface SearchFieldProps { value: string; onCommit: (value: string) => void; placeholder: string; label: string }

/** Text box that reports its value 300 ms after typing stops. */
export function SearchField({ value, onCommit, placeholder, label }: SearchFieldProps) {
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);
  useEffect(() => {
    if (text === value) return;
    const t = window.setTimeout(() => onCommit(text), 300);
    return () => window.clearTimeout(t);
  }, [text, value, onCommit]);
  return <Input type="search" aria-label={label} placeholder={placeholder} icon={<Search className="size-4" />} value={text} onChange={(e) => setText(e.target.value)} />;
}
