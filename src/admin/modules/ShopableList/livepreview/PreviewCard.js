import { useEffect, useRef, useState } from "@wordpress/element";

export const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const MuteIcon = ({ muted }) =>
  muted ? (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M14 5L9 9H5V15H9L14 19V5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H3V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" />
      <path d="M15 9C16.2 10.2 16.2 13.8 15 15" stroke="currentColor" strokeWidth="2" />
      <path d="M18 7C20.5 9.5 20.5 14.5 18 17" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

const Chevron = ({ up }) => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d={up ? "M6 15L12 9L18 15" : "M6 9L12 15L18 9"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * One shoppable card of the live preview.
 * variant "style1": product bar floats on the video, border on the card.
 * variant "style2": product bar sits below the video, border on the video.
 */
const PreviewCard = ({
  variant,
  s,
  item,
  product,
  isActive,
  isPlaying,
  progress,
  showProgress,
  canPrev,
  canNext,
  onToggle,
  onOpenPopup,
  onJump,
  videoRef,
  formatPrice,
}) => {
  const [muted, setMuted] = useState(!!s?.video_mute);
  const localVideo = useRef(null);

  useEffect(() => setMuted(!!s?.video_mute), [s?.video_mute]);

  // React does not keep the `muted` property in sync, so set it directly.
  useEffect(() => {
    if (localVideo.current) localVideo.current.muted = muted;
  }, [muted, item?.video]);

  const setVideoRef = (el) => {
    localVideo.current = el;
    videoRef(el);
  };

  const position = s?.product_info_position || "bottom";

  const borderStyle = {
    borderStyle: s?.border?.style || "solid",
    borderColor: s?.border?.color || "transparent",

    borderTopWidth: s?.border?.width?.top || "0px",
    borderRightWidth: s?.border?.width?.right || "0px",
    borderBottomWidth: s?.border?.width?.bottom || "0px",
    borderLeftWidth: s?.border?.width?.left || "0px",

    borderTopLeftRadius: s?.border?.radius?.top || "0px",
    borderTopRightRadius: s?.border?.radius?.right || "0px",
    borderBottomRightRadius: s?.border?.radius?.bottom || "0px",
    borderBottomLeftRadius: s?.border?.radius?.left || "0px",

    overflow: "hidden",
  };

  // Same as the frontend: with the popup on, a click opens it.
  const handleClick = () =>
    s?.show_prd_popup ? onOpenPopup() : onToggle();

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  const productBar = (
    <div
      className="s1-shopable-product-bar"
      style={{
        borderRadius: s?.prd_cart_border_radius || "10px",
        background: s?.bg_color || "#fff",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="s1-shopable-product-left">
        {product?.image ? (
          <img className="s1-sv-thumb" src={product.image} alt="" />
        ) : (
          <div className="s1-skeleton s1-sv-thumb"></div>
        )}

        <div className="s1-shopable-product-content">
          <div
            className="s1-sv-title"
            style={{ color: s?.prd_title_color || "#111" }}
          >
            {product?.title || "Title"}
          </div>

          {product?.price ? (
            <div
              className="s1-sv-price"
              style={{ color: s?.prd_price_color || "#111" }}
              dangerouslySetInnerHTML={{ __html: product.price }}
            />
          ) : (
            <div
              className="s1-sv-price"
              style={{ color: s?.prd_price_color || "#111" }}
            >
              {formatPrice(299)}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="s1-cart-button s1-sv-cart"
        style={{
          background: s?.prd_cart_bg_color || "#22c55e",
          color: s?.prd_cart_icon_color || "#fff",
        }}
      >
        <CartIcon />
      </button>
    </div>
  );

  const media = (
    <div
      className={`s1-shopable-media s1-product-info-${position}`}
      style={variant === "style2" ? borderStyle : undefined}
      onClick={handleClick}
    >
      {item?.video ? (
        <video
          ref={setVideoRef}
          className="s1-shopable-video"
          src={item.video}
          playsInline
          preload="metadata"
          style={{ objectFit: "cover", display: "block" }}
        />
      ) : (
        <div className="s1-skeleton s1-shopable-video"></div>
      )}

      {showProgress && isActive && (
        <div className={`s1-sv-progress s1-sv-progress-${position}`}>
          <span
            style={{
              width: `${progress}%`,
              background: s?.bar_color || "#22c55e",
            }}
          ></span>
        </div>
      )}

      {item?.video && (
        <button
          type="button"
          className={`s1-sv-mute s1-sv-mute-${position}`}
          onClick={stop(() => setMuted((m) => !m))}
        >
          <MuteIcon muted={muted} />
        </button>
      )}

      {!isPlaying && (
        <div
          className="s1-video-play-icon"
          style={{
            background: s?.vicon_bg_color || "#000",
            color: s?.vicon_color || "#fff",
          }}
        >
          ▶
        </div>
      )}

      {/* Frontend shows these arrows when "Hide Inherit Navigation" is on. */}
      {s?.hide_navigation === true && (
        <div className="s1-sv-nav">
          <button
            type="button"
            disabled={!canPrev}
            onClick={stop(() => onJump(-1))}
          >
            <Chevron up />
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={stop(() => onJump(1))}
          >
            <Chevron />
          </button>
        </div>
      )}

      {variant !== "style2" && productBar}
    </div>
  );

  return (
    <div
      className="s1-shopable-card s1-sv-card"
      style={variant === "style2" ? undefined : borderStyle}
    >
      {media}
      {variant === "style2" && productBar}
    </div>
  );
};

export default PreviewCard;
