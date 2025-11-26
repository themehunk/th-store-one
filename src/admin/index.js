// src/admin/index.jsx
import { createRoot } from '@wordpress/element';
import AdminMain from './AdminMain';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('store-one-admin-app');

    if (container) {
        const root = createRoot(container);
        root.render(<AdminMain />);
    }
});
