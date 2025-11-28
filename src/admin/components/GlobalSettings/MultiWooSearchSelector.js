import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function MultiWooSearchSelector({
    label = "",
    value = [],
    onChange,
    searchType = "product",  // product | category | tag | user | roles
    customOptions = [],      // for roles/static lists
}) {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const activeRequest = useRef(null);

    /* ------------------------------------------
       API ENDPOINT MAP
    ------------------------------------------- */
    const endpointMap = {
        product: "wc/v3/products",
        category: "wc/v3/products/categories",
        tag: "wc/v3/products/tags",

        // NEW: user support if you add endpoint backend
        user: "storeone/v1/users",

        // NEW: roles = static mode
        roles: null,
    };

    const endpoint = endpointMap[searchType];

    /* ------------------------------------------
       ADD item
    ------------------------------------------- */
    const addItem = (item) => {
        if (!value.some((v) => v.id === item.id)) {
            onChange([...value, item]);
        }
        setQuery("");
        setResults([]);
    };

    /* ------------------------------------------
       REMOVE item
    ------------------------------------------- */
    const removeItem = (id) => {
        onChange(value.filter((v) => v.id !== id));
    };

    /* ------------------------------------------
       STATIC LIST MODE (roles)
    ------------------------------------------- */
    if (searchType === "roles") {
        return (
            <div className="multi-search-selector s1-field-control">
                {label && <label className="s1-field-label">{label}</label>}

                <div className="selected-items">
                    {value.map((item) => (
                        <span key={item.id} className="selector-chip">
                            {item.name}
                            <span
                                className="remove-chip"
                                onClick={() => removeItem(item.id)}
                            >
                                ×
                            </span>
                        </span>
                    ))}
                </div>

                <select
                    className="multiwoo-static-select"
                    onChange={(e) => {
                        const role = customOptions.find(r => r.value === e.target.value);
                        if (role) addItem({ id: role.value, name: role.label });
                    }}
                >
                    <option value="">{__('Select Role…', 'store-one')}</option>
                    {customOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    /* ------------------------------------------
       DYNAMIC FETCH MODE
    ------------------------------------------- */
    useEffect(() => {
        let abort = false;

        if (!endpoint) return;
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);

        const controller = new AbortController();
        activeRequest.current = controller;

        apiFetch({
            path: `${endpoint}?search=${encodeURIComponent(query)}`,
            signal: controller.signal,
        })
            .then((items) => {
                if (!abort) {
                    setResults(items);
                }
            })
            .catch(() => {
                if (!abort) setResults([]);
            })
            .finally(() => {
                if (!abort) setLoading(false);
            });

        return () => {
            abort = true;
            if (activeRequest.current) {
                activeRequest.current.abort?.();
            }
        };

    }, [query, endpoint]);

    /* ------------------------------------------
       RENDER
    ------------------------------------------- */
    return (
        <div className="multi-search-selector s1-field-control">

            {label && <label className="s1-field-label">{label}</label>}

            {/* Selected Items */}
            <div className="selected-items">
                {value.map((item) => (
                    <span key={item.id} className="selector-chip">
                        {item.name}
                        <span
                            className="remove-chip"
                            onClick={() => removeItem(item.id)}
                        >
                            ×
                        </span>
                    </span>
                ))}
            </div>

            {/* Search Input */}
            <TextControl
                placeholder={loading ? __('Searching…', 'store-one') : __('Search…', 'store-one')}
                value={query}
                onChange={setQuery}
            />

            {/* Results Dropdown */}
            {query.length >= 2 && results.length > 0 && (
                <div className="selector-dropdown">
                    {results.map((item) => (
                        <div
                            key={item.id}
                            className="selector-option"
                            onClick={() => addItem(item)}
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
