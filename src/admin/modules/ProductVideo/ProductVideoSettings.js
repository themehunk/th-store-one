import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import { Spinner, ToggleControl, SelectControl } from "@wordpress/components";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import { ICONS } from "@th-storeone-global/icons";
import THBackgroundControl from "@th-storeone-control/color";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import { useDispatch } from '@wordpress/data';
import {
  CopyIcon,
  TrashIcon,
  DragHandleDots2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

const MODULE_ID = "product-video";
import { STORE_NAME } from "@th-storeone/store/productVideoStore";

/* DEFAULT SETTINGS */
const DEFAULT_SETTINGS = {
  image_url: "",
  image_f_url: "",
  image_you_url: "",
  image_f_you_url: "",
  image_vim_url: "",
  image_f_vim_url: "",
  aspect: "default",
  aspectShop: "default",
  icon: "outline",
  icon_clr: "#e3e3e3",
  ficon: "outline",
  ficon_clr: "#e3e3e3",
  fauto_play: false,
  gauto_play: false,
};

const VIDEO_ICON_OPTIONS = [
  {
    id: "circle",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="10" fill="black" />
        <polygon points="10,8 16,12 10,16" fill="white" />
      </svg>
    ),
  },
  {
    id: "outline",
    icon: (
      <svg width="24" height="24" fill="#111" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"></path></g></svg>
    ),
  },
  {
    id: "triangle",
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28">
        <polygon points="8,5 19,12 8,19" fill="black" />
      </svg>
    ),
  },
  {
  id: "camera",
  icon: (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="black" strokeWidth="2">
      <rect x="3" y="6" width="11" height="12" rx="2"></rect>
      <polygon points="16,9 21,6 21,18 16,15"></polygon>
    </svg>
  )
},
{
  id: "youtube",
  icon: (
    <svg viewBox="0 0 68 48" width="36" height="26">
      <rect width="68" height="48" rx="10" fill="black" />
      <polygon points="28,18 28,30 42,24" fill="white" />
    </svg>
  )
}
];

/*TAB WRAPPER FIX */
const TabContentWrapper = ({ tab, setActiveTab, children }) => {
  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  return children;
};

