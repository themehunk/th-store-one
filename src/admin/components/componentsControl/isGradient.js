export const isGradient = (value) =>
  typeof value === "string" &&
  (value.includes("gradient") || value.includes("linear") || value.includes("radial"));

export const getTextColor = (value) => {
  if (!value) return {};

  return isGradient(value)
    ? {
        background: value,
        WebkitBackgroundClip: "text",
        color: "transparent",
      }
    : { color: value };
};

export default getTextColor;
