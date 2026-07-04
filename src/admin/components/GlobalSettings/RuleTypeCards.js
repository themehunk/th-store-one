import { CheckIcon } from "@radix-ui/react-icons";

/* ---------------------------------
 * Icon + Title + Description card selector
 * (used for "Choose Rule" style pickers)
 * --------------------------------- */
export default function RuleTypeCards({ options, value, onChange }) {
  return (
    <div className="s1-rule-type-cards">
      {options.map((opt) => {
        const isActive = value === opt.value;
        const isDisabled = !!opt.disabled;

        return (
          <div
            key={opt.value}
            className={`s1-rule-type-card ${isActive ? "is-active" : ""} ${
              isDisabled ? "is-disabled" : ""
            }`}
            onClick={() => onChange(opt.value)}
          >
            <div className="s1-rule-type-card-top">
              {opt.icon && <span className="s1-rule-type-icon">{opt.icon}</span>}
              <span className="s1-rule-type-check">
                {isActive && <CheckIcon />}
              </span>
            </div>

            <strong className="s1-rule-type-title">{opt.title}</strong>

            {opt.description && (
              <p className="s1-rule-type-desc">{opt.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
