// Detect & apply gradient or solid text color
export const getTextStyle = (value) => {
    if (!value) return {};

    // THBackgroundControl returns object sometimes
    let colorValue = value;

    if (typeof value === "object" && value?.value) {
        colorValue = value.value;
    }

    if (typeof colorValue !== "string") return {};

    // If gradient
    if (colorValue.includes("gradient")) {
        return {
            background: colorValue,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
        };
    }

    // Normal color
    return {
        color: colorValue,
    };
};

// Border radius parser for live preview
export const getRadius = (radius) => {
    if (!radius) return "0px";

    // Responsive object case
    if (typeof radius === "object") {
        return (
            radius.Desktop ||
            radius.Tablet ||
            radius.Mobile ||
            "0px"
        );
    }

    return radius; // simple string (e.g. "10px")
};
