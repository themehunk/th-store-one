import './live-style.css';
import { __ } from '@wordpress/i18n';

const PreviewSaleNotification = ({ settings = {} }) => {

    const style = settings?.noti_style || 'style1';

    const changeStyle = (value) => {
        window.dispatchEvent(
            new CustomEvent('storeone:changeNotifyStyle', {
                detail: { style: value }
            })
        );
    };

    const dynamicStyle = {
    background: settings?.noti_bg_clr || "#fff",

    color: settings?.noti_text_clr || "#1e1e1e",

    padding: `
      ${settings?.noti_padding?.top || "15px"}
      ${settings?.noti_padding?.right || "15px"}
      ${settings?.noti_padding?.bottom || "15px"}
      ${settings?.noti_padding?.left || "15px"}
    `,

    borderStyle: settings?.noti_border?.style || "solid",

    borderColor: settings?.noti_border?.color || "#e5e7eb",

    borderWidth: `
      ${settings?.noti_border?.width?.top || "1px"}
      ${settings?.noti_border?.width?.right || "1px"}
      ${settings?.noti_border?.width?.bottom || "1px"}
      ${settings?.noti_border?.width?.left || "1px"}
    `,

    borderRadius: `
      ${settings?.noti_border?.radius?.top || "10px"}
      ${settings?.noti_border?.radius?.right || "10px"}
      ${settings?.noti_border?.radius?.bottom || "10px"}
      ${settings?.noti_border?.radius?.left || "10px"}
    `,
  };

    return (
        <div className="s1-ntf-preview-wrap">

            <div className="s1-style-tabs">
  {[
    { id: "style1", label: "Classic" },
    { id: "style2", label: "Modern" },
    { id: "style3", label: "Minimal" },
    { id: "style4", label: "Elegant" },
  ].map((s) => (
    <div
      key={s.id}
      className={`s1-style-tab ${style === s.id ? "active" : ""}`}
      onClick={() => changeStyle(s.id)}
    >
      <div className="s1-style-preview-box">{s.label}</div>
    </div>
  ))}
</div>
   <div className="s1-preview-area">
    <div className={`s1-sale-popup ${style}`} style={dynamicStyle}>
        <span className="s1-close-btn" style={{ color: settings?.noti_text_clr || "#1e1e1e" }}>×</span>
    <img
    src={
        th_StoreOneAdmin.homeUrl +
        "wp-content/plugins/th-store-one/assets/images/prd1.png"
    }
    className="s1-sale-img"
    />

    <div className="s1-sale-content">
      <strong style={{ color: settings?.noti_title_clr || "#111" }}>{__('Amit from Bangalore','th-store-one')}</strong>
      <p style={{ color: settings?.noti_text_clr || "#1e1e1e" }}>{__('purchased Sony WH-1000XM5','th-store-one')}</p>
      <span style={{ color: settings?.noti_text_clr || "#1e1e1e" }}>{__('1 Week ago','th-store-one')}</span>
    </div>

  </div>
</div> 
        </div>
    );
};

export default PreviewSaleNotification;