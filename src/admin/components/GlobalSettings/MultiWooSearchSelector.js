import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function MultiWooSearchSelector({
    label = "",
    value = [],
    onChange,
    searchType = "product", // product | category | tag
}) {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const endpoint = {
        product: 'wc/v3/products',
        category: 'wc/v3/products/categories',
        tag: 'wc/v3/products/tags',
    }[searchType];

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);

        apiFetch({
            path: `${endpoint}?search=${query}`,
        })
            .then((items) => setResults(items))
            .catch(() => setResults([]))
            .finally(() => setLoading(false));

    }, [query]);

    const addItem = (item) => {
        if (value.find(v => v.id === item.id)) return;
        onChange([...value, item]);
        setQuery("");
        setResults([]);
    };

    const removeItem = (id) => {
        onChange(value.filter(item => item.id !== id));
    };

    return (
        <div className="multi-search-selector s1-field-control">

            {label && <label className="s1-field-label">{label}</label>}

            {/* Selected Items */}
            <div className="selected-items">
                {value.map(item => (
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
                placeholder={__('Search…', 'store-one')}
                value={query}
                onChange={setQuery}
            />

            {/* Search Dropdown */}
            {query.length >= 2 && results.length > 0 && (
                <div className="selector-dropdown">
                    {results.map(item => (
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
