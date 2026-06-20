import { useEffect, useRef } from "@wordpress/element";
import { TextControl } from "@wordpress/components";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import Sortable from "sortablejs";

const createTier = () => ({
  id: crypto.randomUUID(),
  from_qty: 1,
  to_qty: "",
  offer: "percent",
  value: 0,
});

export default function QuantityTiersControl({ value = [], onChange }) {
  const sortableRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!value?.length) {
      onChange([createTier()]);
    }
  }, []);

  useEffect(() => {
    if (!sortableRef.current) return;

    const sortable = Sortable.create(sortableRef.current, {
      animation: 150,
      handle: ".s1-tier-drag",
      ghostClass: "s1-tier-ghost",
      onEnd: ({ oldIndex, newIndex }) => {
        if (oldIndex === newIndex) return;
        const items = [...valueRef.current];
        const [moved] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, moved);
        onChange(items);
      },
    });

    return () => sortable.destroy();
  }, []);

  const updateTier = (index, field, fieldValue) => {
    const tiers = [...value];
    tiers[index] = { ...tiers[index], [field]: fieldValue };
    onChange(tiers);
  };

  const removeTier = (index) => {
    const tiers = value.filter((_, i) => i !== index);
    onChange(tiers);
  };

  return (
    <div className="s1-quantity-tiers-wrapper">
      <div className="s1-tier-table">
        <div className="s1-tier-th">
          <div className="s1-th-drag"></div>
          <div>From Qty</div>
          <div>To Qty</div>
          <div>Offer Type</div>
          <div>offer</div>
          <div></div>
        </div>

        <div ref={sortableRef} className="s1-tier-tbody">
          {value.map((tier, index) => (
            <div key={tier.id} className="s1-tier-tr">
              <div className="s1-tier-drag">
                <DragHandleDots2Icon />
              </div>

              <div className="s1-td-field">
                <TextControl
                  type="number"
                  min={1}
                  value={tier.from_qty}
                  onChange={(v) =>
                    updateTier(index, "from_qty", parseInt(v || 0, 10))
                  }
                />
              </div>

              <div className="s1-td-field">
                <TextControl
                  type="number"
                  placeholder="0"
                  value={tier.to_qty}
                  onChange={(v) => updateTier(index, "to_qty", v)}
                />
              </div>

              {/* standard select use kiya takki custom width/height absolute match kare */}
              <div className="s1-td-field">
                <select
                  className="s1-compact-select"
                  value={tier.offer}
                  onChange={(e) => updateTier(index, "offer", e.target.value)}
                >
                  <option value="percent">Percent Discount (%)</option>
                  <option value="fixed">Price Discount ($)</option>
                  <option value="fixed_price">Fixed Price</option>
                </select>
              </div>

              <div className="s1-td-field">
                <TextControl
                  type="number"
                  value={tier.value}
                  onChange={(v) =>
                    updateTier(index, "value", parseFloat(v || 0))
                  }
                />
              </div>

              <div className="s1-td-action">
                <button
                  type="button"
                  className="s1-tier-btn-remove"
                  onClick={() => removeTier(index)}
                  title="Remove tier"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="s1-tier-footer">
        <button
          type="button"
          className="s1-tier-btn-add"
          onClick={() => onChange([...value, createTier()])}
        >
          + Add Tier
        </button>
        <p className="s1-tier-help-text">
          Each tier sets a quantity range and the discount applied.
        </p>
      </div>
    </div>
  );
}
