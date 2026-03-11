import { Card, CardHeader, CardBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";

const LicensePage = () => {

    useEffect(() => {

        apiFetch({ path: `${StoreOneAdmin.restUrl}license-html` })
        .then((html) => {

            const el = document.getElementById("store-one-license-root");

            if (el) {
                el.innerHTML = html;
            }

        });

    }, []);

    return (

        <div className="s1-content-area">
            <div className="settings-global-wrap">

                <Card className="settings-card">

                    <CardHeader>
                        <h3>{__("License Activation", "store-one")}</h3>
                    </CardHeader>

                    <CardBody>
                        <div id="store-one-license-root"></div>
                    </CardBody>

                </Card>

            </div>
        </div>

    );

};

export default LicensePage;