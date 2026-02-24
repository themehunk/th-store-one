import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function MultiWooSearchSelector({
    label = "",
    value = [],          // 👈 ONLY IDs [1,2,3]
    onChange,            // 👈 save ONLY IDs
    searchType = "product",
    detailedView = false,
}) {

    /* -------------------- STATE -------------------- */
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // UI ke liye full objects
    const [selectedItems, setSelectedItems] = useState([]);

    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    /* -------------------- ENDPOINT -------------------- */
    const endpointMap = {
        product: "wc/v3/products",
        category: "wc/v3/products/categories",
        tag: "wc/v3/products/tags",
         page: "wp/v2/pages",
    };

    const endpoint = endpointMap[searchType];

    /* -------------------- NORMALIZERS -------------------- */
    const normalizeProduct = (p) => ({
        id: p.id,
        name: p.type === "variable" ? `${p.name}` : p.name,
        price_html: p.price_html,
        image: p.images?.[0]?.src || "",
        type: p.type,
        link: p.permalink,
        stock_status: p.stock_status,          
        in_stock: p.stock_status === "Instock",
    });

    const normalizerMap = {
        product: normalizeProduct,
        category: (c) => ({
            id: c.id,
            name: c.name,
            type: "category",
        }),
        tag: (t) => ({
            id: t.id,
            name: t.name,
            type: "tag",
        }),
        page: (p) => ({
        id: p.id,
        name: p.title?.rendered || "",
        image: "",   
        type: "page",
        link: p.link,
        stock_status: "",
    }),
    };

    const normalize = normalizerMap[searchType];

    /* -------------------- ADD / REMOVE -------------------- */
    const addItem = (item) => {
        if (selectedItems.some((i) => i.id === item.id)) return;

        const newItems = [...selectedItems, item];
        setSelectedItems(newItems);

        // ONLY IDS SAVE
        onChange(newItems.map((i) => i.id));

        setQuery("");
        setResults([]);
        setIsFocused(false);
    };

    const removeItem = (id) => {
        const newItems = selectedItems.filter((i) => i.id !== id);
        setSelectedItems(newItems);

        // ONLY IDS SAVE
        onChange(newItems.map((i) => i.id));
    };

    /* -------------------- DEFAULT FETCH -------------------- */
    const fetchDefaultItems = async () => {
        if (!endpoint) return;

        setLoading(true);

        try {
            const path =
                searchType === "product"
        ? `${endpoint}?per_page=5&orderby=date&order=desc`
        : searchType === "page"
        ? `${endpoint}?per_page=5&orderby=date&order=desc`
        : `${endpoint}?per_page=5&orderby=name&order=asc&hide_empty=true`;

            const res = await apiFetch({ path });
            setResults(res.map(normalize));
        } catch (e) {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    /* -------------------- SEARCH -------------------- */
    const buildSearchPath = (q) => {
        if (searchType === "product") {
            return `${endpoint}?search=${encodeURIComponent(q)}&per_page=20`;
        }
        if (searchType === "page") {
        return `${endpoint}?search=${encodeURIComponent(q)}&per_page=20`;
        }
        return `${endpoint}?search=${encodeURIComponent(q)}&per_page=20&hide_empty=true`;
    };

    useEffect(() => {
        if (!query.trim()) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);

            try {
                const res = await apiFetch({
                    path: buildSearchPath(query),
                    signal: controller.signal,
                });

                let formatted = res.map(normalize);

                // VARIATIONS SUPPORT (unchanged)
                if (searchType === "product") {
                    for (const product of res) {
                        if (product.type === "variable") {
                            const variations = await apiFetch({
                                path: `wc/v3/products/${product.id}/variations?per_page=10`,
                                signal: controller.signal,
                            });

                            variations.forEach((v) => {
                                formatted.push({
                                    id: v.id,
                                    name: `${product.name} – ${v.attributes.map(a => a.option).join(", ")}`,
                                    price_html: v.price_html || product.price_html,
                                    image: v.image?.src || product.images?.[0]?.src || "",
                                    type: "variation",
                                    link: product.permalink,
                                });
                            });
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
    }, [query]);

    const getPlaceholderText = () => {
        if (loading) {
            return __('Searching…', 'store-one');
        }

        switch (searchType) {
            case 'product':
                return __('Search products…', 'store-one');
            case 'page':
                 return __('Search pages…', 'store-one');
            case 'category':
                return __('Search categories…', 'store-one');
            case 'tag':
                return __('Search tags…', 'store-one');
            default:
                return __('Search…', 'store-one');
        }
    };

    /* -------------------- SYNC VALUE → UI (FIX) -------------------- */
    useEffect(() => {
    if (!endpoint) return;
    if (!Array.isArray(value)) return;

    // No IDs → clear UI
    if (value.length === 0) {
        setSelectedItems([]);
        return;
    }

    let isMounted = true;

    const fetchSelectedItems = async () => {
        try {
            // Woo allows include=1,2,3
            const res = await apiFetch({
                path: `${endpoint}?include=${value.join(",")}&per_page=100`,
            });

            if (!isMounted) return;

            const normalized = res.map(normalize);

            // 🔒 Maintain same order as saved IDs
            const ordered = value
                .map(id => normalized.find(p => p.id === id))
                .filter(Boolean);

            setSelectedItems(ordered);
        } catch (e) {
            console.error("MultiWooSearchSelector sync error", e);
        }
    };

    fetchSelectedItems();

    return () => {
        isMounted = false;
    };
}, [value, endpoint, searchType]);


    /* -------------------- UI -------------------- */
    return (
        <div className="s1-field-wrapper multi-search-selector">

            {label && <label className="s1-field-label">{label}</label>}

            <div className="s1-field-control">

                {/* SELECTED ITEMS (UI SAME AS BEFORE) */}
                <div className="selected-items">
                    {selectedItems.map((item) => (
                        <div key={item.id} className="s1-selected-row">
                            <div className="s1-product-left">
                                {item.image && <img src={item.image} className="s1-product-thumb" alt="" />}
                                <div className="s1-product-title">{item.name}</div>
                            </div>
                             <div className="s1-product-meta">
                                    
                                    {item.price_html && (
                                        <div
                                            className="s1-product-price"
                                            dangerouslySetInnerHTML={{ __html: item.price_html }}
                                        />
                                    )}
                                </div>
                            <div className={`s1-product-stock ${item.stock_status}`}>{item.stock_status}</div>

                            <div className="s1-product-right">
                                <span className="s1-product-type">{item.type}</span>
                                <span className="s1-product-type i_id">#{item.id}</span>
    
                            </div>
                           <span className="remove-chip" onClick={() => removeItem(item.id)}>×</span>

                        </div>
                    ))}
                </div>

                {/* SEARCH INPUT */}
                <div className={`s1-search-input-wrap ${detailedView ? "has-search-icon" : ""}`}>

                    {detailedView && (
                        <span className="s1-search-icon">
                            <MagnifyingGlassIcon width={18} height={18} />
                        </span>
                    )}

                    <TextControl
                        value={query}
                       placeholder={getPlaceholderText()}
                        onChange={setQuery}
                        onFocus={() => {
                            setIsFocused(true);
                            if (!query) fetchDefaultItems();
                        }}
                        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                    />

                    {loading && (
                        <span className="s1-input-loader s1-loader">
                            <span className="components-spinner"></span>
                        </span>
                    )}
                </div>

                {/* DROPDOWN */}
                {(isFocused || query) && results.length > 0 && (
                    <div className="selector-dropdown">
                        {results.map((r) => (
                            <div
                                key={r.id}
                                className="s1-product-row"
                                onClick={() => addItem(r)}
                            >
                                <div className="s1-product-left">
                                    {r.image && <img src={r.image} className="s1-product-thumb" alt="" />}
                                    <div className="s1-product-meta">
                                        <div className="s1-product-title">{r.name}</div>
                                        {r.price_html && (
                                            <div
                                                className="s1-product-price"
                                                dangerouslySetInnerHTML={{ __html: r.price_html }}
                                            />
                                        )}
                                        <div className={`s1-product-stock ${r.stock_status}`}>{r.stock_status} </div>
                                    </div>
                                </div>
                                <span className="s1-product-type">{r.type}</span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
