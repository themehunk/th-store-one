import { __ } from "@wordpress/i18n";

const VariationSwatches = ({ settings = {}, catalog = false }) => {
  const width = Math.max(
    Number(catalog ? settings.swatches_shop_width : settings.width) || 36,
    20,
  );

  const fontSize = Math.max(
    Number(
      catalog ? settings.swatches_shop_font_size : settings.single_font_size,
    ) || 14,
    10,
  );

  const borderColor = settings.attr_brdr_color || "#EBEBEB";

  const selectedBorder = settings.attr_brdr_hvr_color || "#111";

  const selectedBackground = settings.attr_bg_btn_hvr_color || "#111";

  const selectedTextColor = settings.attr_text_hvr_color || "#fff";

  const textColor = settings.attr_text_color || "#222";

  const backgroundColor = settings.attr_bg_btn_color || "#fff";

  const shape = settings.style || "rounded";

  const isRounded = shape === "rounded";

  const showSwatches =
    settings.show_swatches_shop !== false &&
    settings.show_swatches_shop !== "false";

  if (catalog && !showSwatches) {
    return null;
  }

  const colors = ["blue", "green", "orange", "yellow"];

  const sizes = ["S", "M", "L", "XL"];

  return (
    <div
      className={
        catalog ? "s1-catalog-variation" : "s1-single-variation-preview"
      }
    >
      {/* Color */}
      <div className="s1-preview-attribute">
        <div className="s1-preview-attribute-title">
          <span>{__("Color", "th-store-one")}</span>

          {!catalog && <strong>{__(": Yellow", "th-store-one")}</strong>}
        </div>

        <div
          className={
            catalog
              ? "s1-catalog-swatches"
              : "s1-preview-swatches s1-color-swatches"
          }
        >
          {colors.map((color) => {
            const selected = color === "yellow";

            return (
              <button
                key={color}
                type="button"
                className={
                  catalog
                    ? `s1-catalog-color ${selected ? "selected" : ""}`
                    : `s1-color-swatch ${selected ? "selected" : ""}`
                }
                style={{
                  width,
                  height: width,
                  borderRadius: isRounded ? "50%" : 4,
                  borderColor: selected ? selectedBorder : borderColor,
                }}
              >
                <span className={`s1-color ${color}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div className="s1-preview-attribute">
        <div className="s1-preview-attribute-title">
          <span>{__("Size", "th-store-one")}</span>

          {!catalog && <strong>{__(": XL", "th-store-one")}</strong>}
        </div>

        <div
          className={catalog ? "s1-catalog-size" : "s1-preview-buttons"}
          style={{
            fontSize,
          }}
        >
          {sizes.map((size) => {
            const selected = size === "XL";

            return (
              <button
                key={size}
                type="button"
                className={selected ? "selected" : ""}
                style={{
                  color: selected ? selectedTextColor : textColor,

                  backgroundColor: selected
                    ? selectedBackground
                    : backgroundColor,

                  borderColor: selected ? selectedBackground : borderColor,

                  fontSize,

                  width: catalog ? undefined : Math.max(width + 30),

                  height: catalog ? undefined : Math.max(width + 15),

                  borderRadius: isRounded ? 8 : 2,
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VariationSwatches;
