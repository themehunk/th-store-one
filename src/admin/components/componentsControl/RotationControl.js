import { __ } from "@wordpress/i18n";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import { S1Field,S1FieldGroup } from "@th-storeone-global/S1Field";

export default function RotationControl({
    value = {},
    label = __("Rotation", "th-store-one"),
    description = "",
    onChange
}) {

    const update = (key, val) => {
        onChange({
            ...value,
            [key]: val
        });
    };

    return (
       
             <S1FieldGroup title={label}>
            <S1Field>

                <div className="s1-rotation-grid">

                    <div className="s1-rotation-item">
                        <div className="s1-rotation-axis">X</div>
                        <UniversalRangeControl
                            label={false}
                            value={value.rotateX ?? "0"}
                            min={-360}
                            max={360}
                            step={1}
                            defaultValue="0"
                            onChange={(v) => update("rotateX", v)}
                        />
                    </div>

                    <div className="s1-rotation-item">
                        <div className="s1-rotation-axis">Y</div>
                        <UniversalRangeControl
                            label={false}
                            value={value.rotateY ?? "0"}
                            min={-360}
                            max={360}
                            step={1}
                            defaultValue="0"
                            onChange={(v) => update("rotateY", v)}
                        />
                    </div>

                    <div className="s1-rotation-item">
                        <div className="s1-rotation-axis">Z</div>
                        <UniversalRangeControl
                            label={false}
                            value={value.rotateZ ?? "0"}
                            min={-360}
                            max={360}
                            step={1}
                            defaultValue="0"
                            onChange={(v) => update("rotateZ", v)}
                        />
                    </div>

                </div>

            </S1Field>
            </S1FieldGroup>

 
    );
}