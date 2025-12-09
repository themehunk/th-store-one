import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function MultiWooSearchSelector({
    label = "",
    value = [],
    onChange,
    searchType = "product",  
}) {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    /* ----------------------------------------------------------
     * ENDPOINTS
     ----------------------------------------------------------- */
    const endpointMap = {
        product: "wc/v3/products",
        category: "wc/v3/products/categories",
        tag: "wc/v3/products/tags",
    };

    const endpoint = endpointMap[searchType];

    /* ----------------------------------------------------------
     * NORMALIZER (ensures consistent shape)
     ----------------------------------------------------------- */
    const normalizeProduct = (product) => ({
        id: product.id,
        name:
            product.type === "variable"
                ? `${product.name} (Variable Product)`
                : product.name,
    });

    const normalizerMap = {
        product: normalizeProduct,
        category: (item) => ({ id: item.id, name: item.name }),
        tag: (item) => ({ id: item.id, name: item.name }),
    };

    const normalize = normalizerMap[searchType] || ((x) => x);

    /* ----------------------------------------------------------
     * ADD ITEM
     ----------------------------------------------------------- */
    const addItem = (item) => {
        if (!value.some((v) => v.id === item.id)) {
            onChange([...value, item]);
        }
        setQuery("");
        setResults([]);
    };

    /* ----------------------------------------------------------
     * REMOVE ITEM
     ----------------------------------------------------------- */
    const removeItem = (id) => {
        onChange(value.filter((x) => x.id !== id));
    };

    /* ----------------------------------------------------------
     * FETCH RESULTS (Supports variable products)
     ----------------------------------------------------------- */
    useEffect(() => {
        if (!endpoint) return;
        if (!query.trim()) {
            setResults([]);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);

            try {
                /* MAIN PRODUCT SEARCH */
                const res = await apiFetch({
                    path: `${endpoint}?search=${encodeURIComponent(query)}&per_page=50`,
                    signal: controller.signal,
                });

                let formatted = res.map(normalize);

                /* EXTRA: Search inside variations if product is variable */
                for (const p of res) {
                    if (p.type === "variable") {
                        try {
                            const vars = await apiFetch({
                                path: `wc/v3/products/${p.id}/variations`,
                                signal: controller.signal,
                            });

                            vars.forEach((v) => {
                                formatted.push({
                                    id: v.id,
                                    name: `${p.name} – ${v.attributes
                                        .map((a) => a.option)
                                        .join(", ")}`,
                                });
                            });
                        } catch (err) {
                            // ignore
                        }
                    }
                }

                setResults(formatted);
            } catch (e) {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query, endpoint]);

    /* ----------------------------------------------------------
     * UI RENDER
     ----------------------------------------------------------- */
    return (
        <div className="s1-field-wrapper multi-search-selector">

            {label && <label className="s1-field-label">{label}</label>}

            {/* SELECTED ITEMS */}
            <div className='s1-field-control'>
            <div className="selected-items">
                {value.map((item) => (
                    <span key={item.id} className="selector-chip">
                        {item.name}
                        <span className="remove-chip" onClick={() => removeItem(item.id)}>×</span>
                    </span>
                ))}
            </div>

            {/* SEARCH INPUT */}
            <TextControl
                placeholder={loading ? __('Searching…', 'store-one') : __('Search products…', 'store-one')}
                value={query}
                onChange={setQuery}
            />

            {/* DROPDOWN RESULTS */}
            {query.length > 0 && results.length > 0 && (
                <div className="selector-dropdown">
                    {results.map((r) => (
                        <div
                            key={r.id}
                            className="selector-option"
                            onClick={() => addItem(r)}
                        >
                            {r.name}
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}
