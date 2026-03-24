/**
 * MiniColorPicker Component
 * ---------------------------------------------
 * A lightweight WordPress-styled color/gradient picker.
 *
 * DEFAULT VALUES:
 *  - allowGradient = false     → Only solid colors
 *  - value = "#000" (fallback) → If no value provided
 *
 * HOW VALUE IS RETURNED:
 *  - Solid color → "#ffffff" OR "rgba(0,0,0,0.5)"
 *  - Gradient    → "linear-gradient(...)"
 *
 * PROPS:
 *  label           (string)     → Field label
 *  value           (string)     → Color or gradient
 *  onChange        (function)   → Returns updated string value
 *  allowGradient   (boolean)    → Enables "Gradient" tab
 *
 * USAGE EXAMPLES:
 *
 * 1️⃣ **Color Only (default)**
 * ------------------------------------
 * <MiniColorPicker
 *     label="Border Color"
 *     value={settings.border_color}      // "#ff0000"
 *     onChange={(v) => updateSetting('border_color', v)}
 * />
 *
 * 2️⃣ **Color + Gradient**
 * ------------------------------------
 * <MiniColorPicker
 *     label="Background"
 *     allowGradient={true}
 *     value={settings.background}        // "linear-gradient(...)"
 *     onChange={(v) => updateSetting('background', v)}
 * />
 */

import { useState, useRef } from '@wordpress/element';
import { Popover, ColorPicker, GradientPicker } from '@wordpress/components';

export default function MiniColorPicker({
    label,
    value,
    onChange,

    /** ⭐ DEFAULT: Gradient disabled */
    allowGradient = false,
}) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState("color");
    const ref = useRef();

    /**
     * Returns true if the value is a CSS gradient string.
     */
    const isGradient = (v) =>
        typeof v === "string" && v.includes("gradient");

    /**
     * Normalize WordPress ColorPicker format to a clean CSS string.
     * DEFAULT COLOR = "#000"
     */
    const normalizeColor = (v) => {
        if (!v) return "#000"; //default fallback

        if (typeof v === "string") return v;

        if (v?.rgb) {
            const { r, g, b, a = 1 } = v.rgb;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        return "#000";
    };

    /** The displayed safe value (color or gradient) */
    const safeValue = normalizeColor(value);

    return (
        <div className="store-one-color-field">

            <label className="store-one-color-label">{label}</label>

            <div className="store-one-color-wrapper">

                {/* Color Swatch */}
                <div
                    ref={ref}
                    className="store-one-color-box"
                    style={{ background: safeValue }}
                    onClick={() => setOpen(true)}
                ></div>

                {/* HEX / RGBA input */}
                <input
                    type="text"
                    className="store-one-color-input"
                    value={safeValue}
                    onChange={(e) => onChange(e.target.value)}
                />

                {open && (
                    <Popover
                        anchor={ref.current}
                        onClose={() => setOpen(false)}
                    >
                        <div style={{ width: 230, padding: 10 }}>

                            {/* Tabs only visible when allowGradient = true */}
                            {allowGradient && (
                                <div className="s1-color-tabs">
                                    <button
                                        className={tab === "color" ? "active" : ""}
                                        onClick={() => setTab("color")}
                                    >
                                        Color
                                    </button>

                                    <button
                                        className={tab === "gradient" ? "active" : ""}
                                        onClick={() => setTab("gradient")}
                                    >
                                        Gradient
                                    </button>
                                </div>
                            )}

                            {/* COLOR PICKER */}
                            {(tab === "color" || !allowGradient) && (
                                <ColorPicker
                                    color={isGradient(safeValue) ? "#000" : safeValue}
                                    enableAlpha
                                    onChange={(v) => onChange(normalizeColor(v))}
                                />
                            )}

                            {/* GRADIENT PICKER */}
                            {allowGradient && tab === "gradient" && (
                                <GradientPicker
                                    value={isGradient(safeValue) ? safeValue : undefined}
                                    onChange={(gradient) => onChange(gradient)}
                                    gradients={[
                                        {
                                            name: "Sunset",
                                            gradient: "linear-gradient(135deg,#f6d365,#fda085)"
                                        },
                                        {
                                            name: "Ocean",
                                            gradient: "linear-gradient(135deg,#2BC0E4,#EAECC6)"
                                        },
                                        {
                                            name: "Peach",
                                            gradient: "linear-gradient(135deg,#ed4264,#ffedbc)"
                                        }
                                    ]}
                                />
                            )}

                        </div>
                    </Popover>
                )}
            </div>
        </div>
    );
}