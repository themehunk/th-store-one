import { useEffect } from "@wordpress/element";
import { SelectControl, TextControl } from "@wordpress/components";
import { S1Field } from "@storeone-global/S1Field";
import { ICONS } from "@storeone-global/icons";
import { usePlatformUrl } from "./usePlatformUrl";
import { PLATFORM_CONFIG } from "./platformConfig";

export default function ProfessionalItemEditor({
  item,
  ruleIndex,
  itemIndex,
  updateBuyItemField,
  openMediaLibrary,
  ICON_OPTIONS,
}) {
  const { generateUrl } = usePlatformUrl();

  /* ================= SAFE OBJECT ================= */
  const professional = item.professional || {
    selected_icon: "GITHUB",
    icontype: "icon",
    custom_svg: "",
    image_url: "",
    url: "",
    social_choose: "profile",
     custom_label: "",
  };

  /* ================= SAFE CONFIG ================= */
  const currentPlatform =
    PLATFORM_CONFIG?.[professional.selected_icon?.toLowerCase()] ||
    PLATFORM_CONFIG?.[professional.selected_icon?.toUpperCase()];
    const displayLabel =
  professional.custom_label ||
  currentPlatform?.label ||
  professional.selected_icon;

  /* ================= AUTO PROFILE DEFAULT ================= */
  useEffect(() => {
    if (currentPlatform && professional.url === "") {
      updateBuyItemField(
        ruleIndex,
        itemIndex,
        "professional",
        "url",
        currentPlatform.profile || ""
      );
    }
  }, [professional.selected_icon]);

  /* ================= PLATFORM SELECT ================= */
  const handlePlatformSelect = (platformId) => {
    const config =
      PLATFORM_CONFIG?.[platformId?.toLowerCase()] ||
      PLATFORM_CONFIG?.[platformId?.toUpperCase()];

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "professional",
      "selected_icon",
      platformId
    );

    updateBuyItemField(
      ruleIndex,
      itemIndex,
      "professional",
      "url",
      config?.profile || ""
    );
  };

  return (
    <>
      {/* ================= PLATFORM GRID ================= */}
      <S1Field label="Choose Professional Platform">
        <div className="s1-platform-grid">
          {ICON_OPTIONS.map(({ id, icon }) => (
            <div
              key={id}
              className={`s1-icon-option ${
                professional.selected_icon === id ? "active" : ""
              }`}
              onClick={() => handlePlatformSelect(id)}
              title={
            professional.selected_icon === id
              ? displayLabel
              : PLATFORM_CONFIG?.[id?.toUpperCase()]?.label || id
          }
          data-label={
            professional.selected_icon === id
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
          value={professional.icontype || "icon"}
          options={[
            { label: "Default Icon", value: "icon" },
            { label: "Upload Image", value: "image" },
            { label: "Custom SVG", value: "custom_svg" },
          ]}
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "professional",
              "icontype",
              v
            )
          }
        />
      </S1Field>

      {/* ================= DEFAULT ICON ================= */}
      {/* {(professional.icontype || "icon") === "icon" &&
        professional.selected_icon && (
          <S1Field>
            {ICONS[professional.selected_icon]}
          </S1Field>
        )} */}

      {/* ================= IMAGE UPLOAD ================= */}
      {professional.icontype === "image" && (
        <S1Field label="Upload Image">
          <div className="s1-image-upload-wrapper">
            {professional.image_url ? (
              <>
                <img src={professional.image_url} alt="" />

                <button
                  type="button"
                  onClick={() =>
                    openMediaLibrary((media) =>
                      updateBuyItemField(
                        ruleIndex,
                        itemIndex,
                        "professional",
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
                  onClick={() =>
                    updateBuyItemField(
                      ruleIndex,
                      itemIndex,
                      "professional",
                      "image_url",
                      ""
                    )
                  }
                >
                  Remove
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openMediaLibrary((media) =>
                    updateBuyItemField(
                      ruleIndex,
                      itemIndex,
                      "professional",
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
      {professional.icontype === "custom_svg" && (
        <S1Field label="SVG Code">
          <TextControl
            value={professional.custom_svg || ""}
            onChange={(v) =>
              updateBuyItemField(
                ruleIndex,
                itemIndex,
                "professional",
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
            professional.custom_label ||
            PLATFORM_CONFIG?.[professional.selected_icon?.toUpperCase()]?.label ||
            professional.selected_icon
          }
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "professional",
              "custom_label",
              v
            )
          }
        />
      </S1Field>

      {/* ================= URL ================= */}
      <S1Field label="URL">
        <TextControl
          value={professional.url || ""}
          onChange={(v) =>
            updateBuyItemField(
              ruleIndex,
              itemIndex,
              "professional",
              "url",
              v
            )
          }
        />
      </S1Field>

      {/* ================= PREVIEW BOX ================= */}
{professional.selected_icon && (
  <>
    <label className="s1-field-label">Live Preview</label>

    <div className="s1-social-preview">
      <div className="s1-social-preview__icon">
        {/* IMAGE */}
        {professional.icontype === "image" &&
          professional.image_url && (
            <img src={professional.image_url} alt="" />
          )}

        {/* CUSTOM SVG */}
        {professional.icontype === "custom_svg" &&
          professional.custom_svg && (
            <span
              dangerouslySetInnerHTML={{
                __html: professional.custom_svg,
              }}
            />
          )}

        {/* DEFAULT ICON */}
        {(professional.icontype === "icon" ||
          !professional.icontype) &&
          ICONS[
            professional.selected_icon?.toUpperCase()
          ]}
      </div>

      {/* PLATFORM NAME */}
      <div className="s1-social-preview__name">
        {displayLabel}
      </div>

      {/* URL PREVIEW */}
      <div className="s1-social-preview__url">
        {professional.url ||
          "URL preview will appear here"}
      </div>
    </div>
  </>
)}
    </>
  );
}