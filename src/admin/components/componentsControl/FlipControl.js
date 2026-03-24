import { __ } from "@wordpress/i18n";
import { ToggleControl, Button, ButtonGroup } from "@wordpress/components";
import { S1Field } from "@th-storeone-global/S1Field";

export default function FlipControl({
    value = {},
    label = __("Flip / Mirror Text", "th-store-one"),
    description = __("Enable a mirror effect on the text. You can flip it both horizontally and vertically.", "th-store-one"),
    onChange
}) {

    const enabled = value.enabled ?? false;
    const orientation = value.orientation ?? "horizontal";

    const update = (key, val) => {
        onChange({
            ...value,
            [key]: val
        });
    };

    return (
        <div className="s1-control s1-flip-control">

            <S1Field label={label} description={description}>

                <ToggleControl
                    checked={enabled}
                    onChange={(v) => update("enabled", v)}
                />

                {enabled && (
                    <div className="s1-flip-orientation">

                        <div className="s1-flip-orientation-label">
                            {__("Flip Orientation", "th-store-one")}
                        </div>

                      <ButtonGroup className="s1-flip-orientation-buttons">

    <Button
        className="s1-flip-btn"
        isPressed={orientation === "horizontal"}
        onClick={() => update("orientation", "horizontal")}
    >
        {__("Horizontal", "store-one")}
    </Button>

    <Button
        className="s1-flip-btn"
        isPressed={orientation === "vertical"}
        onClick={() => update("orientation", "vertical")}
    >
        {__("Vertical", "store-one")}
    </Button>

    <Button
        className="s1-flip-btn"
        isPressed={orientation === "both"}
        onClick={() => update("orientation", "both")}
    >
        {__("Both", "store-one")}
    </Button>

</ButtonGroup>

                    </div>
                )}

            </S1Field>

        </div>
    );
}