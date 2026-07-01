import { Button, Spinner } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export default function PluginCard({ plugin, onAction }) {
  return (
    <div className="s1-plugin-card">
      <div className="s1-plugin-top">
        <div className="s1-plugin-header">
          <img className="s1-plugin-icon" src={plugin.icon} alt={plugin.name} />

          <span
            className={`s1-plugin-badge ${
              plugin.type === "pro" ? "pro" : "free"
            }`}
          >
            {plugin.type === "pro"
              ? __("PRO", "th-store-one")
              : __("FREE", "th-store-one")}
          </span>
        </div>

        <h3 className="s1-plugin-title">{plugin.name}</h3>

        <p className="s1-plugin-description">{plugin.description}</p>

        <div className="s1-plugin-links">
          <a
            href={plugin.details_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {__("View details", "th-store-one")}
          </a>

          {plugin.active && (
            <>
              <span>|</span>

              <a href={plugin.admin_url}>{__("Settings", "th-store-one")}</a>
            </>
          )}
        </div>
      </div>

      <div className="s1-plugin-footer">
        {plugin.active ? (
          <div className="s1-plugin-active">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>

            <span>{__("Activated", "th-store-one")}</span>
          </div>
        ) : (
          <Button
            className="s1-plugin-btn"
            isPrimary
            disabled={plugin.loading}
            onClick={() => onAction(plugin)}
          >
            {plugin.loading ? (
              <>
                <Spinner /> {__("Installing...", "th-store-one")}
              </>
            ) : plugin.installed ? (
              __("Activate Now", "th-store-one")
            ) : (
              __("Install & Activate", "th-store-one")
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
