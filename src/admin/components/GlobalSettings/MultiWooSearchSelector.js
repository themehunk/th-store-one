import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

export default function MultiWooSearchSelector({
    label = "",
    value = [],
    onChange,
    searchType = "product",
    detailedView = false,
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    /* ----------------------------------
     * ENDPOINT MAP
    ----------------------------------- */
    const endpointMap = {
        product: "wc/v3/products",
        category: "wc/v3/products/categories",
        tag: "wc/v3/products/tags",
    };

    const endpoint = endpointMap[searchType];

    /* ----------------------------------
     * ✅ NORMALIZER (FULL PRODUCT DATA)
    ----------------------------------- */
    const normalizeProduct = (product) => ({
        id: product.id,
        name:
            product.type === "variable"
                ? `${product.name} (Variable)`
                : product.name,
        price_html: product.price_html,
        image: product.images?.[0]?.src || "",
        type: product.type,
        link: product.permalink, 
    });

    const normalizerMap = {
        product: normalizeProduct,
        category: (item) => ({ id: item.id, name: item.name }),
        tag: (item) => ({ id: item.id, name: item.name }),
    };

    const normalize = normalizerMap[searchType] || ((x) => x);

    /* ----------------------------------
     * ✅ ADD ITEM
    ----------------------------------- */
    const addItem = (item) => {
        if (!value.some((v) => v.id === item.id)) {
            onChange([...value, item]);
        }
        setQuery("");
        setResults([]);
    };

    /* ----------------------------------
     * ✅ REMOVE ITEM
    ----------------------------------- */
    const removeItem = (id) => {
        onChange(value.filter((x) => x.id !== id));
    };

    /* ----------------------------------
     * ✅ FETCH PRODUCTS + VARIATIONS
    ----------------------------------- */
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
                /* ✅ MAIN PRODUCT SEARCH */
                const res = await apiFetch({
                    path: `${endpoint}?search=${encodeURIComponent(query)}&per_page=50`,
                    signal: controller.signal,
                });

                let formatted = res.map(normalize);

                /* ✅ FETCH VARIATIONS FOR VARIABLE PRODUCTS */
                for (const product of res) {
                    if (product.type === "variable") {
                        try {
                            const variations = await apiFetch({
                                path: `wc/v3/products/${product.id}/variations?per_page=50`,
                                signal: controller.signal,
                            });

                            variations.forEach((v) => {
                                formatted.push({
                                    id: v.id,
                                    name: `${product.name} – ${v.attributes
                                        .map((a) => a.option)
                                        .join(", ")}`,
                                    price_html: v.price_html || product.price_html,
                                    image:
                                        v.image?.src ||
                                        product.images?.[0]?.src ||
                                        "",
                                    type: "variation",
                                    link: product.permalink,
                                });
                            });
                        } catch (err) {
                            // ✅ safely ignore
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

    /* ----------------------------------
     * ✅ UI RENDER
    ----------------------------------- */
    return (
        <div className="s1-field-wrapper multi-search-selector">

            {label && <label className="s1-field-label">{label}</label>}

            <div className="s1-field-control">

                {/* ✅ SELECTED ITEMS */}
                <div className="selected-items">
                    {value.map((item) =>
                        detailedView ? (
                            <div key={item.id} className="s1-selected-row">
                                <div className="s1-product-left">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            className="s1-product-thumb"
                                            alt=""
                                        />
                                    )}

                                    <div className="s1-product-meta">
                                        <div className="s1-product-title">
                                            {item.name}
                                        </div>

                                        {item.price_html && (
                                            <div
                                                className="s1-product-price"
                                                dangerouslySetInnerHTML={{
                                                    __html: item.price_html,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="s1-product-right">
                                    {/* <span className="s1-product-type">
                                        {item.type} #{item.id}
                                    </span> */}

                                    <a
                                        href={item.link}
                                        className="s1-product-type"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                       {item.type} #{item.id}
                                    </a>

                                    <span
                                        className="remove-chip"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        ×
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <span key={item.id} className="selector-chip">
                                {item.name}
                                <span
                                    className="remove-chip"
                                    onClick={() => removeItem(item.id)}
                                >
                                    ×
                                </span>
                            </span>
                        )
                    )}
                </div>

                {/* ✅ SEARCH INPUT WITH LEFT ICON + RIGHT MODULE LOADER */}
                <div className={`s1-search-input-wrap ${detailedView ? 'has-search-icon' : ''}`}>

                    {/* ✅ LEFT SEARCH ICON (hide during loading) */}
                    {detailedView && (
                        <span className="s1-search-icon">
                            <MagnifyingGlassIcon width={18} height={18} />
                        </span>
                    )}

                    <TextControl
                        placeholder={
                            loading
                                ? __('Searching…', 'store-one')
                                : __('Search products…', 'store-one')
                        }
                        value={query}
                        onChange={setQuery}
                    />

                    {/* ✅ RIGHT SIDE MODULE LOADER */}
                    {loading && (
                        <span className="s1-input-loader s1-loader">
                            <span className="components-spinner"></span>
                        </span>
                    )}

                </div>

                {/* ✅ DROPDOWN RESULTS */}
                {query.length > 0 && results.length > 0 && (
                    <div className="selector-dropdown">
                        {results.map((r) =>
                            detailedView ? (
                                <div
                                    key={r.id}
                                    className="s1-product-row"
                                    onClick={() => addItem(r)}
                                >
                                    <div className="s1-product-left">
                                        {r.image && (
                                            <img
                                                src={r.image}
                                                className="s1-product-thumb"
                                                alt=""
                                            />
                                        )}

                                        <div className="s1-product-meta">
                                            <div className="s1-product-title">
                                                {r.name}
                                            </div>

                                            {r.price_html && (
                                                <div
                                                    className="s1-product-price"
                                                    dangerouslySetInnerHTML={{
                                                        __html: r.price_html,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <span className="s1-product-type">
                                        {r.type}
                                    </span>
                                </div>
                            ) : (
                                <div
                                    key={r.id}
                                    className="selector-option"
                                    onClick={() => addItem(r)}
                                >
                                    {r.name}
                                </div>
                            )
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
