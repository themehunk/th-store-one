import { useEffect } from "@wordpress/element";
import { SelectControl, TextControl } from "@wordpress/components";
import { S1Field } from "@storeone-global/S1Field";
import { ICONS } from "@storeone-global/icons";
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
  };

  const currentPlatform =
    PLATFORM_CONFIG?.[contact.selected_icon?.toLowerCase()];

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

      {/* DEFAULT ICON */}
      {(contact.icontype || "icon") === "icon" &&
        contact.selected_icon && (
          <S1Field>
            {ICONS[contact.selected_icon]}
          </S1Field>
        )}

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
    </>
  );
}