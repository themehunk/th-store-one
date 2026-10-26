import apiFetch from "@wordpress/api-fetch";
import { useEffect, useRef, useState } from "@wordpress/element";

/* ===================================================
   CARDS - same rotation the frontend builds per list:
   one entry for every product of every item that has a video
 =================================================== */
const toId = (p) => Number(typeof p === "object" ? p?.value ?? p?.id : p) || 0;

export const buildCards = (s, columns) => {
  const lists = (s?.shopable_list || []).filter((list) => list?.items?.length);

  if (!lists.length) {
    return Array.from({ length: columns }, () => [{ video: "", productId: 0 }]);
  }

  return lists.map((list) => {
    const rotation = [];

    list.items.forEach((item) => {
      if (!item?.video_url) return;
      (item.products || []).forEach((p) => {
        const productId = toId(p);
        if (productId) rotation.push({ video: item.video_url, productId });
      });
    });

    if (!rotation.length) {
      const video = list.items.find((item) => item?.video_url)?.video_url;
      rotation.push({ video: video || "", productId: 0 });
    }

    return rotation;
  });
};

/* ===================================================
   PRODUCTS - name / price / image from the Store API,
   cached for the whole admin session
 =================================================== */
const productCache = new Map();

export const useProducts = (cards) => {
  const [, setVersion] = useState(0);

  const key = [
    ...new Set(cards.flat().map((item) => item.productId).filter(Boolean)),
  ]
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    const missing = key
      ? key.split(",").map(Number).filter((id) => !productCache.has(id))
      : [];
    if (!missing.length) return;

    let mounted = true;
    missing.forEach((id) => productCache.set(id, null));

    apiFetch({
      path: `/wc/store/v1/products?include=${missing.join(",")}&per_page=100`,
    })
      .then((list) => {
        (list || []).forEach((p) =>
          productCache.set(p.id, {
            title: p.name,
            price: p.price_html,
            image: p.images?.[0]?.thumbnail || p.images?.[0]?.src || "",
            desc: p.short_description,
          }),
        );
        // Hidden / deleted products: remember them so we don't refetch.
        missing.forEach((id) => {
          if (!productCache.get(id)) productCache.set(id, false);
        });
      })
      .catch(() => {
        // Network error: forget them so the next change retries.
        missing.forEach((id) => {
          if (productCache.get(id) === null) productCache.delete(id);
        });
      })
      .finally(() => mounted && setVersion((v) => v + 1));

    return () => {
      mounted = false;
    };
  }, [key]);

  return (id) => productCache.get(id) || null;
};

/* ===================================================
   PLAYBACK - mirrors the frontend story mode:
   Video Auto Play     -> cards play one after another
   All Video Auto Play -> every card loops, no progress bar
   Delay               -> seconds per product (frontend uses it as seconds)
 =================================================== */
export const usePlayback = (cards, s) => {
  const autoPlay = !!s?.video_auto_play;
  const allAutoPlay = !!s?.video_all_auto_play;
  const delay = parseFloat(s?.prd_delay) || 0;

  const videoRefs = useRef([]);
  const elapsedRef = useRef(0);
  const [active, setActive] = useState(-1);
  const [itemIndexes, setItemIndexes] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const cardsKey = JSON.stringify(cards);

  const itemIndex = (i) =>
    Math.min(itemIndexes[i] || 0, (cards[i]?.length || 1) - 1);

  const setItemIndex = (i, idx) =>
    setItemIndexes((prev) => {
      const next = [...prev];
      next[i] = idx;
      return next;
    });

  const resetProgress = () => {
    elapsedRef.current = 0;
    setProgress(0);
  };

  // Restart whenever the content or the playback options change.
  useEffect(() => {
    resetProgress();
    setItemIndexes([]);
    const start = autoPlay && !allAutoPlay && cards.length;
    setActive(start ? 0 : -1);
    setPlaying(!!start);
  }, [cardsKey, autoPlay, allAutoPlay]);

  const advance = () => {
    resetProgress();
    const idx = itemIndex(active) + 1;

    if (idx < cards[active].length) {
      setItemIndex(active, idx);
      return;
    }

    setItemIndex(active, 0);
    setActive((active + 1) % cards.length);
  };

  // Progress timer of the active card.
  useEffect(() => {
    if (allAutoPlay || active < 0 || !playing || !cards[active]) return;

    const start = Date.now() - elapsedRef.current * 1000;
    const timer = setInterval(() => {
      const video = videoRefs.current[active];
      const duration =
        delay > 0
          ? delay
          : (video && isFinite(video.duration) && video.duration) || 5;
      const elapsed = (Date.now() - start) / 1000;

      elapsedRef.current = elapsed;
      setProgress(Math.min((elapsed / duration) * 100, 100));

      if (elapsed >= duration) {
        clearInterval(timer);
        advance();
      }
    }, 50);

    return () => clearInterval(timer);
  }, [active, itemIndexes, playing, allAutoPlay, delay, cardsKey]);

  // A newly activated card starts its video from the beginning.
  useEffect(() => {
    const video = videoRefs.current[active];
    if (video) video.currentTime = 0;
  }, [active]);

  // Keep every <video> in sync with the playback state.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      video.loop = allAutoPlay;
      const shouldPlay = allAutoPlay || (i === active && playing);

      if (shouldPlay && video.paused) {
        video.play().catch(() => {
          // Browsers block unmuted autoplay: retry muted.
          video.muted = true;
          video.play().catch(() => {});
        });
      } else if (!shouldPlay && !video.paused) {
        video.pause();
      }
    });
  });

  // Click on a card: start it, or play/pause when it is already active.
  const toggleCard = (i) => {
    if (allAutoPlay) return;

    if (i !== active) {
      resetProgress();
      setItemIndex(i, 0);
      setActive(i);
      setPlaying(true);
      return;
    }

    setPlaying((p) => !p);
  };

  // Up/down navigation: jump to the next/previous video of a card.
  const jump = (i, dir) => {
    const items = cards[i];
    let idx = itemIndex(i);
    const video = items[idx].video;

    if (dir > 0) {
      while (idx < items.length && items[idx].video === video) idx++;
      if (idx >= items.length) return;
    } else {
      while (idx > 0 && items[idx].video === video) idx--;
      if (items[idx].video === video) return;
      const prevVideo = items[idx].video;
      while (idx > 0 && items[idx - 1].video === prevVideo) idx--;
    }

    if (i === active) resetProgress();
    setItemIndex(i, idx);
  };

  const canJump = (i, dir) => {
    const items = cards[i] || [];
    const idx = itemIndex(i);
    const video = items[idx]?.video;
    return dir > 0
      ? items.slice(idx + 1).some((item) => item.video !== video)
      : items.slice(0, idx).some((item) => item.video !== video);
  };

  return {
    videoRefs,
    active,
    playing,
    progress,
    allAutoPlay,
    itemIndex,
    toggleCard,
    jump,
    canJump,
  };
};
