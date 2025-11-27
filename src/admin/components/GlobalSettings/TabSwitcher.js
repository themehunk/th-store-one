import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export default function TabSwitcher({ tabs, defaultTab = 'settings' }) {
    const [active, setActive] = useState(defaultTab);

    return (
        <div className="store-one-tab-switcher">

            <div className="store-one-tab-header">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`store-one-tab-item ${
                            active === tab.id ? 'active' : ''
                        }`}
                        onClick={() => setActive(tab.id)}
                    >
                        <span className={`dashicons ${tab.icon}`}></span>
                        <span className="store-one-tab-text">{tab.label}</span>
                    </div>
                ))}
            </div>

            <div className="store-one-tab-content">
                {tabs.find((t) => t.id === active)?.content}
            </div>

        </div>
    );
}
