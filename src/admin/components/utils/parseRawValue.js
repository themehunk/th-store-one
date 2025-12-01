// src/store-one/utils/parseRawValue.js
export function parseRawValue(raw = "0") {
    const match = raw.match(/^(-?\d+(\.\d+)?)([a-zA-Z%]*)$/);
    if (!match) return [0, ""];
    return [parseFloat(match[1]), match[3] || ""];
}
