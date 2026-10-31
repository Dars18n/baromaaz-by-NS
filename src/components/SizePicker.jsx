"use client";

// stock: optional { S: 5, M: 0, ... } — sizes with 0 are shown crossed out and can't be picked.
export default function SizePicker({ sizes, value, onChange, name, error, stock }) {
  const left = value && stock ? stock[value] : null;
  return (
    <fieldset>
      <legend className="sr-only">Select size</legend>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const soldOut = stock ? (stock[s] ?? 0) <= 0 : false;
          return (
            <label key={s} className={soldOut ? "cursor-not-allowed" : "cursor-pointer"}>
              <input type="radio" name={name} value={s} checked={value === s} disabled={soldOut} onChange={() => onChange(s)} className="peer sr-only" aria-label={soldOut ? `${s} — sold out` : s} />
              <span className={`flex h-11 min-w-[48px] items-center justify-center border px-3 text-sm transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terracotta ${soldOut ? "border-ink/15 text-ink-muted line-through" : "border-ink/30 hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ivory"}`}>
                {s}
              </span>
            </label>
          );
        })}
      </div>
      {left != null && left > 0 && left <= 3 && <p className="mt-2 text-sm text-terracotta-dark">Only {left} left in {value}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-terracotta-dark">{error}</p>}
    </fieldset>
  );
}
