import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { S1Field, S1FieldGroup } from "@th-storeone-global/S1Field";
import {
  Spinner,
  ToggleControl,
  SelectControl,
  TextControl,
} from "@wordpress/components";
import ResetModuleButton from "@th-storeone-global/ResetModuleButton";
import TabSwitcher from "@th-storeone-global/TabSwitcher";
import { ICONS } from "@th-storeone-global/icons";
import DeviceSelector from "@th-storeone-global/DeviceSelector";
import MultiWooSearchSelector from "@th-storeone-global/MultiWooSearchSelector";
import ExcludeWooCondition from "@th-storeone-global/ExcludeWooCondition";
import UserCondition from "@th-storeone-global/UserCondition";
import THBackgroundControl from "@th-storeone-control/color";
import S1DateTimePicker from "@th-storeone-global/S1DateTimePicker";
import PlacementPriorityControl from "@th-storeone-global/PlacementPriorityControl";
import { CopyIcon } from "@radix-ui/react-icons";
import UniversalRangeControl from "@th-storeone-global/UniversalRangeControl";
import UniversalBorderControl from "@th-storeone-control/UniversalBorderControl";
import UniversalDimensionControl from "@th-storeone-control/UniversalDimensionControl";

const MODULE_ID = "sale-countdown";

/* ---------------------------------
 * DEFAULT SETTINGS
 * --------------------------------- */
const DEFAULT_SETTINGS = {
  enable_countdown: true,

  show_on_archive: false,
  show_on_single: true,

  archive_position: "after_price",
  single_placement: "woocommerce_after_add_to_cart_form",
  single_priority: 10,

  trigger_type: "all_products",

  countdown_expire_action: "hide",
  expire_message: "Offer expired",

  sale_countdown_style: "style1",
  time_format: "dhms",

  show_message: true,
  show_stock_bar: true,
  show_timer_labels: true,

  bg_color: "#111",
  text_color: "#fff",
  timer_color: "#ff0000",

  border_radius: 6,
  padding: 10,

  enable_stock_bar: true,
  stock_bar_color: "#22c55e",
  low_stock_color: "#ef4444",
  stock_threshold: 10,

  hide_if_expired: true,
  hide_if_no_stock: true,
};

