import React from 'react';
import { __ } from '@wordpress/i18n';

const Header = ({ currentPage, setCurrentPage, setActiveModule }) => {
    return (
       <header className="s1-header">
    
    {/* Left Area */}
    <div className="s1-header__left">
        <span className="s1-header__logo">S1</span>

        <div className="s1-header__branding">
            <h1 className="s1-header__title">
                { __('Store One', 'store-one') }
            </h1>

            <p className="s1-header__subtitle">
                { __('WooCommerce Enhancement Toolkit', 'store-one') }
            </p>
        </div>
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
            <span className="dashicons dashicons-dashboard"></span>
            <span>{ __('Dashboard', 'store-one') }</span>
        </button>

        <button
            className={`s1-nav__btn ${currentPage === 'settings' ? 'is-active' : ''}`}
            onClick={() => {
                setCurrentPage('settings');
                setActiveModule(null);
            }}
        >
            <span className="dashicons dashicons-admin-generic"></span>
            <span>{ __('Settings', 'store-one') }</span>
        </button>

    </nav>

    {/* Upgrade CTA */}
    <a href="#" className="s1-header__upgrade components-button is-secondary">
        { __('Upgrade', 'store-one') }
    </a>
</header>

    );
};

export default Header;
