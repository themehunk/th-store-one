// src/store-one/utils/parseRawValue.js
export function parseRawValue(raw = "0") {
    // Saved settings can be numbers (e.g. 36) or null, not only "36px".
    if (typeof raw === "number") raw = String(raw);
    if (typeof raw !== "string") return [0, ""];

    const match = raw.trim().match(/^(-?\d+(\.\d+)?)([a-zA-Z%]*)$/);
    if (!match) return [0, ""];
    return [parseFloat(match[1]), match[3] || ""];
}
