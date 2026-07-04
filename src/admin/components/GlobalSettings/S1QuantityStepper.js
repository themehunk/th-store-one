import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";

/* ---------------------------------
 * Numeric input with -/+ stepper buttons
 * --------------------------------- */
export default function S1QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
}) {
  const numeric = Number(value) || 0;

  const clamp = (next) => {
    let v = next;
    if (typeof min === "number") v = Math.max(min, v);
    if (typeof max === "number") v = Math.min(max, v);
    return v;
  };

  return (
    <div className="s1-qty-stepper">
      <button
        type="button"
        className="s1-qty-btn"
        onClick={() => onChange(clamp(numeric - step))}
        aria-label="Decrease"
      >
        <MinusIcon />
      </button>

      <input
        type="number"
        className="s1-qty-input"
        value={numeric}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />

      <button
        type="button"
        className="s1-qty-btn"
        onClick={() => onChange(clamp(numeric + step))}
        aria-label="Increase"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
