import { useState } from '@wordpress/element';
import {
    RangeControl,
    __experimentalUnitControl as UnitControl,
    ButtonGroup,
    Button
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function ResponsiveRangeUnitControl({
    label,
    value = {},                // { desktop: "10px", tablet: "8px", mobile: "5px" }
    onChange,
    units = ['px', '%', 'rem'],
    min = 0,
    max = 100,
}) {

    const [device, setDevice] = useState("desktop"); // desktop | tablet | mobile

    // Create fallback values
    const val = value[device] || "0px";

    const parseValue = () => {
        const num = parseFloat(val) || 0;
        const unit = units.find(u => val.includes(u)) || units[0];
        return { num, unit };
    };

    const { num, unit } = parseValue();

    const updateNum = (numVal) => {
        const newValue = { ...value, [device]: `${numVal}${unit}` };
        onChange(newValue);
    };

    const updateUnit = (unitVal) => {
        const newValue = { ...value, [device]: `${num}${unitVal}` };
        onChange(newValue);
    };

    return (
        <div className="s1-field-control">

            {/* LABEL */}
            <label className="s1-field-label">{label}</label>

            {/* DEVICE SWITCHER */}
            <ButtonGroup className="s1-device-switcher">
                <Button
                    isPrimary={device === "desktop"}
                    onClick={() => setDevice("desktop")}
                >
                    🖥
                </Button>
                <Button
                    isPrimary={device === "tablet"}
                    onClick={() => setDevice("tablet")}
                >
                    📱
                </Button>
                <Button
                    isPrimary={device === "mobile"}
                    onClick={() => setDevice("mobile")}
                >
                    📲
                </Button>
            </ButtonGroup>

            {/* RANGE + UNIT CONTROL */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                
                <div style={{ flex: 1 }}>
                    <RangeControl
                        value={num}
                        min={min}
                        max={max}
                        step={1}
                        onChange={updateNum}
                    />
                </div>

                <div style={{ width: 80 }}>
                    <UnitControl
                        value={unit}
                        units={units.map(u => ({ value: u, label: u }))}
                        onChange={updateUnit}
                        hideLabelFromVision
                    />
                </div>
            </div>
        </div>
    );
}