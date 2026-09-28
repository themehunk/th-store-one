import { __ } from "@wordpress/i18n";

const ModulePreparingSkeleton = () => {
  return (
    <div className="s1-module-preparing-skeleton">
      {/* Top Back Button */}

      <div className="s1-preparing-skeleton__layout">
        {/* =========================
            LEFT - MODULE SETTINGS
        ========================== */}
        <div className="s1-preparing-skeleton__settings">
          {/* Module Header */}
          <div className="s1-preparing-skeleton__module-header">
            <div className="s1-preparing-skeleton__icon s1-skeleton"></div>

            <div className="s1-preparing-skeleton__module-title">
              <div className="s1-preparing-skeleton__title s1-skeleton"></div>
              <div className="s1-preparing-skeleton__description s1-skeleton"></div>
              <div className="s1-preparing-skeleton__description s1-skeleton"></div>
            </div>

            <div className="s1-preparing-skeleton__toggle s1-skeleton"></div>
          </div>

          {/* Settings Card */}
          <div className="s1-preparing-skeleton__settings-card">
            {/* Tabs */}
            <div className="s1-preparing-skeleton__tabs">
              <div className="s1-preparing-skeleton__tab s1-skeleton"></div>
              <div className="s1-preparing-skeleton__tab s1-skeleton"></div>
              <div className="s1-preparing-skeleton__tab s1-skeleton"></div>
              <div className="s1-preparing-skeleton__tab s1-skeleton"></div>
            </div>

            {/* Section 1 */}
            <div className="s1-preparing-skeleton__section">
              <div className="s1-preparing-skeleton__section-title s1-skeleton"></div>
              <div className="s1-preparing-skeleton__line"></div>

              <div className="s1-preparing-skeleton__field">
                <div className="s1-preparing-skeleton__label s1-skeleton"></div>
                <div className="s1-preparing-skeleton__input s1-skeleton"></div>
              </div>

              <div className="s1-preparing-skeleton__field">
                <div className="s1-preparing-skeleton__label s1-skeleton"></div>
                <div className="s1-preparing-skeleton__input s1-skeleton"></div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            RIGHT - LIVE PREVIEW
        ========================== */}
        <div className="s1-preparing-skeleton__preview">
          {/* Preview Header */}
          <div className="s1-preparing-skeleton__preview-header">
            <div className="s1-preparing-skeleton__preview-title s1-skeleton"></div>
          </div>

          {/* Browser / Preview Window */}
          <div className="s1-preparing-skeleton__preview-window">
            <div className="s1-preparing-skeleton__browser-bar">
              <span className="s1-preparing-skeleton__browser-dot"></span>
              <span className="s1-preparing-skeleton__browser-dot"></span>
              <span className="s1-preparing-skeleton__browser-dot"></span>
            </div>

            <div className="s1-preparing-skeleton__preview-content">
              {/* Preview heading */}
              <div className="s1-preparing-skeleton__preview-heading s1-skeleton"></div>

              {/* Preview tabs */}
              <div className="s1-preparing-skeleton__preview-tabs">
                <div className="s1-preparing-skeleton__preview-tab s1-skeleton"></div>
                <div className="s1-preparing-skeleton__preview-tab s1-skeleton"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePreparingSkeleton;
