/* ---------------------------------
 * Single Field Wrapper
 * --------------------------------- */
export const S1Field = ({
  label,
  description,
  children,
  classN,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <div className={`s1-field-wrapper ${classN || ""}`}>
      {label && <label className="s1-field-label">{label}</label>}
      {description && <p className="s1-field-description">{description}</p>}
      <div className="s1-field-control">{children}</div>
    </div>
  );
};

export const S1FieldGroup = ({
  title,
  description,
  children,
  number = false,
  shortdescription,
  pro,
}) => {
  return (
    <div className="s1-field-group">
      <div className="s1-field-group-header">
        <div className="s1-field-group-heading">
          <div className="s1-field-group-title-wrapper">
            {number !== false && (
              <span className="s1-field-group-number">{number}</span>
            )}
            <h4 className="s1-field-group-title">{title}</h4>
            {pro && (
              <span className="s1-field-group-pro-desc">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.6 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 3.5" />
                  <path d="M12 17h.01" />
                </svg>

                <span className="s1-field-group-pro-tooltip">
                  These settings are available in Store One Pro. Upgrade to Pro
                  to enable these settings.
                </span>
              </span>
            )}
            {pro && <span className="s1-field-group-pro-badge">PRO</span>}
          </div>
          <div className="s1-field-group-short-description-wrapper">
            {shortdescription && (
              <span className="s1-field-group-hint">{shortdescription}</span>
            )}
          </div>
        </div>
      </div>
      {description && <p className="s1-field-group-desc">{description}</p>}
      <div className="s1-field-group-body">{children}</div>
    </div>
  );
};
