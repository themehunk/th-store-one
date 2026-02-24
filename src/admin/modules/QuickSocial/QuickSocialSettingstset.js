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
