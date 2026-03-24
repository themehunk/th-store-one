import { __ } from '@wordpress/i18n';
const Header = ({ currentPage, setCurrentPage, setActiveModule, proActive,licenseActive}) => {
    return (
    <header className="s1-header">
    
    <div className="s1-header-wrap">
    <div className="s1-header__left">
    <span className="s1-header__logo"><img
    src={th_StoreOneAdmin.homeUrl + "wp-content/plugins/store-one/assets/images/storeonemain.png"}
    alt="Store One"
    className="s1-header__logo"
    /></span>
    </div>

    {/* Navigation */}
    <nav className="s1-header__nav">

        <button
            className={`s1-nav__btn ${currentPage === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => {
                setCurrentPage('dashboard');
                setActiveModule(null);
            }}
        >
             <svg class="w-4 h-4" height="16px" width="16px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span>{ __('Dashboard', 'th-store-one') }</span>
        </button>

        <button
            className={`s1-nav__btn ${currentPage === 'settings' ? 'is-active' : ''}`}
            onClick={() => {
                setCurrentPage('settings');
                setActiveModule(null);
            }}
        >
            <svg class="w-4 h-4" height="16px" width="16px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>{ __('Settings', 'th-store-one') }</span>
        </button>

        {proActive && (
    <button
        className={`s1-nav__btn ${currentPage === 'license' ? 'is-active' : ''}`}
        onClick={() => {
            setCurrentPage('license');
            setActiveModule(null);
        }}
    >
    <svg class="w-4 h-4" height="16px" width="16px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M5 21v-2a7 7 0 0114 0v2"/>
    </svg>

    <span>{ __('License', 'th-store-one') }</span>
        </button>
        )}

    </nav>

    {/* Upgrade CTA */}
    {licenseActive ? (
    <div className="s1-header__active">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span>{__('Activated', 'th-store-one')}</span>
    </div>
    ) : (
    <a
        href="https://themehunk.com/storeone/"
        target="_blank"
        rel="noopener noreferrer"
        className="s1-header__upgrade components-button is-secondary"
    >
        {__('Upgrade', 'th-store-one')}
    </a>
    )}
    </div>
</header>
    );
};

export default Header;