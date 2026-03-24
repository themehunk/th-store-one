import { useEffect } from "@wordpress/element";
import { SelectControl, TextControl } from "@wordpress/components";
import { S1Field } from "@th-storeone-global/S1Field";
import { ICONS } from "@th-storeone-global/icons";
import { usePlatformUrl } from "./usePlatformUrl";
import { PLATFORM_CONFIG } from "./platformConfig";

export default function SocialItemEditor({
  item,
  ruleIndex,
  itemIndex,
  updateBuyItemField,
  ICON_OPTIONS,
  openMediaLibrary,
}) {
  const { generateUrl } = usePlatformUrl();

  /* ================= SAFE SOCIAL OBJECT ================= */
  const social = {
    selected_icon: "FACEBOOK",
    icontype: "icon",
    custom_svg: "",
    image_url: "",
    url: "",
    social_choose: "share",
    share_text: "{TITLE}",
    custom_label: "",
    ...(item.social || {}),
  };

  const currentPlatform =
    PLATFORM_CONFIG?.[social.selected_icon?.toUpperCase()];
  const displayLabel =
  social.custom_label ||
  currentPlatform?.label ||
  social.selected_icon;
  /* ================= AUTO FIX PROFILE MODE ================= */
  useEffect(() => {
    if (
      currentPlatform &&
      !currentPlatform.share &&
      social.social_choose !== "profile"
    ) {
      updateBuyItemField(ruleIndex, itemIndex, "social", "social_choose", "profile");
      updateBuyItemField(
        ruleIndex,
        itemIndex,
        "social",
        "url",
        currentPlatform.profile || ""
      );
    }
  }, [social.selected_icon]);

  /* ================= PLATFORM SELECT ================= */
  const handlePlatformSelect = (platformId) => {
    const config = PLATFORM_CONFIG?.[platformId?.toUpperCase()];
    const mode = config && !config?.share ? "profile" : "share";

    const baseUrl = generateUrl(platformId, mode);

    updateBuyItemField(ruleIndex, itemIndex, "social", "selected_icon", platformId);
    updateBuyItemField(ruleIndex, itemIndex, "social", "social_choose", mode);
    updateBuyItemField(ruleIndex, itemIndex, "social", "url", baseUrl);

    // Reset share text ONLY if platform actually uses it
    if (config?.share?.includes("{TITLE}") || config?.share?.includes("{DESCRIPTION}")) {
      updateBuyItemField(ruleIndex, itemIndex, "social", "share_text", "{TITLE}");
    }
  };

  /* ================= SHARE TEXT HANDLER ================= */
  const handleShareTextChange = (value) => {
    updateBuyItemField(ruleIndex, itemIndex, "social", "share_text", value);

    let baseUrl = generateUrl(social.selected_icon, "share");
    if (!baseUrl) return;

    const finalUrl = baseUrl
      .replace("{TITLE}", encodeURIComponent(value))
      .replace("{DESCRIPTION}", encodeURIComponent(value));

    updateBuyItemField(ruleIndex, itemIndex, "social", "url", finalUrl);
  };

  /* ================= CHECK IF TEXT FIELD NEEDED ================= */
  const shouldShowShareField =
  currentPlatform &&
  social.social_choose === "share" &&
  currentPlatform.share &&
  (/\{TITLE\}|\{TEXT\}|\{DESCRIPTION\}/.test(currentPlatform.share));

  return (
    <>
      {/* ================= PLATFORM GRID ================= */}
      <S1Field label="Choose Platform">
        <div className="s1-platform-grid">
          {ICON_OPTIONS.map(({ id, icon }) => (
        <div
          key={id}
          className={`s1-icon-option ${
            social.selected_icon === id ? "active" : ""
          }`}
          onClick={() => handlePlatformSelect(id)}
          title={
            social.selected_icon === id
              ? displayLabel
              : PLATFORM_CONFIG?.[id?.toUpperCase()]?.label || id
          }
          data-label={
            social.selected_icon === id
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
          value={social.icontype}
          options={[
            { label: "Default Icon", value: "icon" },
            { label: "Upload Image", value: "image" },
            { label: "Custom SVG", value: "custom_svg" },
          ]}
          onChange={(v) =>
            updateBuyItemField(ruleIndex, itemIndex, "social", "icontype", v)
          }
        />
      </S1Field>

      

      {/* ================= IMAGE UPLOAD ================= */}
      {social.icontype === "image" && (
        <S1Field label="Upload Image">
          <div className="s1-image-upload-wrapper">
            {social.image_url ? (
              <div className="s1-image-card">
                <div className="s1-image-preview">
                  <img src={social.image_url} alt="social icon" />
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
                          "social",
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
                        "social",
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
                      "social",
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
      {social.icontype === "custom_svg" && (
        <S1Field label="SVG Code">
          <TextControl
            value={social.custom_svg}
            onChange={(v) =>
              updateBuyItemField(ruleIndex, itemIndex, "social", "custom_svg", v)
            }
          />
        </S1Field>
      )}

      <S1Field label="Label (Optional)">
        <TextControl
          value={
            social.custom_label ||
            PLATFORM_CONFIG?.[social.selected_icon?.toUpperCase()]?.label ||
            social.selected_icon
          }
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "social",
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
              value={social.social_choose}
              options={[
                { label: "Share", value: "share" },
                { label: "Profile", value: "profile" },
              ]}
              onChange={(v) => {
                const url = generateUrl(social.selected_icon, v);
                updateBuyItemField(ruleIndex, itemIndex, "social", "social_choose", v);
                updateBuyItemField(ruleIndex, itemIndex, "social", "url", url);
              }}
            />
          </S1Field>
        )}

      {/* ================= SHARE TEXT FIELD ================= */}
      {shouldShowShareField && (
        <S1Field
          label={
            currentPlatform.share.includes("{DESCRIPTION}")
              ? "Description"
              : "Share Text"
          }
        >
          <TextControl
            value={social.share_text}
            onChange={handleShareTextChange}
            placeholder={
              currentPlatform.share.includes("{DESCRIPTION}")
                ? "{DESCRIPTION}"
                : "{TITLE}"
            }
          />
        </S1Field>
      )}

      {/* ================= URL ================= */}
      {currentPlatform && (
        <S1Field label="URL">
          <TextControl
            value={social.url}
            onChange={(v) =>
              updateBuyItemField(ruleIndex, itemIndex, "social", "url", v)
            }
          />
        </S1Field>
        
      )}
     {/* ================= PREVIEW BOX ================= */}
    {social.selected_icon && (
      <>
        <label className="s1-field-label">Live Preview</label>

        <div className="s1-social-preview">
          <div className="s1-social-preview__icon">
            {social.icontype === "image" && social.image_url && (
              <img src={social.image_url} alt="" />
            )}

            {social.icontype === "custom_svg" && social.custom_svg && (
              <span
                dangerouslySetInnerHTML={{ __html: social.custom_svg }}
              />
            )}

            {social.icontype === "icon" &&
              ICONS[social.selected_icon?.toUpperCase()]}
          </div>

          <div className="s1-social-preview__name">
           {displayLabel}
          </div>

          <div className="s1-social-preview__url">
            {social.url || "URL preview will appear here"}
          </div>
        </div>
      </>
    )}
    </>
  );
}