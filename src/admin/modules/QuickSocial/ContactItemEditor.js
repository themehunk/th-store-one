import { useEffect } from "@wordpress/element";
import { SelectControl, TextControl } from "@wordpress/components";
import { S1Field } from "@th-storeone-global/S1Field";
import { ICONS } from "@th-storeone-global/icons";
import { usePlatformUrl } from "./usePlatformUrl";
import { PLATFORM_CONFIG } from "./platformConfig";

export default function ContactItemEditor({
  item,
  ruleIndex,
  itemIndex,
  updateBuyItemField,
  openMediaLibrary,
  ICON_OPTIONS,
}) {
  const { generateUrl } = usePlatformUrl();

  /* ================= SAFE CONTACT OBJECT ================= */
  const contact = item.contact || {
    selected_icon: "",
    icontype: "icon",
    custom_svg: "",
    image_url: "",
    url: "",
    social_choose: "profile",
     custom_label: "",
  };

  const currentPlatform =
    PLATFORM_CONFIG?.[contact.selected_icon?.toLowerCase()];
    const displayLabel =
  contact.custom_label ||
  currentPlatform?.label ||
  contact.selected_icon;

  /* ================= AUTO SET DEFAULT URL ================= */
  useEffect(() => {
    if (currentPlatform && !contact.url) {
      updateBuyItemField(
        ruleIndex,
        itemIndex,
        "contact",
        "url",
        currentPlatform.profile || ""
      );
    }
  }, [contact.selected_icon]);

  /* ================= PLATFORM SELECT ================= */
  const handlePlatformSelect = (platformId) => {
    const config =
      PLATFORM_CONFIG?.[platformId?.toLowerCase()];

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "contact",
      "selected_icon",
      platformId
    );

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "contact",
      "url",
      config?.profile || ""
    );
  };

  return (
    <>
      {/* PLATFORM GRID */}
      <S1Field label="Choose Contact Platform">
        <div className="s1-platform-grid">
          {ICON_OPTIONS.map(({ id, icon }) => (
            <div
              key={id}
              className={`s1-icon-option ${
                contact.selected_icon === id ? "active" : ""
              }`}
              onClick={() => handlePlatformSelect(id)}
              title={
            contact.selected_icon === id
              ? displayLabel
              : PLATFORM_CONFIG?.[id?.toUpperCase()]?.label || id
          }
          data-label={
            contact.selected_icon === id
              ? displayLabel
              : PLATFORM_CONFIG?.[id?.toUpperCase()]?.label || id
          }
            >
              {icon}
            </div>
          ))}
        </div>
      </S1Field>

      {/* ICON TYPE */}
      <S1Field label="Icon Type">
        <SelectControl
          value={contact.icontype || "icon"}
          options={[
            { label: "Default Icon", value: "icon" },
            { label: "Upload Image", value: "image" },
            { label: "Custom SVG", value: "custom_svg" },
          ]}
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "contact",
              "icontype",
              v
            )
          }
        />
      </S1Field>

     

      {/* IMAGE UPLOAD */}
      {contact.icontype === "image" && (
        <S1Field label="Upload Image">
          <div className="s1-image-upload-wrapper">
            {contact.image_url ? (
              <div className="s1-image-card">
                <div className="s1-image-preview">
                  <img src={contact.image_url} alt="" />
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
                          "contact",
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
                        "contact",
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
                      "contact",
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

      {/* CUSTOM SVG */}
      {contact.icontype === "custom_svg" && (
        <S1Field label="SVG Code">
          <TextControl
            value={contact.custom_svg || ""}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "contact",
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
            contact.custom_label ||
            PLATFORM_CONFIG?.[contact.selected_icon?.toUpperCase()]?.label ||
            contact.selected_icon
          }
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "contact",
              "custom_label",
              v
            )
          }
        />
      </S1Field>

      {/* URL */}
      {currentPlatform && (
        <S1Field label="URL">
          <TextControl
            value={contact.url || ""}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "contact",
                "url",
                v
              )
            }
          />
        </S1Field>
      )}

      {/* ================= PREVIEW BOX ================= */}
{contact.selected_icon && (
  <>
    <label className="s1-field-label">Live Preview</label>

    <div className="s1-social-preview">
      <div className="s1-social-preview__icon">
        {/* IMAGE */}
        {contact.icontype === "image" &&
          contact.image_url && (
            <img src={contact.image_url} alt="" />
          )}

        {/* CUSTOM SVG */}
        {contact.icontype === "custom_svg" &&
          contact.custom_svg && (
            <span
              dangerouslySetInnerHTML={{
                __html: contact.custom_svg,
              }}
            />
          )}

        {/* DEFAULT ICON */}
        {(contact.icontype === "icon" ||
          !contact.icontype) &&
          ICONS[
            contact.selected_icon?.toUpperCase()
          ]}
      </div>

      {/* PLATFORM NAME */}
      <div className="s1-social-preview__name">
         {displayLabel}
      </div>

      {/* URL PREVIEW */}
      <div className="s1-social-preview__url">
        {contact.url ||
          "URL preview will appear here"}
      </div>
    </div>
    </>
    )}
    </>
  );
}