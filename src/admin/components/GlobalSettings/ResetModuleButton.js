import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { useState } from "@wordpress/element";

export default function ResetModuleButton({
  moduleId,
  label = "Reset",
  onReset,
}) {
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    if (resetting) return;

    const confirmReset = window.confirm(
      __("Are you sure you want to reset all settings?", "th-store-one")
    );

    if (!confirmReset) return;

    setResetting(true);

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}module/${moduleId}/reset`,
      method: "POST",
    })
      .then((res) => {
        const resetSettings = onReset?.(res?.settings);

        window.dispatchEvent(
          new CustomEvent("th-store-one:module-reset", {
            detail: {
              moduleId,
              settings: resetSettings,
            },
          })
        );
      })
      .catch(() => {
        alert(__("Reset failed.", "th-store-one"));
      })
      .finally(() => {
        setResetting(false);
      });
  };

  return (
    <div
      className={`store-one-reset-link ${resetting ? "is-resetting" : ""}`}
      onClick={handleReset}
      aria-disabled={resetting}
    >
      {resetting ? __("Resetting…", "th-store-one") : __(label, "th-store-one")}
    </div>
  );
}
