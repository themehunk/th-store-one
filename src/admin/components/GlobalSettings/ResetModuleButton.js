import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";

export default function ResetModuleButton({
  moduleId,
  label = "Reset",
  onReset,
}) {
  const handleReset = () => {
    const confirmReset = window.confirm(
      __("Are you sure you want to reset all settings?", "th-store-one")
    );

    if (!confirmReset) return;

    apiFetch({
      path: `${th_StoreOneAdmin.restUrl}module/${moduleId}/reset`,
      method: "POST",
    })
      .then((res) => {
        if (res?.settings) {
          onReset?.(res.settings);
        }
      })
      .catch(() => {
        alert(__("Reset failed.", "th-store-one"));
      });
  };

  return (
    <div
      className="store-one-reset-link"
      onClick={handleReset}
    >
      {__(label, "th-store-one")}
    </div>
  );
}