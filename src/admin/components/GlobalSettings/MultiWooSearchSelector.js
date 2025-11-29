import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * COMPLETE UPGRADED VERSION
 */
export default function MultiWooSearchSelector({
    label = "",
    value = [],
    onChange,
    searchType = "product",        // product | category | tag | user | roles
    customOptions = [],            // roles → [{label, value}]
}) {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    /* ----------------------------------------------
     * ENDPOINT MAP
     * ---------------------------------------------- */
    const endpointMap = {
        product: "wc/v3/products",
        category: "wc/v3/products/categories",
        tag: "wc/v3/products/tags",
        user: "store-one/v1/users",     // custom REST endpoint
        roles: null,
    };

    const endpoint = endpointMap[searchType];

    /* ----------------------------------------------
     * NORMALIZE API ITEMS → { id, name }
     * ---------------------------------------------- */
    const normalizerMap = {
        product: (item) => ({
            id: item.id,
            name: item.name,
        }),
        category: (item) => ({
            id: item.id,
            name: item.name,
        }),
        tag: (item) => ({
            id: item.id,
            name: item.name,
        }),
        user: (item) => ({
            id: item.id,
            name: item.name || item.username || `User #${item.id}`,
        }),
    };

    const normalize = normalizerMap[searchType] || ((x) => x);

    /* ----------------------------------------------
     * ADD ITEM
     * ---------------------------------------------- */
    const addItem = (item) => {
        if (!value.some((v) => v.id === item.id)) {
            onChange([...value, item]);
        }
        setQuery("");
        setResults([]);
    };

    /* ----------------------------------------------
     * REMOVE ITEM
     * ---------------------------------------------- */
    const removeItem = (id) => {
        onChange(value.filter((v) => v.id !== id));
    };

    /* ------------------------------------------------
     * STATIC MODE: ROLES
     * ------------------------------------------------ */
    if (searchType === "roles") {
        const options = customOptions.map((r) => ({ id: r.value, name: r.label }));

        return (
            <div className="multi-search-selector s1-field-control">

                {label && <label className="s1-field-label">{label}</label>}

                {/* selected */}
                <div className="selected-items">
                    {value.map((item) => (
                        <span key={item.id} className="selector-chip">
                            {item.name}
                            <span className="remove-chip" onClick={() => removeItem(item.id)}>×</span>
                        </span>
                    ))}
                </div>

                <select
                    className="multiwoo-static-select"
                    onChange={(e) => {
                        const opt = options.find((o) => `${o.id}` === e.target.value);
                        if (opt) addItem(opt);
                    }}
                >
                    <option value="">{__('Select Role…', 'store-one')}</option>
                    {options.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                </select>
            </div>
        );
    }

    /* ------------------------------------------------
     * DYNAMIC FETCH MODE (PRODUCT / CATEGORY / TAG / USER)
     * ------------------------------------------------ */
    useEffect(() => {
        if (!endpoint) return;
        if (query.trim().length < 1) {
            setResults([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            if (abortRef.current) abortRef.current.abort();

            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);

            apiFetch({
                path: `${endpoint}?search=${encodeURIComponent(query)}`,
                signal: controller.signal,
            })
                .then((items) => {
                    const formatted = items.map(normalize);
                    setResults(formatted);
                })
                .catch(() => setResults([]))
                .finally(() => setLoading(false));
        }, 250);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };

    }, [query, endpoint]);

    /* ------------------------------------------------
     * RENDER
     * ------------------------------------------------ */
    return (
        <div className="multi-search-selector s1-field-control">

            {label && <label className="s1-field-label">{label}</label>}

            <div className="selected-items">
                {value.map((item) => (
                    <span key={item.id} className="selector-chip">
                        {item.name}
                        <span className="remove-chip" onClick={() => removeItem(item.id)}>×</span>
                    </span>
                ))}
            </div>

            {/* search */}
            <TextControl
                placeholder={loading ? __('Searching…', 'store-one') : __('Search…', 'store-one')}
                value={query}
                onChange={(v) => setQuery(v)}
            />

            {/* dropdown */}
            {query.length >= 1 && results.length > 0 && (
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
