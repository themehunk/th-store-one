import { useRef, useEffect } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { S1Field, S1FieldGroup } from "@storeone-global/S1Field";
export default function TrustBadgeSelector({
  title,
  rule,
  index,
  updateField,
  presetBadges = [],
  allowUpload = true,
  badgeType = "image" // image | css | advance
}) {

  const frameRef = useRef(null);
  const uploaded = rule.uploaded_badges || [];

  /* ---------------- DEFAULT BADGE ---------------- */

  useEffect(() => {
    if (presetBadges.length === 0) return;
      if (badgeType === "image" && !rule.badge_image) {
      const first = presetBadges[0];
      const url = typeof first === "string"
        ? first
        : (first.url || first.preview);
      updateField(index, "badge_image", url);
    }

    if (badgeType === "css" && !rule.badge_css_type) {
      updateField(index, "badge_css_type", presetBadges[0].id);
    }

    if (badgeType === "advance" && !rule.badge_advance_type) {
      updateField(index, "badge_advance_type", presetBadges[0].id);
    }

  }, []);

  /* ---------------- UPLOAD ---------------- */

  const openUploader = () => {

    if (!frameRef.current) {

      frameRef.current = wp.media({
        title: "Upload Badges",
        button: { text: "Add Badges" },
        multiple: true,
        library: { type: "image" },
      });

      frameRef.current.on("select", () => {

        const attachments = frameRef.current
          .state()
          .get("selection")
          .toJSON();

        const urls = attachments.map((a) => a.url);

        const newList = [...urls, ...uploaded];

        updateField(index, "uploaded_badges", newList);

      });

    }

    frameRef.current.open();

  };

  /* ---------------- SELECT BADGE ---------------- */

  const selectBadge = (badge) => {

    if (badgeType === "image") {
      updateField(index, "badge_image", badge.url || badge);
    }

    if (badgeType === "css") {
      updateField(index, "badge_css_type", badge.id);
    }

    if (badgeType === "advance") {
      updateField(index, "badge_advance_type", badge.id);
    }

  };

  /* ---------------- REMOVE UPLOADED ---------------- */

  const removeBadge = (url) => {

    const filtered = uploaded.filter((u) => u !== url);

    updateField(index, "uploaded_badges", filtered);

    if (rule.badge_image === url) {
      updateField(index, "badge_image", "");
    }

  };

  /* ---------------- BADGE LIST ---------------- */

  const uploadedBadges = uploaded.map((url) => ({
    id: url,
    type: "image",
    url
  }));

  const allBadges = allowUpload
    ? [...uploadedBadges, ...presetBadges]
    : presetBadges;

  /* ---------------- ACTIVE STATE ---------------- */

  const isActive = (badge) => {

    if (badgeType === "image") {
      return rule.badge_image === (badge.url || badge);
    }

    if (badgeType === "css") {
      return rule.badge_css_type === badge.id;
    }

    if (badgeType === "advance") {
      return rule.badge_advance_type === badge.id;
    }

    return false;

  };

  /* ---------------- RENDER ---------------- */

  return (

    <S1FieldGroup title={title}>

    <div className="s1-badge-wrapper-group">

      <div className="s1-badge-grid">

        {/* Upload */}

        {allowUpload && (
          <div
            className="s1-badge-upload"
            onClick={openUploader}
          >
            <span className="s1-plus">+</span>
            <span className="s1-tooltip">Upload Image</span>
          </div>
        )}

        {allBadges.map((badge) => {

          const preview = badge.url || badge.preview || badge;
          const active = isActive(badge);
          const isUploaded = uploaded.includes(badge.url);

          return (

            <div
              key={badge.id || badge}
              className={`s1-badge-item ${active ? "is-active" : ""}`}
              onClick={() => selectBadge(badge)}
            >

              <img src={preview} alt="" />

              {allowUpload && isUploaded && (
                <button
                  className="s1-badge-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBadge(badge.url);
                  }}
                >
                  ×
                </button>
              )}

            </div>

          );

        })}

      </div>

    </div>
    </S1FieldGroup>

  );

}