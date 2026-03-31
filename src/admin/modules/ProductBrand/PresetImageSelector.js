import { useState } from "@wordpress/element";
import { ICONS } from "@th-storeone-global/icons";
import { TrashIcon,MagnifyingGlassIcon } from "@radix-ui/react-icons";

const BASE = `${th_StoreOneAdmin.homeUrl}wp-content/plugins/th-store-one/assets/images/trustbadges/`;



const PRESET_IMAGES = [

/* ================= PAYMENT ================= */
{ url: BASE+"visa.svg", name:"visa", category:"payment"},
{ url: BASE+"mastercard.svg", name:"mastercard", category:"payment"},
{ url: BASE+"american-express.svg", name:"american express", category:"payment"},
{ url: BASE+"discover.svg", name:"discover", category:"payment"},
{ url: BASE+"union-pay.svg", name:"union pay", category:"payment"},
{ url: BASE+"cirrus.svg", name:"cirrus", category:"payment"},
{ url: BASE+"jcb.svg", name:"jcb", category:"payment"},
{ url: BASE+"paypal.svg", name:"paypal", category:"payment"},
{ url: BASE+"stripe.svg", name:"stripe", category:"payment"},
{ url: BASE+"square.svg", name:"square", category:"payment"},
{ url: BASE+"skrill.svg", name:"skrill", category:"payment"},
{ url: BASE+"braintree.svg", name:"braintree", category:"payment"},
{ url: BASE+"authorize.svg", name:"authorize", category:"payment"},
{ url: BASE+"worldpay.svg", name:"worldpay", category:"payment"},
{ url: BASE+"worldline.svg", name:"worldline", category:"payment"},
{ url: BASE+"adyen.svg", name:"adyen", category:"payment"},
{ url: BASE+"mollie.svg", name:"mollie", category:"payment"},
{ url: BASE+"klarna.svg", name:"klarna", category:"payment"},
{ url: BASE+"ideal.svg", name:"ideal", category:"payment"},
{ url: BASE+"payoneer.svg", name:"payoneer", category:"payment"},
{ url: BASE+"cashfree-payments.svg", name:"cashfree", category:"payment"},
{ url: BASE+"razorpay.svg", name:"razorpay", category:"payment"},
{ url: BASE+"payu.svg", name:"payu", category:"payment"},
{ url: BASE+"paytm.svg", name:"paytm", category:"payment"},
{ url: BASE+"upi.svg", name:"upi", category:"payment"},
{ url: BASE+"phonepe.svg", name:"phonepe", category:"payment"},
{ url: BASE+"bhim.svg", name:"bhim", category:"payment"},
{ url: BASE+"google-pay.svg", name:"google pay", category:"payment"},
{ url: BASE+"apple-pay.svg", name:"apple pay", category:"payment"},
{ url: BASE+"amazon-pay.svg", name:"amazon pay", category:"payment"},
{ url: BASE+"alipay.svg", name:"alipay", category:"payment"},
{ url: BASE+"wechat-pay.svg", name:"wechat pay", category:"payment"},
{ url: BASE+"zelle.svg", name:"zelle", category:"payment"},

/* ================= SECURITY ================= */
{ url: BASE+"secure.svg", name:"secure checkout", category:"security"},
{ url: BASE+"secure-payment.svg", name:"secure payment", category:"security"},
{ url: BASE+"secure-card.svg", name:"secure card", category:"security"},
{ url: BASE+"secure-hand.svg", name:"secure hand", category:"security"},
{ url: BASE+"trust.svg", name:"trusted", category:"security"},
{ url: BASE+"verifiy.svg", name:"verified", category:"security"},
{ url: BASE+"guarantee-seal.svg", name:"guarantee seal", category:"security"},
{ url: BASE+"100-guarantee.svg", name:"100% guarantee", category:"security"},
{ url: BASE+"premium-quality.svg", name:"premium quality", category:"security"},
{ url: BASE+"premium-quality-v2.svg", name:"premium quality", category:"security"},
{ url: BASE+"satisfaction.svg", name:"satisfaction guarantee", category:"security"},
{ url: BASE+"check.svg", name:"verified check", category:"security"},
{ url: BASE+"rating.svg", name:"top rated", category:"security"},

/* ================= DELIVERY ================= */
{ url: BASE+"delivery.svg", name:"delivery", category:"delivery"},
{ url: BASE+"fast-delivery.svg", name:"fast delivery", category:"delivery"},
{ url: BASE+"free-delivery.svg", name:"free delivery", category:"delivery"},
{ url: BASE+"delivery-time.svg", name:"delivery time", category:"delivery"},
{ url: BASE+"aramex.svg", name:"aramex shipping", category:"delivery"},
{ url: BASE+"boxs.svg", name:"package delivery", category:"delivery"},

/* ================= RETURNS ================= */
{ url: BASE+"return.svg", name:"easy return", category:"return"},
{ url: BASE+"30-day-retuen.svg", name:"30 day return", category:"return"},
{ url: BASE+"30-days.svg", name:"30 days return", category:"return"},
{ url: BASE+"60-day-return.svg", name:"60 day return", category:"return"},
{ url: BASE+"60-days.svg", name:"60 days return", category:"return"},
{ url: BASE+"7-day-return.svg", name:"7 day return", category:"return"},
{ url: BASE+"90-day-retuen.svg", name:"90 day return", category:"return"},

/* ================= EXTRA ================= */
{ url: BASE+"eco-friendly.svg", name:"eco friendly", category:"extra"},
{ url: BASE+"value.svg", name:"best value", category:"extra"},
{ url: BASE+"free.svg", name:"free offer", category:"extra"},
];

const TABS = [
    { label: "All", value: "all" },
    { label: "Payment", value: "payment" },
    { label: "Security", value: "security" },
    { label: "Delivery", value: "delivery" },
    { label: "Extra", value: "extra" }
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
                               onChange={(e) => handleSearch(e.target.value)}
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