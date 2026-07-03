import { Icon, check } from "@wordpress/icons";

export default function RuleSelector({ value, onChange, options = [] }) {
  return (
    <div className="s1-rule-selector">
      {options.map((item) => {
        const active = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            className={`s1-rule-card ${active ? "is-active" : ""}`}
            onClick={() => onChange(item.value)}
          >
            <div className="s1-rule-check">
              {active && <Icon icon={check} />}
            </div>

            <div className="s1-rule-icon">{item.icon}</div>

            <div className="s1-rule-title">{item.title}</div>

            <div className="s1-rule-desc">{item.description}</div>

            {item.pro && <span className="s1-rule-badge">PRO</span>}
          </button>
        );
      })}
    </div>
  );
}
