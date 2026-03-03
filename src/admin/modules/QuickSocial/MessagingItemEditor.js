
import { useEffect } from "@wordpress/element";
import { SelectControl, TextControl } from "@wordpress/components";
import { S1Field } from "@storeone-global/S1Field";
import { ICONS } from "@storeone-global/icons";
import { usePlatformUrl } from "./usePlatformUrl";
import { PLATFORM_CONFIG } from "./platformConfig";

export default function MessagingItemEditor({
  item,
  ruleIndex,
  itemIndex,
  updateBuyItemField,
  openMediaLibrary,
  ICON_OPTIONS,
}) {
  const { generateUrl } = usePlatformUrl();

  /* ================= SAFE OBJECT ================= */
  const messaging = item.messaging || {
  selected_icon: "",
  icontype: "icon",
  custom_svg: "",
  image_url: "",
  url: "",
  social_choose: "profile",
    phone: "{phone}",
  message: "{message}",
  custom_label: "",
  };

  /* ================= NORMALIZED KEY ================= */
  const platformKey = messaging.selected_icon
    ? messaging.selected_icon.toLowerCase()
    : "";
    const currentPlatform = PLATFORM_CONFIG?.[platformKey];
const displayLabel =
  messaging.custom_label ||
  currentPlatform?.label ||
  messaging.selected_icon;
  

  /* ================= AUTO URL FILL ================= */
  useEffect(() => {
  if (!currentPlatform) return;

  const mode = messaging.social_choose || "profile";

  let template =
    mode === "share"
      ? currentPlatform.share
      : currentPlatform.profile;

  if (!template) return;

  let finalUrl = template;

  // PHONE
  if (template.includes("{MOBILE_NUMBER}")) {
    const phoneValue =
      messaging.phone && messaging.phone !== "{phone}"
        ? messaging.phone
        : "{MOBILE_NUMBER}";

    finalUrl = finalUrl.replace("{MOBILE_NUMBER}", phoneValue);
  }

  // MESSAGE
  if (template.includes("{YOUR_MESSAGE}")) {
    const messageValue =
      messaging.message && messaging.message !== "{message}"
        ? encodeURIComponent(messaging.message)
        : "{YOUR_MESSAGE}";

    finalUrl = finalUrl.replace("{YOUR_MESSAGE}", messageValue);
  }

  if (messaging.url !== finalUrl) {
    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "messaging",
      "url",
      finalUrl
    );
  }
}, [
  messaging.selected_icon,
  messaging.social_choose,
  messaging.phone,
  messaging.message
]);
  /* ================= PLATFORM SELECT ================= */
  const handlePlatformSelect = (platformId) => {
    const key = platformId.toLowerCase();
    const config = PLATFORM_CONFIG?.[key];

    if (!config) return;

    const mode =
      config.share ? messaging.social_choose || "profile" : "profile";

    let url =
      mode === "share" ? config.share : config.profile;

    if (url?.includes("{MOBILE_NUMBER}")) {
      url = url.replace("{MOBILE_NUMBER}", "{MOBILE_NUMBER}");
    }

    if (url?.includes("{YOUR_MESSAGE}")) {
      url = url.replace("{YOUR_MESSAGE}", "{YOUR_MESSAGE}");
    }

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "messaging",
      "selected_icon",
      platformId
    );

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "messaging",
      "social_choose",
      mode
    );

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "messaging",
      "url",
      url
    );
  };

 

  return (
    <>
      {/* ================= PLATFORM GRID ================= */}
      <S1Field label="Choose Messaging Platform">
        <div className="s1-platform-grid">
          {ICON_OPTIONS.map(({ id, icon }) => (
            <div
              key={id}
              className={`s1-icon-option ${
                messaging.selected_icon === id ? "active" : ""
              }`}
              onClick={() => handlePlatformSelect(id)}
              title={
            messaging.selected_icon === id
              ? displayLabel
              : PLATFORM_CONFIG?.[id?.toUpperCase()]?.label || id
          }
          data-label={
            messaging.selected_icon === id
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
          value={messaging.icontype || "icon"}
          options={[
            { label: "Default Icon", value: "icon" },
            { label: "Upload Image", value: "image" },
            { label: "Custom SVG", value: "custom_svg" },
          ]}
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "messaging",
              "icontype",
              v
            )
          }
        />
      </S1Field>

      {/* ================= DEFAULT ICON ================= */}
      {/* {(messaging.icontype || "icon") === "icon" &&
        messaging.selected_icon && (
          <S1Field>
            {ICONS[messaging.selected_icon?.toUpperCase()]}
          </S1Field>
        )} */} 

      {/* ================= IMAGE UPLOAD (SOCIAL STYLE) ================= */}
      {messaging.icontype === "image" && (
        <S1Field label="Upload Image">
          <div className="s1-image-upload-wrapper">
            {messaging.image_url ? (
              <div className="s1-image-card">
                <div className="s1-image-preview">
                  <img src={messaging.image_url} alt="" />
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
                          "messaging",
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
                        "messaging",
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
                      "messaging",
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
      {messaging.icontype === "custom_svg" && (
        <S1Field label="SVG Code">
          <TextControl
            value={messaging.custom_svg || ""}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "messaging",
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
            messaging.custom_label ||
            PLATFORM_CONFIG?.[messaging.selected_icon?.toUpperCase()]?.label ||
            messaging.selected_icon
          }
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "messaging",
              "custom_label",
              v
            )
          }
        />
      </S1Field>
      {/* ================= MODE ================= */}
      {currentPlatform &&
        currentPlatform.share &&
        currentPlatform.profile && (
          <S1Field label="Mode">
            <SelectControl
              value={messaging.social_choose || "profile"}
              options={[
                { label: "Share", value: "share" },
                { label: "Profile", value: "profile" },
              ]}
              onChange={(v) =>
                updateBuyItemField(
                  ruleIndex,
                  itemIndex,
                  "messaging",
                  "social_choose",
                  v
                )
              }
            />
          </S1Field>
        )}

        {/* ================= PHONE + MESSAGE ================= */}
{currentPlatform &&
  messaging.social_choose === "profile" &&
  currentPlatform.profile && (
    <>
      {currentPlatform.profile.includes("{MOBILE_NUMBER}") && (
         <S1Field label="Message">
          <TextControl
            value={messaging.message || "{message}"}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "messaging",
                "message",
                v || "{message}"
              )
            }
          />
        </S1Field>
      )}

      {currentPlatform.profile.includes("{YOUR_MESSAGE}") && (
        <S1Field label="Phone Number">
          <TextControl
            value={messaging.phone || "{phone}"}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "messaging",
                "phone",
                v || "{phone}"
              )
            }
          />
        </S1Field>
      )}
    </>
)}
      {/* ================= URL ================= */}
      {currentPlatform && (
        <S1Field label="URL">
          <TextControl
            value={messaging.url || ""}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "messaging",
                "url",
                v
              )
            }
          />
        </S1Field>
      )}

      {/* ================= PREVIEW BOX ================= */}
    {messaging.selected_icon && (
      <>
        <label className="s1-field-label">Live Preview</label>

        <div className="s1-social-preview">
          <div className="s1-social-preview__icon">
            {/* IMAGE */}
            {messaging.icontype === "image" && messaging.image_url && (
              <img src={messaging.image_url} alt="" />
            )}

            {/* CUSTOM SVG */}
            {messaging.icontype === "custom_svg" &&
              messaging.custom_svg && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: messaging.custom_svg,
                  }}
                />
              )}

            {/* DEFAULT ICON */}
            {(messaging.icontype === "icon" ||
              !messaging.icontype) &&
              ICONS[messaging.selected_icon?.toUpperCase()]}
          </div>

          {/* PLATFORM NAME */}
          <div className="s1-social-preview__name">
            {displayLabel}
          </div>

          {/* URL PREVIEW */}
          <div className="s1-social-preview__url">
            {messaging.url ||
              "URL preview will appear here"}
          </div>
        </div>
      </>
    )}   
    </>
  );
}