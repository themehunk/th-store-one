import { useEffect, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

/**
 * Preview of the "Product Info Showing in Popup" option.
 * Like the frontend, videos of every card are grouped (card + video) and
 * the popup starts on the clicked card; a video with several products shows
 * a list first.
 */
const PreviewPopup = ({ cards, startCard, getProduct, formatPrice, onClose }) => {
  const groups = [];
  let startGroup = 0;

  cards.forEach((items, cardIdx) => {
    items.forEach((item) => {
      const last = groups[groups.length - 1];
      if (last && last.card === cardIdx && last.video === item.video) {
        if (item.productId) last.productIds.push(item.productId);
        return;
      }
      if (cardIdx === startCard && !groups.some((g) => g.card === cardIdx)) {
        startGroup = groups.length;
      }
      groups.push({
        card: cardIdx,
        video: item.video,
        productIds: item.productId ? [item.productId] : [],
      });
    });
  });

  const [groupIdx, setGroupIdx] = useState(startGroup);
  const [detail, setDetail] = useState(null);

  const group = groups[groupIdx] || { productIds: [] };
  const single = group.productIds.length <= 1;
  const shownId = single ? group.productIds[0] : detail;

  useEffect(() => setDetail(null), [groupIdx]);

  const go = (dir) =>
    setGroupIdx((i) => Math.min(Math.max(i + dir, 0), groups.length - 1));

  const renderDetail = (id) => {
    const p = getProduct(id);
    return (
      <div className="s1-sv-popup-detail">
        {!single && (
          <button
            type="button"
            className="s1-sv-popup-back"
            onClick={() => setDetail(null)}
          >
            ← {__("Back to List", "th-store-one")}
          </button>
        )}
        <div className="s1-sv-popup-image">
          {p?.image ? (
            <img src={p.image} alt="" />
          ) : (
            <div className="s1-skeleton"></div>
          )}
        </div>
        <h3 className="s1-sv-popup-title">{p?.title || "Title"}</h3>
        {p?.price ? (
          <div
            className="s1-sv-popup-price"
            dangerouslySetInnerHTML={{ __html: p.price }}
          />
        ) : (
          <div className="s1-sv-popup-price">{formatPrice(299)}</div>
        )}
        <div className="s1-sv-popup-qty">
          <span>{__("Quantity", "th-store-one")}</span>
          <div>
            <button type="button">−</button>
            <b>1</b>
            <button type="button">+</button>
          </div>
        </div>
        {p?.desc && (
          <div
            className="s1-sv-popup-desc"
            dangerouslySetInnerHTML={{ __html: p.desc }}
          />
        )}
        <div className="s1-sv-popup-actions">
          <button type="button">{__("More Info", "th-store-one")}</button>
          <button type="button" className="is-primary">
            {__("Add To Cart", "th-store-one")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="s1-sv-popup" onClick={onClose}>
      <button type="button" className="s1-sv-popup-close" onClick={onClose}>
        &times;
      </button>

      <div className="s1-sv-popup-main" onClick={(e) => e.stopPropagation()}>
        <div className="s1-sv-popup-video">
          {group.video ? (
            <video
              key={group.video + groupIdx}
              src={group.video}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div className="s1-skeleton"></div>
          )}
          <div className="s1-sv-popup-nav">
            <button
              type="button"
              disabled={groupIdx === 0}
              onClick={() => go(-1)}
            >
              ▲
            </button>
            <button
              type="button"
              disabled={groupIdx >= groups.length - 1}
              onClick={() => go(1)}
            >
              ▼
            </button>
          </div>
        </div>

        <div className="s1-sv-popup-panel">
          {shownId ? (
            renderDetail(shownId)
          ) : group.productIds.length ? (
            <div className="s1-sv-popup-list">
              <p>
                <strong>{__("Select Product", "th-store-one")}</strong>
              </p>
              {group.productIds.map((id) => {
                const p = getProduct(id);
                return (
                  <button
                    type="button"
                    key={id}
                    className="s1-sv-popup-list-item"
                    onClick={() => setDetail(id)}
                  >
                    {p?.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <span className="s1-skeleton"></span>
                    )}
                    <span className="s1-sv-popup-list-text">
                      <span>{p?.title || "Title"}</span>
                      {p?.price && (
                        <span dangerouslySetInnerHTML={{ __html: p.price }} />
                      )}
                    </span>
                    <span className="s1-sv-popup-plus">+</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="s1-sv-popup-empty">
              {__("Add products to this video to see them here.", "th-store-one")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPopup;