export default function SaleCountdownSettings({
  onSettingsChange,
  onRegisterSave,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [hideToast, setHideToast] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const devices = settings.visibility?.devices || [];
  const isOnlyMobile = devices.includes("mobile");
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
        });
      })
      .catch(() => setError(__("Failed to load settings.", "th-store-one")))
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

  useEffect(() => {
  const handler = (e) => {
    const { style } = e.detail;
    if (!style) return;

    const updated = {
      ...settings,
      sale_countdown_style: style,
    };

    setSettings(updated);
    onSettingsChange?.(updated); //live preview trigger
  };

  window.addEventListener('storeone:changeSaleCountdownStyle', handler);

  return () => {
    window.removeEventListener('storeone:changeSaleCountdownStyle', handler);
  };
}, [settings]);

  /* ---------------------------------
   * RENDER
   * --------------------------------- */
  return (
    <div className="storeone-module-settings">
      {loading && (
        <div className="store-one-loader">
          <Spinner /> {__("Loading…", "th-store-one")}
        </div>
      )}

      {!loading && (
        <>
          {/* NOTICES */}
          {error && (
            <div
              className={`s1-toast s1-toast--error ${hideToast ? "hide" : ""}`}
            >
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className={`s1-toast s1-toast--success ${
                hideToast ? "hide" : ""
              }`}
            >
              <span>{success}</span>
            </div>
          )}

          {/* ---------------------------------
           * PRODUCT PAGE SETTINGS
           * --------------------------------- */}
          <h3 className="store-one-section-title">
            {__("Buy Now Button", "th-store-one")}
          </h3>
          <div className="store-one-rule-item">
            <TabSwitcher
              defaultTab="settings"
              tabs={[
                {
                  id: "settings",
                  label: "Settings",
                  icon: ICONS.SETTINGS,
                  content: (
  <>
  {/* SINGLE PAGE */}
  <S1FieldGroup title={__("Single page", "th-store-one")}>
    <S1Field
      label={__("Enable on Single Page", "th-store-one")}
      classN="s1-toggle-wrpapper"
    >
      <ToggleControl
        checked={settings.show_on_single}
        onChange={(v) =>
          setSettings({ ...settings, show_on_single: v })
        }
      />
    </S1Field>

    {settings.show_on_single && (
      <>
        <PlacementPriorityControl
          placement={settings.single_placement}
          priority={settings.single_priority}
          onPlacementChange={(v) =>
            setSettings({ ...settings, single_placement: v })
          }
          onPriorityChange={(v) =>
            setSettings({ ...settings, single_priority: v })
          }
        />
      </>
    )}
  </S1FieldGroup>

  {/* ARCHIVE PAGE */}
  <S1FieldGroup title={__("Archive page", "th-store-one")}>
    <S1Field
      label={__("Enable on Archive Page", "th-store-one")}
      classN="s1-toggle-wrpapper"
    >
      <ToggleControl
        checked={settings.show_on_archive}
        onChange={(v) =>
          setSettings({ ...settings, show_on_archive: v })
        }
      />
    </S1Field>

    {settings.show_on_archive && (
      <>
        <S1Field label={__("Archive Position", "th-store-one")}>
          <SelectControl
            value={settings.archive_position}
            options={[
              { label: "after title", value: "after_title" },
              { label: "after rating", value: "after_rating" },
              { label: "after price", value: "after_price" },
              { label: "before add to cart", value: "before_add_to_cart" },
              { label: "after add to cart", value: "after_add_to_cart" },
            ]}
            onChange={(v) =>
              setSettings({ ...settings, archive_position: v })
            }
          />
        </S1Field>
      </>
    )}
  </S1FieldGroup>


     
  
  </>
)
                },
                {
                  id: "visibility",
                  label: "Action & Behavior",
                  icon: ICONS.DISPLAY,
                  content: (
  <>
    <S1Field label="Expire Action">
      <SelectControl
        value={settings.countdown_expire_action}
        options={[
          { label: "Hide Countdown", value: "hide" },
          { label: "Show Message", value: "show_message" },
        ]}
        onChange={(v) =>
          setSettings({
            ...settings,
            countdown_expire_action: v,
          })
        }
      />
    </S1Field>

    {settings.countdown_expire_action === "show_message" && (
      <S1Field label="Expire Message">
        <TextControl
          value={settings.expire_message}
          onChange={(v) =>
            setSettings({ ...settings, expire_message: v })
          }
        />
      </S1Field>
    )}

    <S1Field label="Time Format">
      <SelectControl
        value={settings.time_format}
        options={[
          { label: "DHMS", value: "dhms" },
          { label: "HMS", value: "hms" },
        ]}
        onChange={(v) =>
          setSettings({ ...settings, time_format: v })
        }
      />
    </S1Field>

    <S1Field label="Show Message">
      <ToggleControl
        checked={settings.show_message}
        onChange={(v) =>
          setSettings({ ...settings, show_message: v })
        }
      />
    </S1Field>

    <S1Field label="Show Stock Bar">
      <ToggleControl
        checked={settings.show_stock_bar}
        onChange={(v) =>
          setSettings({ ...settings, show_stock_bar: v })
        }
      />
    </S1Field>
  </>
)
                },

                {
                  id: "style",
                  label: "Style",
                  icon: ICONS.DESIGN,
                  content: (
  <>
    <S1Field label="Template">
      <SelectControl
        value={settings.sale_countdown_style}
        options={[
          { label: "style1", value: "style1" },
          { label: "style2", value: "style2" },
          { label: "style3", value: "style3" },
          { label: "style4", value: "style4" },
        ]}
        onChange={(v) =>
          setSettings({ ...settings, sale_countdown_style: v })
        }
      />
    </S1Field>

  </>
)
                },
              ]}
            ></TabSwitcher>
          </div>
        </>
      )}
      <div className="store-one-rules-footer bundle-footer">
        <ResetModuleButton
          moduleId={MODULE_ID}
          label="Reset"
          onReset={(newSettings) =>
            setSettings({
              ...DEFAULT_SETTINGS,
              ...newSettings,
            })
          }
        />
      </div>
    </div>
  );
}
