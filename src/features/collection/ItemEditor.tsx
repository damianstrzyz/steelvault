import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { CONDITION_LABELS } from "./constants";
import { parseMoney, parseQuantity, parseTags } from "./forms";
import { useCollectionActions } from "./queries";
import type { CollectionItem, ItemCondition, ItemPatch } from "./types";

const conditionOptions = [{ value: "", label: "Not set" }, ...Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }))];
const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));
const today = () => new Date().toISOString().slice(0, 10);

interface Errors { quantity?: string; purchase?: string; value?: string; date?: string; tags?: string; notes?: string }

function ItemForm({ item, onClose }: { item: CollectionItem; onClose: () => void }) {
  const { update, remove } = useCollectionActions();
  const owned = item.status === "owned";
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [condition, setCondition] = useState<string>(item.condition ?? "");
  const [packaging, setPackaging] = useState<string>(item.packaging_condition ?? "");
  const [currency, setCurrency] = useState<Currency>(item.currency);
  const [purchase, setPurchase] = useState(item.purchase_price?.toString() ?? "");
  const [value, setValue] = useState(item.current_value?.toString() ?? "");
  const [date, setDate] = useState(item.purchase_date ?? "");
  const [tags, setTags] = useState(item.tags.join(", "));
  const [notes, setNotes] = useState(item.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [confirmRemove, setConfirmRemove] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = parseTags(tags);
    const next: Errors = { tags: t.error, notes: notes.length > 2000 ? "Notes can be up to 2000 characters." : undefined };
    const patch: Partial<ItemPatch> = { tags: t.value, notes: notes.trim() === "" ? null : notes.trim() };

    if (owned) {
      const q = parseQuantity(quantity);
      const pp = parseMoney(purchase);
      const cv = parseMoney(value);
      next.quantity = q.error; next.purchase = pp.error; next.value = cv.error;
      next.date = date > today() ? "The purchase date cannot be in the future." : undefined;
      Object.assign(patch, {
        quantity: q.value,
        condition: condition === "" ? null : (condition as ItemCondition),
        packaging_condition: packaging === "" ? null : (packaging as ItemCondition),
        currency,
        purchase_price: pp.value,
        current_value: cv.value,
        purchase_date: date === "" ? null : date,
      });
    }
    if (Object.values(next).some(Boolean)) { setErrors(next); return; }
    setErrors({});
    update.mutate({ id: item.id, patch }, { onSuccess: onClose });
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-muted">{item.products.platform} · {item.products.region}{item.products.edition_name ? ` · ${item.products.edition_name}` : ""}</p>
        {owned && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} error={errors.quantity} hint="Use more than 1 for duplicates." />
              <Select label="Currency" value={currency} options={currencyOptions} onChange={(e) => setCurrency(e.target.value as Currency)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Item condition" value={condition} options={conditionOptions} onChange={(e) => setCondition(e.target.value)} />
              <Select label="Packaging condition" value={packaging} options={conditionOptions} onChange={(e) => setPackaging(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Purchase price (each)" inputMode="decimal" value={purchase} onChange={(e) => setPurchase(e.target.value)} error={errors.purchase} />
              <Input label="Current value (each)" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} error={errors.value} />
            </div>
            <Input label="Purchase date" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
          </>
        )}
        <Input label="Tags" value={tags} onChange={(e) => setTags(e.target.value)} error={errors.tags} hint="Separate with commas, for example: limited, signed, sealed." />
        <div>
          <label htmlFor="item-notes" className="mb-1.5 block text-sm text-muted">Notes</label>
          <textarea id="item-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-4 py-3" />
          {errors.notes && <p className="mt-1.5 text-sm text-danger">{errors.notes}</p>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button variant="danger" onClick={() => setConfirmRemove(true)}>{owned ? "Remove from collection" : "Remove from wishlist"}</Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={update.isPending}>Save</Button>
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={confirmRemove}
        title={owned ? "Remove from collection?" : "Remove from wishlist?"}
        message={`${item.products.name} will be removed, including any prices, tags and notes you saved for it.`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => { setConfirmRemove(false); remove.mutate(item, { onSuccess: onClose }); }}
        onCancel={() => setConfirmRemove(false)}
      />
    </>
  );
}

export function ItemEditor({ item, onClose }: { item: CollectionItem | null; onClose: () => void }) {
  return (
    <Modal open={item !== null} title={item?.products.name ?? ""} onClose={onClose}>
      {item && <ItemForm key={item.id} item={item} onClose={onClose} />}
    </Modal>
  );
}
