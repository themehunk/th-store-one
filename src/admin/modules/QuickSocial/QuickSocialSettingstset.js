import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';

import TabSwitcher from '@storeone-global/TabSwitcher';
import QuickSocialRule from './QuickSocialRuletest';
import THBackgroundControl from '@storeone-control/color';
import UniversalRangeControl from '@storeone-global/UniversalRangeControl';
import { ICONS } from '@storeone-global/icons';
import { S1Field } from '@storeone-global/S1Field';
import { TextControl, SelectControl, Button } from '@wordpress/components';
import { CopyIcon, TrashIcon, DragHandleDots2Icon ,ChevronDownIcon,
    ChevronUpIcon,CheckIcon, StarIcon, HeartIcon,LightningBoltIcon, RocketIcon  } from "@radix-ui/react-icons";

const MODULE_ID = 'quick-social';

const DEFAULT_SETTINGS = {
    links: [],
    social_style:'style1',
    social_visiblity:'show-all',
    icon_size: "20px",
    icon_color: "#111",
    bg_color: "#fff",
};

export default function QuickSocialSettings({
    onSettingsChange,
    onRegisterSave,
}) {

    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    /* Notify Parent */
    useEffect(() => {
        onSettingsChange?.(settings);
    }, [settings]);

    /* Load */
    useEffect(() => {
        apiFetch.use(apiFetch.createNonceMiddleware(StoreOneAdmin.nonce));

        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'GET',
        })
            .then((res) => {
                if (res?.settings) {
                    setSettings({
                        ...DEFAULT_SETTINGS,
                        ...res.settings,
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    /* Save */
    const handleSave = () => {
        apiFetch({
            path: `${StoreOneAdmin.restUrl}module/${MODULE_ID}`,
            method: 'POST',
            data: { settings },
        });
    };

    useEffect(() => {
        onRegisterSave?.(() => handleSave);
    }, [settings]);


    const menuItems = [
    { id: 'settings', label: 'Settings', icon: 'SETTINGS' },
    { id: 'design', label: 'Design', icon: 'DESIGN' },
    ];

    if (loading) {
        return (
            <div className="store-one-loader">
                <Spinner /> {__('Loading…', 'store-one')}
            </div>
        );
    }

    return (
        <div className="store-one-rules-container">

            <h3 className="store-one-section-title">{__('Quick Social', 'store-one')}</h3>
        <div className='store-one-rule-item'>
        <TabSwitcher
            defaultTab="settings"
            tabs={[
                {
                    id: menuItems[0].id,
                    label: menuItems[0].label,
                    icon:ICONS[menuItems[0].icon],
                    content: (
                        <>
                        <div className="store-one-rule-body">
                         <S1Field label={__('Layout', 'store-one')}>
                            <SelectControl
                                   
                            options={[
                                    { label: __('Style1', 'store-one'), value: 'style1' },
                                    { label: __('Style2', 'store-one'), value: 'style2' },
                                     { label: __('Style3', 'store-one'), value: 'style3' },
                              ]}
                               value={settings.social_style}
                                onChange={(v) =>
                                    setSettings({ ...settings,social_style: v })
                                }
                            />
                         </S1Field>
                         <S1Field label={__('Screen Visibility', 'store-one')}>
                            <SelectControl  
                            options={[
                                    { label: __('Show All', 'store-one'), value: 'show-all' },
                                    { label: __('Desktop Only', 'store-one'), value: 'show-desktop' },
                                    { label: __('Tablet/Mobile', 'store-one'), value: 'show-tab-mobile' },
                              ]}
                               value={settings.social_visiblity}
                                onChange={(v) =>
                                    setSettings({ ...settings,social_visiblity: v })
                                }
                            />
                         </S1Field>
                        <QuickSocialRule
                            links={settings.links}
                            onChange={(links) =>
                                setSettings({ ...settings, links })
                            }
                        />
                        <S1Field label={__('Shortcode', 'store-one')}>
    <p className="s1-shortcode-description">
        {__('Use this shortcode to display Quick Social anywhere on your site.', 'store-one')}
    </p>

                        <div className="s1-shortcode-wrapper">
                            <textarea
                                readOnly
                                value='[storeone_quick_social]'
                                className="s1-shortcode-textarea"
                            />

                            <button
                                type="button"
                                className="s1-shortcode-copy"
                                onClick={() => {
                                    navigator.clipboard.writeText('[storeone_quick_social]');
                                }}
                            >
                                <CopyIcon />
                            </button>
                        </div>
                    </S1Field>

                        </div>
                        </>
                    ),
                },
                {
                    id: menuItems[1].id,
                                        label: menuItems[1].label,
                                        icon:ICONS[menuItems[1].icon],
                    content: (
                        <div className="store-one-rule-body">

                            <UniversalRangeControl
                                label="Icon Size"
                                value={settings.icon_size}
                                onChange={(v) =>
                                    setSettings({ ...settings, icon_size: v })
                                }
                                min={10}
                                max={100}
                            />

                            <THBackgroundControl
                                label="Icon Color"
                                value={settings.icon_color}
                                onChange={(v) =>
                                    setSettings({ ...settings, icon_color: v })
                                }
                            />

                            <THBackgroundControl
                                label="Background"
                                value={settings.bg_color}
                                onChange={(v) =>
                                    setSettings({ ...settings, bg_color: v })
                                }
                            />

                        </div>
                    ),
                },
            ]}
        />
        </div>
        </div>
    );
}


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
   phone: "",
  message: "",
  };

  /* ================= NORMALIZED KEY ================= */
  const platformKey = messaging.selected_icon
    ? messaging.selected_icon.toLowerCase()
    : "";

  const currentPlatform = PLATFORM_CONFIG?.[platformKey];

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

  if (template.includes("{MOBILE_NUMBER}")) {
    finalUrl = finalUrl.replace(
      "{MOBILE_NUMBER}",
      messaging.phone
        ? messaging.phone
        : "{MOBILE_NUMBER}"
    );
  }

  if (template.includes("{YOUR_MESSAGE}")) {
    finalUrl = finalUrl.replace(
      "{YOUR_MESSAGE}",
      messaging.message
        ? encodeURIComponent(messaging.message)
        : "{YOUR_MESSAGE}"
    );
  }

  updateBuyItemField(
    ruleIndex,
    itemIndex,
    "messaging",
    "url",
    finalUrl
  );
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
      {(messaging.icontype || "icon") === "icon" &&
        messaging.selected_icon && (
          <S1Field>
            {ICONS[messaging.selected_icon?.toUpperCase()]}
          </S1Field>
        )}

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
        <S1Field label="Phone Number">
  <TextControl
    value={messaging.phone || ""}
    placeholder="{phone}"
    onChange={(v) =>
      updateBuyItemField(
        ruleIndex,
        itemIndex,
        "messaging",
        "phone",
        v
      )
    }
  />
</S1Field>
      )}

      {currentPlatform.profile.includes("{YOUR_MESSAGE}") && (
        <S1Field label="Message">
  <TextControl
    value={messaging.message || ""}
    placeholder="{message}"
    onChange={(v) =>
      updateBuyItemField(
        ruleIndex,
        itemIndex,
        "messaging",
        "message",
        v
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

     
    </>
  );
}