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
