import { ToggleControl, TextControl } from "@wordpress/components";
import { S1Field } from "./S1Field";

export default function SliderControl({
    value = {},
    onChange,

    //Control visibility from parent
    fields = {
        enable: true,
        slides: true,
        autoplay: false,
        navigation: false,
    },

    //Labels (fully dynamic)
    labels = {
        enable: "Enable Slider",
        slides: "Slides to Show",
        autoplay: "Autoplay",
        navigation: "Show Navigation",
    },

    defaults = {
        slides: 4,
        autoplay: false,
        navigation: true,
    },

    wrapperClass = "s1-toggle-wrpapper col-2"
}) {

    const update = (key, val) => {
        onChange({
            ...value,
            [key]: val,
        });
    };

    return (
        <>
            {/* ENABLE */}
            {fields.enable && (
                <S1Field label={labels.enable} classN={wrapperClass}>
                    <ToggleControl
                        checked={!!value.enabled}
                        onChange={(v) => update("enabled", v)}
                    />
                </S1Field>
            )}

            {/* CHILD SETTINGS */}
            {value.enabled && (
                <>
                    {/* SLIDES */}
                    {fields.slides && (
                        <div className="s1-field-col">
                            <S1Field label={labels.slides} classN={wrapperClass}>
                                <TextControl
                                    type="number"
                                    value={value.slides || defaults.slides}
                                    onChange={(v) => update("slides", Number(v))}
                                />
                            </S1Field>
                        </div>
                    )}

                    {/* AUTOPLAY */}
                    {fields.autoplay && (
                        <S1Field label={labels.autoplay} classN={wrapperClass}>
                            <ToggleControl
                                checked={value.autoplay ?? defaults.autoplay}
                                onChange={(v) => update("autoplay", v)}
                            />
                        </S1Field>
                    )}

                    {/* NAVIGATION */}
                    {fields.navigation && (
                        <S1Field label={labels.navigation} classN={wrapperClass}>
                            <ToggleControl
                                checked={value.navigation ?? defaults.navigation}
                                onChange={(v) => update("navigation", v)}
                            />
                        </S1Field>
                    )}
                </>
            )}
        </>
    );
}