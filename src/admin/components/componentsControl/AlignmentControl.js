import { __ } from "@wordpress/i18n";
import { Button, ButtonGroup } from "@wordpress/components";
import { S1Field } from "@th-storeone-global/S1Field";

export default function AlignmentControl({
    value = "left",
    label = __("Text Alignment", "th-store-one"),
    description = __("Align your content left, center, or right.", "th-store-one"),
    onChange
}) {

    const icons = {
        left: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M3 5h14v2H3zm0 6h10v2H3zm0 6h14v2H3z" />
            </svg>
        ),
        center: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M5 5h14v2H5zm3 6h8v2H8zm-3 6h14v2H5z" />
            </svg>
        ),
        right: (
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M7 5h14v2H7zm3 6h10v2H10zm-3 6h14v2H7z" />
            </svg>
        ),
    };

    return (
        <div className="s1-control s1-alignment-control">

            <S1Field label={label} description={description}>

                <ButtonGroup className="s1-alignment-buttons">

                    <Button
                        isPressed={value === "left"}
                        onClick={() => onChange("left")}
                        className="s1-align-btn"
                    >
                        {icons.left}
                    </Button>

                    <Button
                        isPressed={value === "center"}
                        onClick={() => onChange("center")}
                        className="s1-align-btn"
                    >
                        {icons.center}
                    </Button>

                    <Button
                        isPressed={value === "right"}
                        onClick={() => onChange("right")}
                        className="s1-align-btn"
                    >
                        {icons.right}
                    </Button>

                </ButtonGroup>

            </S1Field>

        </div>
    );
}