import { useState, useRef } from '@wordpress/element';
import { Popover, ColorPicker } from '@wordpress/components';

export default function MiniColorPicker({ label, value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    // Converts any WP colorPicker format → string
    const normalizeColor = (v) => {
        if (!v) return "rgba(0,0,0,1)";

        if (typeof v === "string") return v;

        if (v.rgb) {
            const { r, g, b, a = 1 } = v.rgb;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        if (v.color) return v.color;

        return "#000";
    };

    const safeValue = normalizeColor(value);

    return (
        <div className="store-one-color-field">

            {/* LABEL */}
            <label className="store-one-color-label">
                {label}
            </label>

            {/* SWATCH + INPUT WRAPPER */}
            <div className="store-one-color-wrapper">

                {/* Color Swatch */}
                <div
                    ref={ref}
                    className="store-one-color-box"
                    style={{ background: safeValue }}
                    onClick={() => setOpen(true)}
                ></div>

                {/* Input */}
                <input
                    type="text"
                    className="store-one-color-input"
                    value={safeValue}
                    onChange={(e) => onChange(e.target.value)}
                />

                {/* Popover Color Picker */}
                {open && (
                    <Popover
                        anchor={ref.current}
                        onClose={() => setOpen(false)}
                    >
                        <div style={{ padding: 10 }}>
                            <ColorPicker
                                color={safeValue}
                                enableAlpha={true}
                                onChange={(v) => {
                                    const final = normalizeColor(v);
                                    onChange(final);
                                }}
                            />
                        </div>
                    </Popover>
                )}
            </div>
        </div>
    );
}
