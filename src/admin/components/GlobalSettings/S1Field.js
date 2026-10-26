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
  locked = false,
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
      <div className="s1-field-group-body">
        {locked ? <S1ProLock>{children}</S1ProLock> : children}
      </div>
    </div>
  );
};

/* ---------------------------------
 * Pro lock: children stay visible but every control is disabled.
 * Wrap a whole group (S1FieldGroup locked) or only some fields.
 * --------------------------------- */
export const S1ProLock = ({ locked = true, badge = false, children }) => {
  if (!locked) return children;

  return (
    <div className="s1-pro-lock" aria-disabled="true">
      {badge && <span className="s1-field-group-pro-badge s1-pro-lock-badge">PRO</span>}
      <fieldset disabled className="s1-pro-lock-fieldset">
        {children}
      </fieldset>
      <div className="s1-pro-lock-overlay">
        <a
          className="s1-pro-lock-label"
          href="https://themehunk.com/storeone/?utm_campaign=free_plugin&utm_source=dashboard&utm_medium=upgrade_button"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Unlock with Pro
        </a>
      </div>
    </div>
  );
};
