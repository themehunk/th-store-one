import React from 'react';
import { __ } from '@wordpress/i18n';

const Header = ({ currentPage, setCurrentPage, setActiveModule }) => {
    return (
        <header className="store-one-header">
            
            {/* Left Logo */}
            <div className="store-one-header-left">
                <span className="store-one-logo">S1</span>
                <div>
                    <h1 className="store-one-title">
                        { __('Store One', 'store-one') }
                    </h1>
                    <p className="store-one-subtitle">
                        { __('WooCommerce Enhancement Toolkit', 'store-one') }
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="store-one-header-nav">

                <button
                    className={`nav-btn ${currentPage === 'dashboard' ? 'is-active' : ''}`}
                    onClick={() => {
                        setCurrentPage('dashboard');
                        setActiveModule(null);
                    }}
                >
                    <span className="dashicons dashicons-dashboard"></span>
                    <span>{ __('Dashboard', 'store-one') }</span>
                </button>

                <button
                    className={`nav-btn ${currentPage === 'settings' ? 'is-active' : ''}`}
                    onClick={() => {
                        setCurrentPage('settings');
                        setActiveModule(null);
                    }}
                >
                    <span className="dashicons dashicons-admin-generic"></span>
                    <span>{ __('Settings', 'store-one') }</span>
                </button>

            </nav>

            <a href="#" className="components-button is-secondary upgrade-btn">
                { __('Upgrade', 'store-one') }
            </a>
        </header>
    );
};

export default Header;
