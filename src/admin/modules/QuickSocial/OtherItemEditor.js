import { useEffect } from "@wordpress/element";
import { SelectControl, TextControl } from "@wordpress/components";
import { S1Field } from "@storeone-global/S1Field";
import { ICONS } from "@storeone-global/icons";
import { PLATFORM_CONFIG } from "./platformConfig";

export default function OtherItemEditor({
  item,
  ruleIndex,
  itemIndex,
  updateBuyItemField,
  ICON_OPTIONS,
  openMediaLibrary,
}) {

  /* ================= SAFE OBJECT ================= */
  const other = {
    selected_icon: "website",
    icontype: "icon",
    custom_svg: "",
    image_url: "",
    url: "",
    ...(item.other || {}),
  };

  const currentPlatform =
    PLATFORM_CONFIG?.[other.selected_icon?.toLowerCase()];

  /* ================= AUTO URL SET ================= */
  useEffect(() => {
    if (!currentPlatform) return;

    if (currentPlatform.profile === "{CUSTOM_URL}") {
      updateBuyItemField(
        ruleIndex,
        itemIndex,
        "other",
        "url",
        other.url || ""
      );
    }
  }, [other.selected_icon]);

  /* ================= PLATFORM SELECT ================= */
  const handlePlatformSelect = (platformId) => {
    updateBuyItemField(ruleIndex, itemIndex, "other", "selected_icon", platformId);
    updateBuyItemField(ruleIndex, itemIndex, "other", "url", "");
  };

  return (
    <>
      {/* ================= PLATFORM GRID ================= */}
      <S1Field label="Choose Platform">
        <div className="s1-platform-grid">
          {ICON_OPTIONS.map(({ id, icon }) => (
            <div
              key={id}
              className={`s1-icon-option ${
                other.selected_icon === id ? "active" : ""
              }`}
              onClick={() => handlePlatformSelect(id)}
            >
              {icon}
            </div>
          ))}
        </div>
      </S1Field>

      {/* ================= ICON TYPE ================= */}
      <S1Field label="Icon Type">
        <SelectControl
          value={other.icontype}
          options={[
            { label: "Default Icon", value: "icon" },
            { label: "Upload Image", value: "image" },
            { label: "Custom SVG", value: "custom_svg" },
          ]}
          onChange={(v) =>
            updateBuyItemField(ruleIndex, itemIndex, "other", "icontype", v)
          }
        />
      </S1Field>

      {/* ================= DEFAULT ICON ================= */}
      {other.icontype === "icon" && other.selected_icon && (
        <S1Field>
          {ICONS[other.selected_icon?.toUpperCase()]}
        </S1Field>
      )}

      {/* ================= IMAGE UPLOAD ================= */}
      {other.icontype === "image" && (
        <S1Field label="Upload Image">
          <div className="s1-image-upload-wrapper">
            {other.image_url ? (
              <div className="s1-image-card">
                <div className="s1-image-preview">
                  <img src={other.image_url} alt="icon" />
                </div>
                <div className="s1-image-actions">
                  <button
                    type="button"
                    className="s1-btn s1-btn-edit"
                    onClick={() =>
                      openMediaLibrary((media) =>
                        updateBuyItemField(
                          ruleIndex,
                          itemIndex,
                          "other",
                          "image_url",
                          media.url
                        )
                      )
                    }
                  >
                    Change
                  </button>

                  <button
                    type="button"
                    className="s1-btn s1-btn-remove"
                    onClick={() =>
                      updateBuyItemField(
                        ruleIndex,
                        itemIndex,
                        "other",
                        "image_url",
                        ""
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="s1-upload-card"
                onClick={() =>
                  openMediaLibrary((media) =>
                    updateBuyItemField(
                      ruleIndex,
                      itemIndex,
                      "other",
                      "image_url",
                      media.url
                    )
                  )
                }
              >
                Upload Image
              </button>
            )}
          </div>
        </S1Field>
      )}

      {/* ================= CUSTOM SVG ================= */}
      {other.icontype === "custom_svg" && (
        <S1Field label="SVG Code">
          <TextControl
            value={other.custom_svg}
            onChange={(v) =>
              updateBuyItemField(ruleIndex, itemIndex, "other", "custom_svg", v)
            }
          />
        </S1Field>
      )}

      {/* ================= URL FIELD ================= */}
      <S1Field label="URL">
  <TextControl
    value={other.url || "{CUSTOM_URL}"}
    placeholder="{CUSTOM_URL}"
    onChange={(v) =>
      updateBuyItemField(
        ruleIndex,
        itemIndex,
        "other",
        "url",
        v || "{CUSTOM_URL}"
      )
    }
  />
</S1Field>
    </>
  );
}