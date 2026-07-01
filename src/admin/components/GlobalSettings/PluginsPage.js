import { useEffect, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { Spinner } from "@wordpress/components";
import PluginCard from "./PluginCard";
import { __ } from "@wordpress/i18n";
export default function PluginsPage() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      const data = await apiFetch({
        path: "/th-store-one/v1/extensions",
      });

      setPlugins(Object.values(data));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (plugin) => {
    plugin.loading = true;
    setPlugins([...plugins]);

    await apiFetch({
      path: "/th-store-one/v1/extensions/action",
      method: "POST",
      data: {
        extension: plugin.key,
      },
    });

    loadPlugins();
  };

  if (loading) {
    return (
      <div className="s1-loader">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="s1-content-area">
      <div className="s1-plugins-header">
        <h2>{__("Available Plugins", "th-store-one")}</h2>
      </div>

      <div className="s1-plugins-grid">
        {plugins.map((plugin) => (
          <PluginCard
            key={plugin.key}
            plugin={plugin}
            onAction={() => handleAction(plugin)}
          />
        ))}
      </div>
    </div>
  );
}
