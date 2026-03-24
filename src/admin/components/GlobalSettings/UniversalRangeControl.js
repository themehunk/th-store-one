/**
 * ---------------------------------------------------------
 * UNIVERSAL RANGE CONTROL – StoreOne UI
 * ---------------------------------------------------------
 *
 * A flexible, all-purpose range input for StoreOne Admin UI.
 * Supports:
 *   ✓ Responsive (Desktop / Tablet / Mobile)
 *   ✓ Non-responsive (single value)
 *   ✓ With unit (px, %, rem…)
 *   ✓ Without unit (number only)
 *   ✓ Slider + Number Input + Unit Selector
 *   ✓ DeviceControl automatically visible when responsive=true
 *
 * ---------------------------------------------------------
 * USAGE EXAMPLES
 * ---------------------------------------------------------
 *
 * 1SIMPLE NUMBER RANGE (no units, no responsive)
 *
 * <UniversalRangeControl
 *     label="Opacity"
 *     value={settings.opacity}
 *     onChange={(v) => updateSetting("opacity", v)}
 * />
 *
 * Result saved:
 *   opacity: "30"
 *
 * ---------------------------------------------------------
 *
 * 2️RANGE WITH UNITS (px, %, rem…)
 *
 * <UniversalRangeControl
 *     label="Width"
 *     units={['px', '%']}
 *     value={settings.width}
 *     onChange={(v) => updateSetting("width", v)}
 *     defaultValue="20px"
 * />
 *
 * Result saved:
 *   width: "50%"
 *
 * ---------------------------------------------------------
 *
 * 3️RESPONSIVE RANGE (Desktop / Tablet / Mobile)
 *
 * <UniversalRangeControl
 *     label="Border Radius"
 *     responsive={true}
 *     units={['px', '%']}
 *     value={settings.border_radius}
 *     onChange={(v) => updateSetting("border_radius", v)}
 *     defaultValue="10px"
 * />
 *
 * Result saved:
 *   border_radius: {
 *      Desktop: "10px",
 *      Tablet: "8px",
 *      Mobile: "5px"
 *   }
 *
 * ---------------------------------------------------------
 *
 * 4️RESPONSIVE WITHOUT UNITS
 *
 * <UniversalRangeControl
 *     label="Items Per Row"
 *     responsive={true}
 *     units={null}
 *     value={settings.itemsPerRow}
 *     onChange={(v) => updateSetting("itemsPerRow", v)}
 * />
 *
 * Saved result:
 *   itemsPerRow: {
 *      Desktop: "4",
 *      Tablet: "3",
 *      Mobile: "2"
 *   }
 *
 * ---------------------------------------------------------
 *
 * TIPS:
 *   ✔ Use units=null to hide unit dropdown.
 *   ✔ Use responsive=true to show DeviceControl automatically.
 *   ✔ Always store responsive fields as an object:
 *        { Desktop:'', Tablet:'', Mobile:'' }
 *
 * ---------------------------------------------------------
 */

import {
    RangeControl,
    SelectControl,
    BaseControl,
    __experimentalNumberControl as NumberControl,
} from '@wordpress/components';

import DeviceControl from '@th-storeone-global/DeviceControl';
import { parseRawValue } from '@th-storeone/utils';
import useDeviceStore from '@th-storeone/store/device-store';

export default function UniversalRangeControl({
    label = "Control",
    value,
    onChange,
    units = null,
    responsive = false,
    defaultValue = "0",
    min = 0,
    max = 100,
    step = 1,
}) {
    const device = useDeviceStore((s) => s.device);

    const raw = responsive
        ? (value?.[device] ?? defaultValue)
        : (value ?? defaultValue);

    const [num, unit] = parseRawValue(raw);

    const update = (newRaw) => {
        if (responsive) {
            onChange({ ...value, [device]: newRaw });
        } else {
            onChange(newRaw);
        }
    };

    const changeNumber = (v) => update(v + (unit || ""));
    const changeUnit = (u) => update(num + u);

    const showUnits = Array.isArray(units) && units.length > 0;

    return (
        <div className="s1-range-wrapper">

            {/* Label + Device */}
            <div className="s1-range-header">
                <label className="s1-range-label">
                    {responsive ? `${label} (${device})` : label}
                </label>

                {responsive && <DeviceControl />}
            </div>

            {/* Layout */}
            <div className="s1-range-row">

                <div className="s1-slider-area">
                    <RangeControl
                        value={num}
                        onChange={changeNumber}
                        min={min}
                        max={max}
                        step={step}
                        withInputField={false}
                    />
                </div>

                <div className="s1-number-area">
                    <NumberControl
                        value={num}
                        onChange={(v) => changeNumber(v)}
                        min={min}
                        max={max}
                        step={step}
                    />
                </div>

                {showUnits && (
                    <div className="s1-unit-area">
                        <SelectControl
                            value={unit || units[0]}
                            options={units.map((u) => ({ label: u, value: u }))}
                            onChange={changeUnit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}