export default function ProductVideoSettings({
  onSettingsChange,
  onRegisterSave,
  onLivePreview,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [hideToast, setHideToast] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const { setActiveTab } = useDispatch(STORE_NAME);

 /* ---------------------------------
   * LOAD SETTINGS
   * --------------------------------- */
  useEffect(() => {
    apiFetch.use(apiFetch.createNonceMiddleware(th_StoreOneAdmin.nonce));

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: "GET",
    })
      .then((res) => {
        const s = res?.settings || {};

        setSettings({
          ...DEFAULT_SETTINGS,
          ...s,
          product_page: {
            ...(DEFAULT_SETTINGS.product_page || {}),
            ...(s.product_page || {}),
          },
          cart_page: {
            ...(DEFAULT_SETTINGS.cart_page || {}),
            ...(s.cart_page || {}),
          },
        });
      })
      .catch(() => setError(__("Failed to load settings.", "store-one")))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------------------------
   * SAVE HANDLER
   * --------------------------------- */
  const handleSave = () => {
    if (saving) return;

    setSaving(true);
    setSuccess("");
    setError("");

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}module/${MODULE_ID}`,
      method: "POST",
      data: { settings },
    })
      .then(() => setSuccess(__("Saved successfully!", "th-store-one")))
      .catch(() => setError(__("Failed to save.", "th-store-one")))
      .finally(() => setSaving(false));
  };

  /* ---------------------------------
   * NOTIFY PARENT ON CHANGE
   * --------------------------------- */
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings]);

  /* ---------------------------------
   * REGISTER SAVE WITH ADMIN MAIN
   * --------------------------------- */
  useEffect(() => {
    onRegisterSave?.(() => handleSave);
  }, [settings]);

  /* ---------------------------------
   * AUTO HIDE TOAST
   * --------------------------------- */
  useEffect(() => {
    if (success || error) {
      setHideToast(false);

      const t1 = setTimeout(() => setHideToast(true), 2500);
      const t2 = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [success, error]);
  /* UPDATE */
  const updateField = (field, val) => {
    setSettings((prev) => {
      const updated = { ...prev, [field]: val };
      onLivePreview?.(updated);
      return updated;
    });
  };

  const openMediaLibrary = (callback) => {
    const media = window.wp.media({
      title: "Select Image",
      button: { text: "Use Image" },
      multiple: false,
    });

    media.on("select", () => {
      const attachment = media.state().get("selection").first().toJSON();
      callback(attachment);
    });

    media.open();
  };

  if (loading) {
    return (
      <div className="store-one-loader">
        <Spinner /> Loading…
      </div>
    );
  }

  return (
    <div className="storeone-module-settings">

      <TabSwitcher
        defaultTab="gallery"
        tabs={[
          /* ================= GALLERY ================= */
          {
            id: "gallery",
            label: "Gallery",
            icon: ICONS.SETTINGS,
            content: (
              <TabContentWrapper tab="gallery" setActiveTab={setActiveTab}>
                <>
                 
                  <S1Field label="Global Custom Thumbnail">
                    <div className="s1-image-upload-wrapper">
                        {settings?.image_url ? (
                          <div className="s1-image-card">
                            <div className="s1-image-preview">
                              <img src={settings.image_url} alt="" />
                            </div>

                            <div className="s1-image-actions">
                              <button
                                type="button"
                                className="s1-btn s1-btn-edit"
                                onClick={() =>
                                  openMediaLibrary((media) =>
                                    updateField("image_url", media.url)
                                  )
                                }
                              >
                                <span className="s1-btn-icon">
                                  {ICONS.SETTINGS}
                                </span>
                                Change
                              </button>

                              <button
                                type="button"
                                className="s1-btn s1-btn-remove"
                                onClick={() => updateField("image_url", "")}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="s1-upload-card"
                            onClick={() =>
                              openMediaLibrary((media) =>
                                updateField("image_url", media.url)
                              )
                            }
                          >
                            <span className="s1-btn-icon">
                              {ICONS.DISPLAY}
                            </span>
                            <div className="s1-upload-text">
                              <strong>Upload Thumbnail</strong>
                              <p>Select or upload an image file</p>
                              <small className="s1-upload-note">
                                PNG, JPG, and SVG formats supported
                              </small>
                            </div>
                          </button>
                        )}
                      </div>
                  </S1Field>
                   
                 <div className="store-one-content-settings">
                      <S1Field label={__("Global Gallery Aspect Ratio", "th-store-one")}>
                        <SelectControl
                          value={settings?.aspect || "default"}
                          options={[
                            { label: __("Default 16:9", "th-store-one"), value: "default" },
                            { label: "1:1", value: "1:1" },
                            { label: "9:16", value: "9:16" },
                            { label: "4:3", value: "4:3" },
                            { label: "3:2", value: "3:2" },
                            { label: __("Auto", "th-store-one"), value: "auto" },
                          ]}
                          onChange={(val) => updateField("aspect", val)}
                        />
                      </S1Field>
                      <S1Field
                                      label={__("Auto Play", "th-store-one")}
                                      classN="s1-toggle-wrpapper"
                                    >
                                      <ToggleControl
                                        checked={settings.gauto_play}
                                        onChange={(value) =>
                                            updateField("gauto_play", value)
                                          }
                                      />
                                    </S1Field>

                      <S1Field label="Thumbnail Play Icon" classN="list-icon">
                        {VIDEO_ICON_OPTIONS.map(({ id, icon }) => (
                          <div
                            key={id}
                            className={`s1-icon-option ${
                              settings?.icon === id ? "active" : ""
                            }`}
                            onClick={() => updateField("icon", id)}
                          >
                            {icon}
                          </div>
                        ))}
                      </S1Field>

                      <S1Field>
                        <THBackgroundControl
                          allowGradient={true}
                          label={__("Icon Color", "th-store-one")}
                          value={settings?.icon_clr}
                          onChange={(v) => updateField("icon_clr", v)}
                        />
                      </S1Field>
                    </div>
                </>
              </TabContentWrapper>
            ),
          },

          /* ================= FEATURED ================= */
          {
            id: "featured",
            label: "Featured",
            icon: ICONS.USER,
            content: (
              <TabContentWrapper tab="featured" setActiveTab={setActiveTab}>
                <>
                
                  <S1Field label="Global Featured Thumbnail">
                      <div className="s1-image-upload-wrapper">
                        {settings?.image_f_url ? (
                          <div className="s1-image-card">
                            <div className="s1-image-preview">
                              <img src={settings.image_f_url} alt="" />
                            </div>

                            <div className="s1-image-actions">
                              <button
                                type="button"
                                className="s1-btn s1-btn-edit"
                                onClick={() =>
                                  openMediaLibrary((media) =>
                                    updateField("image_f_url", media.url)
                                  )
                                }
                              >
                                <span className="s1-btn-icon">
                                  {ICONS.SETTINGS}
                                </span>
                                Change
                              </button>

                              <button
                                type="button"
                                className="s1-btn s1-btn-remove"
                                onClick={() => updateField("image_f_url", "")}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="s1-upload-card"
                            onClick={() =>
                              openMediaLibrary((media) =>
                                updateField("image_f_url", media.url)
                              )
                            }
                          >
                            <span className="s1-btn-icon">
                              {ICONS.DISPLAY}
                            </span>
                            <div className="s1-upload-text">
                              <strong>Upload Thumbnail</strong>
                              <p>Select or upload an image file</p>
                              <small className="s1-upload-note">
                                PNG, JPG, and SVG formats supported
                              </small>
                            </div>
                          </button>
                        )}
                      </div>
                  </S1Field>
              
           
                        <S1Field label={__("Global Shop Aspect Ratio", "th-store-one")}>
                        <SelectControl
                          value={settings?.aspectShop || "default"}
                          options={[
                            { label: __("Default 16:9", "th-store-one"), value: "default" },
                            { label: "1:1", value: "1:1" },
                            { label: "9:16", value: "9:16" },
                            { label: "4:3", value: "4:3" },
                            { label: "3:2", value: "3:2" },
                            { label: __("Auto", "th-store-one"), value: "auto" },
                          ]}
                          onChange={(val) => updateField("aspectShop", val)}
                        />
                      </S1Field>
                      <S1Field
                                      label={__("Auto Play", "th-store-one")}
                                      classN="s1-toggle-wrpapper"
                                    >
                                      <ToggleControl
                                        checked={settings.fauto_play}
                                        onChange={(value) =>
                                            updateField("fauto_play", value)
                                          }
                                      />
                                    </S1Field>

                      <S1Field label="Thumbnail Play Icon" classN="list-icon">
                        {VIDEO_ICON_OPTIONS.map(({ id, icon }) => (
                          <div
                            key={id}
                            className={`s1-icon-option ${
                              settings?.ficon === id ? "active" : ""
                            }`}
                            onClick={() => updateField("ficon", id)}
                          >
                            {icon}
                          </div>
                        ))}
                      </S1Field>

                      <S1Field>
                        <THBackgroundControl
                          allowGradient={true}
                          label={__("Icon Color", "th-store-one")}
                          value={settings?.ficon_clr}
                          onChange={(v) => updateField("ficon_clr", v)}
                        />
                      </S1Field>
                </>
              </TabContentWrapper>
            ),
          },
        ]}
      />
    </div>
  );
}