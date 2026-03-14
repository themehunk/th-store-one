import { __ } from "@wordpress/i18n";
import UniversalRangeControl from "@storeone-global/UniversalRangeControl";
import { S1Field } from "@storeone-global/S1Field";

export default function OpacityControl({
    value = "100",
    label = __("Opacity (%)", "store-one"),
    description = "",
    onChange
}) {
    return (
                <UniversalRangeControl
                   label={label}
                    value={value ?? "100"}
                    min={0}
                    max={100}
                    step={1}
                    defaultValue="100"
                    onChange={(v) => onChange(v)}
                />
    );
}