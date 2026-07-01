import {
  Card,
  CardHeader,
  CardBody,
  ToggleControl,
  Button,
  Spinner,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";

const GlobalSettings = ({
  modulesList,
  modulesState,
  onToggleAllModules,
  licenseActive,
}) => {
  const [proLoading, setProLoading] = useState(true);
  const [proActionLoading, setProActionLoading] = useState(false);

  const [proPlugin, setProPlugin] = useState({
    installed: false,
    active: false,
  });

  useEffect(() => {
    loadProStatus();
  }, []);

  const loadProStatus = async () => {
    try {
      const response = await apiFetch({
        path: "/th-store-one/v1/storeone-pro",
      });

      setProPlugin(response);
    } catch (e) {
      console.error(e);
    } finally {
      setProLoading(false);
    }
  };

  const activatePro = async () => {
    try {
      setProActionLoading(true);

      await apiFetch({
        path: "/th-store-one/v1/storeone-pro/activate",
        method: "POST",
      });

      setProPlugin({
        installed: true,
        active: true,
      });

      // Refresh page after activation
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setProActionLoading(false);
    }
  };

  const allEnabled = modulesList
    .filter((mod) => !mod.premium || licenseActive)
    .every((mod) => !!modulesState[mod.id]);

  return (
    <div className="s1-content-area">
      <div className="settings-global-wrap">
        {/* Store One Pro Card */}
        <Card className="settings-card">
          <CardHeader>
            <h3>{__("Store One Pro", "th-store-one")}</h3>
          </CardHeader>

          <CardBody className="s1-store-pro-card">
            <div className="s1-store-pro-left">
              <img
                src={
                  th_StoreOneAdmin.homeUrl +
                  "wp-content/plugins/th-store-one/assets/images/storeonemain.png"
                }
                className="s1-store-pro-icon"
                alt="Store One"
              />

              <div className="s1-store-pro-content">
                <h3 className="s1-store-pro-title">Store One Pro</h3>

                <p className="s1-store-pro-desc">
                  Unlock all premium modules and advanced WooCommerce features.
                </p>
              </div>
            </div>

            <div className="s1-store-pro-right">
              {proLoading ? (
                <Spinner />
              ) : !proPlugin.installed ? (
                <Button
                  isPrimary
                  href="https://themehunk.com/storeone/"
                  target="_blank"
                >
                  Upgrade
                </Button>
              ) : !proPlugin.active ? (
                <Button
                  isPrimary
                  onClick={activatePro}
                  disabled={proActionLoading}
                >
                  {proActionLoading ? "Activating..." : "Activate"}
                </Button>
              ) : (
                <div className="s1-store-pro-active">
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
                  Activated
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Plugin Status */}
        <Card className="settings-card" style={{ marginTop: 16 }}>
          <CardHeader>
            <h3>{__("Plugin Status", "th-store-one")}</h3>
          </CardHeader>

          <CardBody>
            <ToggleControl
              label={__("Enable all Addons (master switch)", "th-store-one")}
              checked={allEnabled}
              onChange={(enableAll) => onToggleAllModules(enableAll)}
            />

            <p style={{ marginTop: "12px" }}>
              {__(
                "This switch quickly turns all addons on or off.",
                "th-store-one",
              )}
            </p>
          </CardBody>
        </Card>

        {/* Support */}
        <Card className="settings-card" style={{ marginTop: 16 }}>
          <CardHeader>
            <h3>{__("Support & Documentation", "th-store-one")}</h3>
          </CardHeader>

          <CardBody className="s1-card-body">
            <p>
              {__(
                "Need help? Visit documentation or contact support.",
                "th-store-one",
              )}
            </p>

            <Button
              className="s1-btn"
              href="https://themehunk.com/docs/store-one/"
              style={{ marginRight: "8px" }}
            >
              {__("View Docs", "th-store-one")}
            </Button>

            <Button
              className="s1-btn"
              target="_blank"
              href="https://themehunk.com/contact-us/"
            >
              {__("Contact Support", "th-store-one")}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default GlobalSettings;
