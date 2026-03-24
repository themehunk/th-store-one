import { useEffect } from "@wordpress/element";
import { SelectControl, TextControl } from "@wordpress/components";
import { S1Field } from "@th-storeone-global/S1Field";
import { ICONS } from "@th-storeone-global/icons";
import { usePlatformUrl } from "./usePlatformUrl";
import { PLATFORM_CONFIG } from "./platformConfig";

export default function BusinessItemEditor({
  item,
  ruleIndex,
  itemIndex,
  updateBuyItemField,
  openMediaLibrary,
  ICON_OPTIONS,
}) {
  const { generateUrl } = usePlatformUrl();

  /* ================= SAFE BUSINESS OBJECT ================= */
  const business = item.business || {
    selected_icon: "",
    icontype: "icon",
    custom_svg: "",
    image_url: "",
    url: "",
     custom_label: "",
  };

  /* ================= SAFE CONFIG ACCESS ================= */
  const currentPlatform =
    PLATFORM_CONFIG?.[business.selected_icon?.toLowerCase()] ||
    PLATFORM_CONFIG?.[business.selected_icon?.toUpperCase()];

    const displayLabel =
  business.custom_label ||
  currentPlatform?.label ||
  business.selected_icon;

  /* ================= AUTO FILL URL ON SELECT ================= */
  useEffect(() => {
    if (
      business.selected_icon &&
      currentPlatform &&
      !business.url
    ) {
      updateBuyItemField(
        ruleIndex,
        itemIndex,
        "business",
        "url",
        currentPlatform.profile || ""
      );
    }
  }, [business.selected_icon]);

  /* ================= PLATFORM SELECT ================= */
  const handlePlatformSelect = (platformId) => {
    const config =
      PLATFORM_CONFIG?.[platformId?.toLowerCase()] ||
      PLATFORM_CONFIG?.[platformId?.toUpperCase()];

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "business",
      "selected_icon",
      platformId
    );

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "business",
      "url",
      config?.profile || ""
    );
  };

  return (
    <>
      {/* ================= PLATFORM GRID ================= */}
      <S1Field label="Choose Business Platform">
        <div className="s1-platform-grid">
          {ICON_OPTIONS.map(({ id, icon }) => (
            <div
              key={id}
              className={`s1-icon-option ${
                business.selected_icon === id ? "active" : ""
              }`}
              onClick={() => handlePlatformSelect(id)}
             title={
            business.selected_icon === id
              ? displayLabel
              : PLATFORM_CONFIG?.[id?.toUpperCase()]?.label || id
          }
          data-label={
            business.selected_icon === id
              ? displayLabel
              : PLATFORM_CONFIG?.[id?.toUpperCase()]?.label || id
          }
              >
              {icon}
            </div>
          ))}
        </div>
      </S1Field>

      {/* ================= ICON TYPE ================= */}
      <S1Field label="Icon Type">
        <SelectControl
          value={business.icontype || "icon"}
          options={[
            { label: "Default Icon", value: "icon" },
            { label: "Upload Image", value: "image" },
            { label: "Custom SVG", value: "custom_svg" },
          ]}
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "business",
              "icontype",
              v
            )
          }
        />
      </S1Field>

     

      {/* ================= IMAGE UPLOAD ================= */}
      {business.icontype === "image" && (
        <S1Field label="Upload Image">
          <div className="s1-image-upload-wrapper">
            {business.image_url ? (
              <div className="s1-image-card">
                <div className="s1-image-preview">
                  <img src={business.image_url} alt="" />
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
                          "business",
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
                        "business",
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
                      "business",
                      "image_url",
                      media.url
                    )
                  )
                }
              >
                <div className="s1-upload-text">
                  <strong>Upload Image</strong>
                  <p>Select or upload an image file</p>
                  <small>PNG, JPG, SVG supported</small>
                </div>
              </button>
            )}
          </div>
        </S1Field>
      )}

      {/* ================= CUSTOM SVG ================= */}
      {business.icontype === "custom_svg" && (
        <S1Field label="SVG Code">
          <TextControl
            value={business.custom_svg || ""}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "business",
                "custom_svg",
                v
              )
            }
          />
        </S1Field>
      )}

      <S1Field label="Label (Optional)">
        <TextControl
          value={
            business.custom_label ||
            PLATFORM_CONFIG?.[business.selected_icon?.toUpperCase()]?.label ||
            business.selected_icon
          }
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "business",
              "custom_label",
              v
            )
          }
        />
      </S1Field>

      {/* ================= URL ================= */}
      {business.selected_icon && (
        <S1Field label="URL">
          <TextControl
            value={business.url || ""}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "business",
                "url",
                v
              )
            }
          />
        </S1Field>
      )}

      {/* ================= PREVIEW BOX ================= */}
{business.selected_icon && (
  <>
    <label className="s1-field-label">Live Preview</label>

    <div className="s1-social-preview">
      <div className="s1-social-preview__icon">
        {/* IMAGE */}
        {business.icontype === "image" &&
          business.image_url && (
            <img src={business.image_url} alt="" />
          )}

        {/* CUSTOM SVG */}
        {business.icontype === "custom_svg" &&
          business.custom_svg && (
            <span
              dangerouslySetInnerHTML={{
                __html: business.custom_svg,
              }}
            />
          )}

        {/* DEFAULT ICON */}
        {(business.icontype === "icon" ||
          !business.icontype) &&
          ICONS[
            business.selected_icon?.toUpperCase()
          ]}
      </div>

      {/* PLATFORM NAME */}
      <div className="s1-social-preview__name">
        {displayLabel}
      </div>

      {/* URL PREVIEW */}
      <div className="s1-social-preview__url">
        {business.url ||
          "URL preview will appear here"}
      </div>
        </div>
      </>
    )}

          
    </>
  );
}