import React from '@wordpress/element';

/* ---------------------------------
 * Single Field Wrapper
 * --------------------------------- */
export const S1Field = ({ label, children, classN, visible = true }) => {
    if (!visible) return null; // 👈 fully hide

    return (
        <div className={`s1-field-wrapper ${classN || ''}`}>
            {label && (
                <label className="s1-field-label">
                    {label}
                </label>
            )}
            <div className="s1-field-control">
                {children}
            </div>
        </div>
    );
};

/* ---------------------------------
 * Field Group Wrapper
 * --------------------------------- */
export const S1FieldGroup = ({ title, description, children }) => {
    return (
        <div className="s1-field-group">
            <div className="s1-field-group-header">
                <h4 className="s1-field-group-title">
                    {title}
                </h4>

                {description && (
                    <p className="s1-field-group-desc">
                        {description}
                    </p>
                )}
            </div>

            <div className="s1-field-group-body">
                {children}
            </div>
        </div>
    );
};
