import { useState } from "@wordpress/element";
import { ICONS } from "@th-storeone-global/icons";
import { TrashIcon,MagnifyingGlassIcon } from "@radix-ui/react-icons";

const BASE = `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/trustbadges/`;

const PRESET_IMAGES = [

  /* ================= PAYMENT ================= */
  { url: BASE + "visa.svg", name: "visa", category: "payment" },
  { url: BASE + "mastercard.svg", name: "mastercard", category: "payment" },
  { url: BASE + "discover.svg", name: "discover", category: "payment" },
  { url: BASE + "upi.svg", name: "upi", category: "payment" },
  { url: BASE + "phonepe.svg", name: "phonepe", category: "payment" },
  { url: BASE + "bhim.svg", name: "bhim", category: "payment" },
  { url: BASE + "razorpay.svg", name: "razorpay", category: "payment" },
  { url: BASE + "cashfree-payments.svg", name: "cashfree", category: "payment" },
  { url: BASE + "braintree.svg", name: "braintree", category: "payment" },
  { url: BASE + "authorize.svg", name: "authorize", category: "payment" },
  { url: BASE + "worldline.svg", name: "worldline", category: "payment" },
  { url: BASE + "adyen.svg", name: "adyen", category: "payment" },
  { url: BASE + "mollie.svg", name: "mollie", category: "payment" },
  { url: BASE + "shopify.svg", name: "shopify payments", category: "payment" },
  { url: BASE + "citi.svg", name: "citi bank", category: "payment" },
  { url: BASE + "standard-chartered.svg", name: "standard chartered", category: "payment" },

  /* ================= SECURITY ================= */
  { url: BASE + "secure.svg", name: "secure checkout", category: "security" },
  { url: BASE + "verifiy.svg", name: "verified", category: "security" },
  { url: BASE + "premium-quality-v2.svg", name: "premium quality", category: "security" },
  { url: BASE + "100-guarantee.svg", name: "100% guarantee", category: "security" },

  /* ================= DELIVERY ================= */
  { url: BASE + "fast-delivery.svg", name: "fast delivery", category: "delivery" },
  { url: BASE + "free-delivery.svg", name: "free delivery", category: "delivery" },
  { url: BASE + "delivery.svg", name: "delivery", category: "delivery" },
  { url: BASE + "delivery-time.svg", name: "delivery time", category: "delivery" },

  /* ================= RETURNS ================= */
  { url: BASE + "30-day-retuen.svg", name: "30 day return", category: "return" },
  { url: BASE + "30-days.svg", name: "30 days return", category: "return" },
  { url: BASE + "60-day-return.svg", name: "60 day return", category: "return" },
  { url: BASE + "return.svg", name: "easy return", category: "return" },

];

const TABS = [
    { label: "All", value: "all" },
    { label: "Payment", value: "payment" },
    { label: "Security", value: "security" },
    { label: "Delivery", value: "delivery" },
];

const PresetImageSelector = ({ value, onChange }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const filtered = PRESET_IMAGES.filter((img) => {
        const matchSearch = img.name.toLowerCase().includes(search.toLowerCase());
        const matchTab = activeTab === "all" || img.category === activeTab;
        return matchSearch && matchTab;
    });
const [isSearching, setIsSearching] = useState(false);
const handleSearch = (value) => {
    setSearch(value);
    setIsSearching(true);

    setTimeout(() => {
        setIsSearching(false);
    }, 300); // smooth feel
};
    return (
        <>
            {/* CARD */}
            <div className="s1-preset-wrapper">
                {value ? (
                    <div className="s1-preset-card s1-image-card">
                        <div className="s1-preset-preview s1-image-preview">
                            <img src={value} alt="" />
                        </div>

                        <div className="s1-preset-actions s1-image-actions">
                            <button className="s1-btn s1-btn-edit" onClick={() => setIsOpen(true)}>
                                <span className="s1-btn-icon">{ICONS.SETTINGS}</span>
                                Change
                            </button>

                            <button className="s1-btn s1-btn-remove" onClick={() => onChange("")}>
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="s1-preset-upload" onClick={() => setIsOpen(true)}>
                        <div className="s1-preset-plus">+</div>
                        <div className="s1-preset-text">
                            <strong>Choose Trust Badges</strong>
                            <p>Select from predefined images</p>
                        </div>
                    </button>
                )}
            </div>

            {/* MODAL */}
            {isOpen && (
                <div className="s1-preset-modal-overlay">
                    <div className="s1-preset-modal">

                        {/* HEADER */}
                        <div className="s1-preset-header">
                            <h3>Choose Trust Badge</h3>
                            <button onClick={() => setIsOpen(false)}>✕</button>
                        </div>

                        {/* SEARCH */}
                        <div className="s1-preset-search">
                            <input
                                type="text"
                                placeholder="Search badges..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <span className="s1-preset-search-icon">
                            <MagnifyingGlassIcon />
                         </span>
                         {isSearching && (
                              <span className="s1-preset-search-loader">
                                   <span className="s1-spinner-small"></span>
                              </span>
                         )}
                        </div>

                        {/* TABS */}
                        <div className="s1-preset-tabs">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    className={`s1-tab ${activeTab === tab.value ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.value)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* GRID */}
                        <div className="s1-preset-grid">
                            {filtered.map((img, i) => (
                                <div
                                    key={i}
                                    className={`s1-preset-item ${value === img.url ? "active" : ""}`}
                                    onClick={() => {
                                        onChange(img.url);
                                        setIsOpen(false);
                                    }}
                                >
                                    <img src={img.url} alt={img.name} />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default PresetImageSelector;