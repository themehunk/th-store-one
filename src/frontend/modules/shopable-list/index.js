const StoreOneShopableList = {
  init() {
    /* ===================================================
       POPUP MODE - STATE & GLOBALS
     =================================================== */
    const popup = document.getElementById("th-shopable-popup");
    let currentCardItems = [];
    let currentVideoIndex = 0;
    let currentProductIndex = 0;
    let videoSwiper;

    function openPopup(card) {
      if (!popup) {
        console.warn("Popup element (#th-shopable-popup) not found in DOM.");
        return;
      }
      buildPopup(card);
      popup.style.display = "flex";
      document.body.style.overflow = "hidden";
      window.addEventListener("resize", loadContentForCurrentVideo);
    }

    /* ===================================================
       SWIPER INITIALIZATION & CORE REFRESH
     =================================================== */
    window.addEventListener("load", () => {
      document.querySelectorAll(".th-shopable-slider").forEach((slider) => {
        const swiper = slider.swiper;
        if (swiper) {
          swiper.update();
          swiper.slideTo(0, 0);
        }
      });
    });

    document.querySelectorAll(".th-shopable-slider").forEach((slider) => {
      const slides = Number(slider.dataset.slides) || 3;
      const gap = Number(slider.dataset.gap) || 15;
      const navEnabled = slider.dataset.nav === "true";
      const isAutoplayEnabled = slider.dataset.autoplay === "true"; // Variable ka naam sahi kiya

      const swiper = new Swiper(slider, {
        slidesPerView: slides,
        spaceBetween: gap,
        loop: isAutoplayEnabled, // Agar autoplay true hai toh loop bhi true hoga
        speed: 800,
        cssMode: false,
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        watchOverflow: true,
        updateOnWindowResize: true,

        // FIX: Autoplay ka asli logic yahan hai
        autoplay: isAutoplayEnabled
          ? {
              delay: 3000, // 3 second mein slide badlegi
              disableOnInteraction: false, // User touch kare tab bhi autoplay band nahi hoga
              pauseOnMouseEnter: true, // Agar user mouse slide par laye toh thodi der ruk jayega
            }
          : false,

        navigation: navEnabled
          ? {
              nextEl: slider.querySelector(".swiper-button-next"),
              prevEl: slider.querySelector(".swiper-button-prev"),
            }
          : false,
        breakpoints: {
          0: { slidesPerView: 1.2 },
          640: { slidesPerView: Math.min(slides, 2) },
          1024: { slidesPerView: slides },
        },
        on: {
          init(swiper) {
            requestAnimationFrame(() => {
              swiper.el.classList.add("swiper-ready");
              swiper.update();
            });
          },
        },
      });

      slider.querySelectorAll("video").forEach((video) => {
        video.addEventListener("loadedmetadata", () => swiper.update());
        video.addEventListener("loadeddata", () => swiper.update());
      });

      setTimeout(() => swiper.update(), 200);
    });

    /* ===================================================
       MUTE / UNMUTE HELPER
     =================================================== */
    function toggleMute(video, muteBtn) {
      if (!video || !muteBtn) return;
      video.muted = !video.muted;

      if (video.muted) {
        video.setAttribute("muted", "muted");
      } else {
        video.removeAttribute("muted");
      }

      const iconMuted = muteBtn.querySelector(".icon-muted");
      const iconUnmuted = muteBtn.querySelector(".icon-unmuted");

      if (iconMuted && iconUnmuted) {
        iconMuted.style.display = video.muted ? "block" : "none";
        iconUnmuted.style.display = video.muted ? "none" : "block";
      }
    }

    /* ===================================================
       SHOPABLE STORY MODE (Main List Layout)
     =================================================== */
    document.querySelectorAll(".th-shopable-list-wrap").forEach((wrap) => {
      const cards = [...wrap.querySelectorAll(".th-shopable-card")];
      if (!cards.length) return;

      const delaySetting = parseInt(wrap.dataset.delay || 0, 10);
      const autoPlay = wrap.dataset.autoplay === "true";
      const allAutoPlay = wrap.dataset.allautoplay === "true";

      let currentCardIndex = 0;
      let currentItemIndex = 0;
      let timer = null;
      let progressStartTime = 0;
      let progressElapsedBeforePause = 0;

      function pauseAndResetAll() {
        clearInterval(timer);
        cards.forEach((card) => {
          const v = card.querySelector(".th-shopable-video");
          if (v) {
            v.pause();
          }
          card.classList.remove("is-playing", "is-active");

          const progress = card.querySelector(".th-shopable-progress-fill");
          if (progress) progress.style.width = "0%";

          const playBtn = card.querySelector(".th-shopable-play");
          if (playBtn) playBtn.classList.remove("is-playing");
        });
      }

      function updateCardContent(card, item) {
        const video = card.querySelector(".th-shopable-video");
        const image = card.querySelector(".th-product-image");
        const title = card.querySelector(".title");
        const price = card.querySelector(".price");
        const link = card.querySelector(".th-shopable-product-link");
        const cart = card.querySelector(".th-shopable-btn");

        if (image && item.image) {
          image.src = item.image;
        }
        if (title) title.textContent = item.title;
        if (price) price.innerHTML = item.price;
        if (link) link.href = item.link;
        if (cart) {
          cart.href = item.cart_url;
          cart.dataset.product_id = item.product_id || "";
        }

        if (video) {
          const source = video.querySelector("source");
          if (source) {
            if (source.getAttribute("src") !== item.video) {
              source.src = item.video;
              video.load();
            }
          }
        }
      }

      function startProgress(duration, progressElement, card) {
        clearInterval(timer);
        if (!progressElement) return;

        card.classList.add("is-playing");
        const playBtn = card.querySelector(".th-shopable-play");
        if (playBtn) playBtn.classList.add("is-playing");

        progressStartTime = Date.now() - progressElapsedBeforePause * 1000;

        timer = setInterval(() => {
          const elapsed = (Date.now() - progressStartTime) / 1000;
          progressElapsedBeforePause = elapsed;
          const percent = Math.min((elapsed / duration) * 100, 100);
          progressElement.style.width = `${percent}%`;

          if (elapsed >= duration) {
            clearInterval(timer);
            progressElapsedBeforePause = 0;
            card.classList.remove("is-playing");
            if (playBtn) playBtn.classList.remove("is-playing");
            nextItem();
          }
        }, 30);
      }

      function nextItem() {
        if (allAutoPlay) {
          return;
        }
        const currentCard = cards[currentCardIndex];
        const items = JSON.parse(currentCard.dataset.items || "[]");
        currentItemIndex++;

        if (currentItemIndex >= items.length) {
          currentItemIndex = 0;
          currentCardIndex = (currentCardIndex + 1) % cards.length;
          const swiperEl = wrap.querySelector(".th-shopable-slider");
          if (swiperEl?.swiper) swiperEl.swiper.slideTo(currentCardIndex, 500);
        }
        playCurrentItem();
      }

      function playCurrentItem() {
        pauseAndResetAll();

        const card = cards[currentCardIndex];
        if (!card) return;

        const items = JSON.parse(card.dataset.items || "[]");
        if (!items.length) return;

        const item = items[currentItemIndex];
        card.classList.add("is-active");
        updateCardContent(card, item);

        const video = card.querySelector(".th-shopable-video");
        const progress = card.querySelector(".th-shopable-progress-fill");

        if (video && card.dataset.muted === "true") {
          video.muted = true;
          video.setAttribute("muted", "muted");
        }

        if (video) {
          const runProgress = () => {
            const duration =
              delaySetting > 0 ? delaySetting : video.duration || 5;
            video
              .play()
              .catch((err) => console.log("Autoplay error tracking:", err));
            startProgress(duration, progress, card);
          };

          if (video.readyState >= 1) {
            runProgress();
          } else {
            video.addEventListener("loadedmetadata", runProgress, {
              once: true,
            });
          }
        }
      }

      /* Bind Controls */
      cards.forEach((card, cardIdx) => {
        const playBtn = card.querySelector(".th-shopable-play");
        const video = card.querySelector(".th-shopable-video");
        const muteBtn = card.querySelector(".th-video-mute-toggle");
        const shouldShowPopup = card.dataset.showPopup === "true";

        function handleNormalViewClick(e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }

          // AGAR DUSRE CARD PAR CLICK KIYA: Direct full reset aur unique single click play trigger
          if (currentCardIndex !== cardIdx) {
            currentCardIndex = cardIdx;
            currentItemIndex = 0;
            progressElapsedBeforePause = 0;

            pauseAndResetAll();

            // Naye card ko instant activate aur play state mein bhejenge
            card.classList.add("is-active");
            const items = JSON.parse(card.dataset.items || "[]");
            if (items.length) updateCardContent(card, items[currentItemIndex]);

            if (video) {
              if (card.dataset.muted === "true") {
                video.muted = true;
                video.setAttribute("muted", "muted");
              }
              video.currentTime = 0;

              // UI classes instantly updates target before play promise resolves
              card.classList.add("is-playing");
              if (playBtn) playBtn.classList.add("is-playing");

              video
                .play()
                .then(() => {
                  const progress = card.querySelector(
                    ".th-shopable-progress-fill",
                  );
                  const duration =
                    delaySetting > 0 ? delaySetting : video.duration || 5;
                  startProgress(duration, progress, card);
                })
                .catch((err) => {
                  // Fail-safe flow structure
                  card.classList.remove("is-playing");
                  if (playBtn) playBtn.classList.remove("is-playing");
                });
            }
            return;
          }

          // AGAR SELECTION USI CARD PAR HAI: Toh directly basic Play/Pause Toggle hoga
          if (video) {
            const progress = card.querySelector(".th-shopable-progress-fill");

            if (video.paused) {
              // 1. Click hote hi instant classes lagao taaki play button hate aur progress bar container dikhe
              card.classList.add("is-active", "is-playing");
              if (playBtn) playBtn.classList.add("is-playing");

              video
                .play()
                .then(() => {
                  // 2. Video chalne par progress animation shuru karo
                  const duration =
                    delaySetting > 0 ? delaySetting : video.duration || 5;
                  startProgress(duration, progress, card);
                })
                .catch((err) => {
                  console.error("Play failed:", err);
                  // Fail-safe: Agar play block ho jaye toh classes hata do
                  card.classList.remove("is-playing");
                  if (playBtn) playBtn.classList.remove("is-playing");
                });
            } else {
              // Video pause hone par progress bar hide karo aur timer roko
              video.pause();
              clearInterval(timer);
              card.classList.remove("is-playing");
              if (playBtn) playBtn.classList.remove("is-playing");
            }
          }
        }

        if (playBtn) {
          playBtn.addEventListener("click", (e) => {
            if (shouldShowPopup) {
              e.preventDefault();
              e.stopPropagation();
              openPopup(card);
            } else {
              handleNormalViewClick(e);
            }
          });
        }

        if (video) {
          video.addEventListener("click", (e) => {
            if (shouldShowPopup) {
              e.preventDefault();
              e.stopPropagation();
              openPopup(card);
            } else {
              handleNormalViewClick(e);
            }
          });
        }

        if (muteBtn && video) {
          muteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            toggleMute(video, muteBtn);
          });
        }
      });

      // INITIAL RENDER LOGIC

      if (allAutoPlay) {
        cards.forEach((card) => {
          const video = card.querySelector(".th-shopable-video");
          const playBtn = card.querySelector(".th-shopable-play");

          if (!video) return;

          // Loop enable
          video.loop = true;

          card.classList.add("is-active", "is-playing");

          if (playBtn) {
            playBtn.classList.add("is-playing");
          }

          if (card.dataset.muted === "true") {
            video.muted = true;
            video.setAttribute("muted", "muted");
          }

          const playVideo = () => {
            video.play().catch(() => {});
          };

          if (video.readyState >= 2) {
            playVideo();
          } else {
            video.addEventListener("loadeddata", playVideo, { once: true });
          }
        });
      } else if (autoPlay) {
        playCurrentItem();
      } else {
        const firstCard = cards[0];
        if (firstCard) {
          // FIX: Yahan se main active class hata di hai.
          // Ab page load par sirf content load hoga, 'is-active' tabhi lagega jab user click karega.
          const items = JSON.parse(firstCard.dataset.items || "[]");
          if (items.length) updateCardContent(firstCard, items[0]);
        }
      }
    });

    /* ===================================================
   PRODUCT SWIPER INTERACTION (DRAG CHILD, JUMP NAV WITH DISABLE STATE)
 =================================================== */
    document.querySelectorAll(".th-product-swiper").forEach((el) => {
      if (el.querySelectorAll(".swiper-slide").length <= 1) return;

      const card = el.closest(".th-shopable-card");
      const items = JSON.parse(card.dataset.items || "[]");

      const customPrev = card?.querySelector(".th-nav-prev");
      const customNext = card?.querySelector(".th-nav-next");

      // Function: Jo check karega ki aage ya peeche koi naya parent item bacha hai ya nahi
      function updateNavOpacity(activeIndex) {
        let currentVideo = items[activeIndex]?.video;

        // 1. Check Next Button: Kya aage koi alag video hai?
        let hasNextParent = false;
        for (let i = activeIndex + 1; i < items.length; i++) {
          if (items[i].video !== currentVideo) {
            hasNextParent = true;
            break;
          }
        }

        // 2. Check Prev Button: Kya peeche koi alag video hai?
        let hasPrevParent = false;
        for (let i = activeIndex - 1; i >= 0; i--) {
          if (items[i].video !== currentVideo) {
            hasPrevParent = true;
            break;
          }
        }

        // Next Button Toggle Class
        if (customNext) {
          if (!hasNextParent) {
            customNext.classList.add("disabled");
            customNext.style.opacity = "0.4"; // Semi-transparent look
            customNext.style.pointerEvents = "none"; // Click block
          } else {
            customNext.classList.remove("disabled");
            customNext.style.opacity = "1";
            customNext.style.pointerEvents = "auto";
          }
        }

        // Prev Button Toggle Class
        if (customPrev) {
          if (!hasPrevParent) {
            customPrev.classList.add("disabled");
            customPrev.style.opacity = "0.4";
            customPrev.style.pointerEvents = "none";
          } else {
            customPrev.classList.remove("disabled");
            customPrev.style.opacity = "1";
            customPrev.style.pointerEvents = "auto";
          }
        }
      }

      const swiper = new Swiper(el, {
        direction: "horizontal",
        slidesPerView: 1,
        spaceBetween: 15,
        loop: false,
        speed: 600,
        grabCursor: true,
        observer: true,
        observeParents: true,
        on: {
          init(swiper) {
            // Shuruat me pehli slide ke hisab se nav check karo
            updateNavOpacity(swiper.activeIndex);
          },
          slideChange(swiper) {
            // Drag karne par nav state update karo
            updateNavOpacity(swiper.activeIndex);

            // Drag video change logic
            const currentItem = items[swiper.realIndex];
            if (!currentItem?.video) return;

            const video = card.querySelector(".th-shopable-video");
            const source = video?.querySelector("source");
            if (!video || !source) return;

            if (source.getAttribute("src") === currentItem.video) return;

            source.setAttribute("src", currentItem.video);
            video.load();
            video.play().catch(() => {});
          },
        },
      });

      // ==========================================
      // NAVIGATION LOGIC (WITH DIRECT JUMP)
      // ==========================================

      customNext?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        let currentVideo = items[swiper.activeIndex]?.video;
        let nextMainIndex = swiper.activeIndex + 1;

        while (nextMainIndex < items.length) {
          if (items[nextMainIndex].video !== currentVideo) {
            break;
          }
          nextMainIndex++;
        }

        if (nextMainIndex < items.length) {
          swiper.slideTo(nextMainIndex);
        }
      });

      customPrev?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        let currentVideo = items[swiper.activeIndex]?.video;
        let prevMainIndex = swiper.activeIndex - 1;

        while (prevMainIndex >= 0) {
          if (items[prevMainIndex].video !== currentVideo) {
            while (
              prevMainIndex > 0 &&
              items[prevMainIndex - 1].video === items[prevMainIndex].video
            ) {
              prevMainIndex--;
            }
            break;
          }
          prevMainIndex--;
        }

        if (prevMainIndex >= 0) {
          swiper.slideTo(prevMainIndex);
        }
      });
    });

    /* ===================================================
     POPUP ENGINE DEFINITIONS
     =================================================== */
    function buildPopup(card) {
      currentCardItems = [];

      document
        .querySelectorAll(".th-shopable-card")
        .forEach((cardEl, cardIndex) => {
          try {
            const items = JSON.parse(cardEl.dataset.items || "[]");
            items.forEach((item) => {
              currentCardItems.push({ ...item, _cardIndex: cardIndex });
            });
          } catch (e) {}
        });

      if (!currentCardItems.length) return;

      currentVideoIndex = 0;
      currentProductIndex = 0;

      const clickedItems = JSON.parse(card.dataset.items || "[]");
      const clickedVideo = clickedItems[0]?.video || "";
      const videoWrapper = document.getElementById("th-video-wrapper");
      if (videoWrapper) videoWrapper.innerHTML = "";

      const videoGroups = {};
      currentCardItems.forEach((item) => {
        const key = item._cardIndex + "|" + item.video;
        if (!videoGroups[key]) videoGroups[key] = [];
        videoGroups[key].push(item);
      });

      const videoKeys = Object.keys(videoGroups);
      let startIndex = 0;

      videoKeys.forEach((key, index) => {
        const item = videoGroups[key][0];
        if (item.video === clickedVideo && startIndex === 0) {
          startIndex = index;
        }

        if (videoWrapper) {
          videoWrapper.innerHTML += `
          <div class="swiper-slide" data-index="${index}">
              <div class="th-popup-video-container" style="position:relative; width:100%; height:100%; cursor:pointer;">
                  <video class="th-popup-video" muted playsinline preload="metadata" style="width:100%; height:100%; object-fit:cover; display:block;">
                      <source src="${item.video}" type="video/mp4">
                  </video>
                  <div class="th-popup-center-play" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.5); width:60px; height:60px; border-radius:50%; display:none; align-items:center; justify-content:center; pointer-events:none; z-index:10;">
                      <svg class="popup-icon-play" viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                      <svg class="popup-icon-pause" viewBox="0 0 24 24" width="30" height="30" fill="#fff" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  </div>
              </div>
              <div class="th-video-mute-toggle popup-mute">
                  <svg class="icon-muted" viewBox="0 0 24 24" fill="none">
                      <path d="M14 5L9 9H5V15H9L14 19V5Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M3 3L21 21" stroke="currentColor" stroke-width="2.5"/>
                  </svg>
                  <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" style="display:none">
                      <path d="M11 5L6 9H3V15H6L11 19V5Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M15 9C16.2 10.2 16.2 13.8 15 15" stroke="currentColor" stroke-width="2"/>
                      <path d="M18 7C20.5 9.5 20.5 14.5 18 17" stroke="currentColor" stroke-width="2"/>
                  </svg>
              </div>
          </div>
        `;
        }
      });

      if (videoSwiper) {
        videoSwiper.destroy(true, true);
      }

      videoSwiper = new Swiper(".th-video-swiper", {
        direction: "vertical",
        slidesPerView: 1,
        mousewheel: true,
        speed: 700,
        observer: true,
        observeParents: true,
      });

      function toggleNavigationButtons() {
        if (!videoSwiper) return;
        if (videoSwiper.isBeginning) {
          if (prevBtn) {
            prevBtn.style.opacity = "0.5";
            prevBtn.style.pointerEvents = "none";
          }
        } else {
          if (prevBtn) {
            prevBtn.style.opacity = "1";
            prevBtn.style.pointerEvents = "auto";
          }
        }

        if (videoSwiper.isEnd) {
          if (nextBtn) {
            nextBtn.style.opacity = "0.5";
            nextBtn.style.pointerEvents = "none";
          }
        } else {
          if (nextBtn) {
            nextBtn.style.opacity = "1";
            nextBtn.style.pointerEvents = "auto";
          }
        }
      }

      videoSwiper.on("slideChangeTransitionEnd", () => {
        currentVideoIndex = videoSwiper.activeIndex;
        currentProductIndex = 0;
        loadContentForCurrentVideo();
        toggleNavigationButtons();
        setTimeout(() => {
          playActivePopupVideo();
        }, 100);
      });

      const nextBtn = document.querySelector(".th-next");
      const prevBtn = document.querySelector(".th-prev");
      if (prevBtn) prevBtn.onclick = () => videoSwiper.slidePrev();
      if (nextBtn) nextBtn.onclick = () => videoSwiper.slideNext();

      setTimeout(() => {
        document
          .querySelectorAll(".th-popup-video-container")
          .forEach((container) => {
            const vid = container.querySelector(".th-popup-video");
            const playOverlay = container.querySelector(
              ".th-popup-center-play",
            );
            const iconPlay = container.querySelector(".popup-icon-play");
            const iconPause = container.querySelector(".popup-icon-pause");

            container.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!vid) return;

              document.querySelectorAll(".th-popup-video").forEach((oVid) => {
                if (oVid !== vid) oVid.pause();
              });

              if (vid.paused) {
                vid.play().catch(() => {});
                if (playOverlay && iconPlay && iconPause) {
                  iconPlay.style.display = "none";
                  iconPause.style.display = "block";
                  playOverlay.style.display = "flex";
                  setTimeout(() => {
                    playOverlay.style.display = "none";
                  }, 600);
                }
              } else {
                vid.pause();
                if (playOverlay && iconPlay && iconPause) {
                  iconPlay.style.display = "block";
                  iconPause.style.display = "none";
                  playOverlay.style.display = "flex";
                }
              }
            });
          });

        document.querySelectorAll(".popup-mute").forEach((btn) => {
          const video = btn
            .closest(".swiper-slide")
            .querySelector(".th-popup-video");
          btn.addEventListener("click", (e) => {
            e.stopImmediatePropagation();
            toggleMute(video, btn);
          });
        });
      }, 300);

      videoSwiper.slideTo(startIndex, 0);
      currentVideoIndex = startIndex;
      loadContentForCurrentVideo();
      setTimeout(() => {
        playActivePopupVideo();
        toggleNavigationButtons();
      }, 150);
    }

    function playActivePopupVideo() {
      const videos = document.querySelectorAll(".th-popup-video");
      videos.forEach((video) => {
        video.pause();
        const container = video.closest(".th-popup-video-container");
        const playOverlay = container?.querySelector(".th-popup-center-play");
        if (playOverlay) playOverlay.style.display = "none";
      });

      const activeSlide = document.querySelector(
        ".th-video-swiper .swiper-slide-active",
      );
      if (!activeSlide) return;
      const activeVideo = activeSlide.querySelector(".th-popup-video");
      if (!activeVideo) return;

      activeVideo.currentTime = 0;
      activeVideo.play().catch(() => {});
    }

    function getCurrentVideoProducts() {
      const groups = {};
      currentCardItems.forEach((item) => {
        const key = item._cardIndex + "|" + item.video;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });
      const videoList = Object.values(groups);
      return videoList[currentVideoIndex] || [];
    }

    function loadContentForCurrentVideo() {
      jQuery("#th-shopable-popup .th-side-panel").removeClass(
        "drawer-expanded is-multilist-mode single-product-mode view-details-mode global-mini-layout",
      );

      const products = getCurrentVideoProducts();

      if (window.innerWidth <= 768) {
        jQuery("#th-shopable-popup").addClass("th-mobile-active-view");
        jQuery("#th-shopable-popup .th-side-panel").addClass(
          "global-mini-layout",
        );
        if (products.length === 1) {
          showMobileSingleTriggerCard(products[0]);
        } else {
          showMobileMultiTriggerCard();
        }
      } else {
        jQuery("#th-shopable-popup").removeClass("th-mobile-active-view");
        if (products.length === 1) {
          showProductDetail(0, false);
        } else {
          showProductList();
        }
      }
    }

    function showMobileSingleTriggerCard(item) {
      const content = document.getElementById("popup-content");
      const $sidePanel = jQuery("#th-shopable-popup .th-side-panel");

      $sidePanel.addClass("single-product-mode").removeClass("drawer-expanded");

      if (content) {
        content.innerHTML = `
        <div class="th-mobile-mini-trigger-card standard-trigger">
          ${item.image ? `<img src="${item.image}" class="th-mini-img">` : ""}
           <div class="th-mini-info">
               <p class="th-mini-title">${item.title}</p>
               <span class="th-mini-price">${item.price}</span>
           </div>
           <div class="th-mini-open-btn">
              <a
                href="${item.cart_url}"
                data-product_id="${item.product_id}"
                data-product_sku="${item.sku || ""}"
                data-quantity="1"
                class="product_type_simple add_to_cart_button ajax_add_to_cart th-shopable-btn"
                rel="nofollow"
            >
                <span class="cart-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </span>
                <span class="check-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 6L9 17L4 12"/>
                    </svg>
                </span>
            </a>
           </div>
        </div>
      `;
      }

      jQuery(document)
        .off("click", ".th-mobile-mini-trigger-card.standard-trigger")
        .on(
          "click",
          ".th-mobile-mini-trigger-card.standard-trigger",
          function (e) {
            e.stopPropagation();
            $sidePanel.addClass("drawer-expanded");
            showProductDetail(0, false);
          },
        );
    }

    function showMobileMultiTriggerCard() {
      const content = document.getElementById("popup-content");
      const $sidePanel = jQuery("#th-shopable-popup .th-side-panel");

      $sidePanel.addClass("is-multilist-mode").removeClass("drawer-expanded");

      if (content) {
        content.innerHTML = `
        <div class="th-mobile-mini-trigger-card multi-trigger">
           <div class="th-mini-info">
               <p class="th-mini-title">Select Product</p>
               <span class="th-mini-price">View all available items</span>
           </div>
           <div class="th-mini-open-btn"><span>+</span></div>
        </div>
      `;
      }

      jQuery(document)
        .off("click", ".th-mobile-mini-trigger-card.multi-trigger")
        .on(
          "click",
          ".th-mobile-mini-trigger-card.multi-trigger",
          function (e) {
            e.stopPropagation();
            showProductList();
          },
        );
    }

    function showProductList() {
      const products = getCurrentVideoProducts();
      const content = document.getElementById("popup-content");
      const $sidePanel = jQuery("#th-shopable-popup .th-side-panel");

      if (!content) return;
      content.style.opacity = "0";
      $sidePanel.addClass("drawer-expanded").removeClass("global-mini-layout");

      let html = "";
      if (window.innerWidth <= 768) {
        html += `<button type="button" class="th-mobile-drawer-close-x">&times;</button>`;
      }

      html += `<div class="th-product-list"><p class="th-list-header-title"><strong>Select Product</strong></p>`;

      products.forEach((product, idx) => {
        html += `
        <div class="product-list-item" data-index="${idx}">
        ${
          product.image
            ? `<img src="${product.image}" class="list-item-thumb">`
            : ""
        }
            
            <div style="flex:1;">
                <p class="product-title">${product.title}</p>
                <span class="product-price">${product.price}</span>
            </div>
            <div class="plus-btn">+</div>
        </div>`;
      });

      html += `</div>`;
      content.innerHTML = html;

      const closeX = content.querySelector(".th-mobile-drawer-close-x");
      if (closeX) {
        closeX.onclick = (e) => {
          e.stopPropagation();
          loadContentForCurrentVideo();
        };
      }

      content.querySelectorAll(".product-list-item").forEach((item) => {
        item.onclick = (e) => {
          e.stopPropagation();
          currentProductIndex = parseInt(item.dataset.index);
          showProductDetail(currentProductIndex, true);
        };
      });

      setTimeout(() => (content.style.opacity = "1"), 100);
    }

    function showProductDetail(index, hasMultipleProducts = false) {
      const products = getCurrentVideoProducts();
      const item = products[index];
      const content = document.getElementById("popup-content");
      const $sidePanel = jQuery("#th-shopable-popup .th-side-panel");

      if (!content) return;

      if (hasMultipleProducts) {
        $sidePanel
          .addClass("view-details-mode single-product-mode drawer-expanded")
          .removeClass("global-mini-layout");
      } else {
        if (window.innerWidth > 768) {
          $sidePanel
            .addClass("single-product-mode")
            .removeClass("drawer-expanded");
        }
      }

      content.innerHTML = `
      <div class="th-product-skeleton">
          <div class="th-skeleton-image"></div>
          <div class="th-skeleton-title"></div>
          <div class="th-skeleton-price"></div>
          <div class="th-skeleton-desc"></div>
          <div class="th-skeleton-desc short"></div>
          <div class="th-skeleton-btn"></div>
      </div>
    `;

      jQuery.ajax({
        url: thShopable.ajaxurl,
        type: "POST",
        dataType: "json",
        data: {
          action: "th_shopable_get_product",
          nonce: thShopable.nonce,
          product_id: item.product_id,
        },
        success: function (response) {
          if (!response.success) {
            content.innerHTML = "<p>Product not found</p>";
            return;
          }

          content.style.opacity = "0";

          let mainHTML = "";
          if (window.innerWidth <= 768) {
            mainHTML += `<button type="button" class="th-mobile-drawer-close-x">&times;</button>`;
            if (hasMultipleProducts) {
              mainHTML += `<button type="button" class="th-back-to-list-btn">← Back to List</button>`;
            }
          }

          mainHTML += response.data.html;
          content.innerHTML = mainHTML;

          requestAnimationFrame(() => {
            content.classList.remove("loaded");
            requestAnimationFrame(() => {
              content.classList.add("loaded");
            });
          });

          if (window.innerWidth <= 768) {
            jQuery(document)
              .off("click", ".th-mobile-drawer-close-x")
              .on("click", ".th-mobile-drawer-close-x", function (e) {
                e.stopPropagation();
                loadContentForCurrentVideo();
              });

            const backListBtn = content.querySelector(".th-back-to-list-btn");
            if (backListBtn) {
              backListBtn.onclick = (e) => {
                e.stopPropagation();
                showProductList();
              };
            }
          }

          if (document.querySelector(".th-product-gallery-swiper")) {
            if (window.thProductGallerySwiper) {
              window.thProductGallerySwiper.destroy(true, true);
            }
            window.thProductGallerySwiper = new Swiper(
              ".th-product-gallery-swiper",
              {
                slidesPerView: 1,
                loop: false,
                speed: 700,
                pagination: { el: ".swiper-pagination", clickable: true },
              },
            );
          }

          const defaultPrice = jQuery("#th-dynamic-price").html();
          const defaultDesc = jQuery("#th-dynamic-desc").html();
          const isVariable = jQuery(".variations_form").length > 0;

          if (isVariable) {
            if (jQuery.fn.wc_variation_form) {
              jQuery(".variations_form").each(function () {
                jQuery(this).wc_variation_form();
              });
            }

            jQuery("#th-custom-add-to-cart")
              .addClass("disabled")
              .prop("disabled", true);

            jQuery(document)
              .off("found_variation")
              .on(
                "found_variation",
                ".variations_form",
                function (event, variation) {
                  jQuery("#th-custom-add-to-cart")
                    .attr("data-variation_id", variation.variation_id)
                    .removeClass("disabled")
                    .prop("disabled", false)
                    .text("Add To Cart");

                  jQuery(this)
                    .find("input.qty")
                    .val(jQuery(".custom-th-qty").val());

                  if (variation.price_html) {
                    jQuery("#th-dynamic-price").html(variation.price_html);
                  }
                  if (variation.variation_description) {
                    jQuery("#th-dynamic-desc").html(
                      variation.variation_description,
                    );
                  } else {
                    jQuery("#th-dynamic-desc").html(defaultDesc);
                  }

                  if (variation.image && variation.image.src) {
                    jQuery(
                      "#th-gallery-wrapper .variation-thumb-slide",
                    ).remove();
                    const newSlide = `
                  <div class="swiper-slide variation-thumb-slide">
                    <img src="${variation.image.src}" class="th-gallery-image" alt="${variation.image.title}">
                  </div>
                `;
                    jQuery("#th-gallery-wrapper").prepend(newSlide);
                    if (window.thProductGallerySwiper) {
                      window.thProductGallerySwiper.update();
                      window.thProductGallerySwiper.slideTo(0);
                    }
                  }
                },
              );

            jQuery(document)
              .off("reset_data")
              .on("reset_data", ".variations_form", function () {
                jQuery("#th-custom-add-to-cart")
                  .attr("data-variation_id", "0")
                  .addClass("disabled")
                  .prop("disabled", true);
                jQuery("#th-dynamic-price").html(defaultPrice);
                jQuery("#th-dynamic-desc").html(defaultDesc);
                jQuery("#th-gallery-wrapper .variation-thumb-slide").remove();
                if (window.thProductGallerySwiper) {
                  window.thProductGallerySwiper.update();
                  window.thProductGallerySwiper.slideTo(0);
                }
              });
          } else {
            jQuery("#th-custom-add-to-cart")
              .removeClass("disabled")
              .prop("disabled", false);
          }

          jQuery(document)
            .off("click", ".th-qty-plus, .th-qty-minus")
            .on("click", ".th-qty-plus, .th-qty-minus", function (e) {
              e.preventDefault();
              const $qtyInput = jQuery(this).siblings(".custom-th-qty");
              let currentVal = parseInt($qtyInput.val(), 10) || 1;

              if (jQuery(this).hasClass("th-qty-plus")) {
                $qtyInput.val(currentVal + 1);
              } else if (currentVal > 1) {
                $qtyInput.val(currentVal - 1);
              }

              const updatedQty = $qtyInput.val();
              jQuery("#th-custom-add-to-cart").attr(
                "data-quantity",
                updatedQty,
              );
              if (isVariable) {
                jQuery(".variations_form").find("input.qty").val(updatedQty);
              }
            });

          jQuery(document)
            .off("click", "#th-custom-add-to-cart")
            .on("click", "#th-custom-add-to-cart", function (e) {
              e.preventDefault();
              const $button = jQuery(this);
              if (
                $button.hasClass("disabled") ||
                $button.prop("disabled") === true
              ) {
                return false;
              }

              $button.addClass("loading").text("Adding...");

              if (isVariable) {
                const $wcForm = jQuery(".variations_form");
                let formData = $wcForm.serializeArray();
                formData.push({
                  name: "add-to-cart",
                  value: $button.attr("data-product_id"),
                });
                formData.push({
                  name: "product_id",
                  value: $button.attr("data-product_id"),
                });
                formData.push({
                  name: "variation_id",
                  value: $button.attr("data-variation_id"),
                });

                jQuery.ajax({
                  type: "POST",
                  url: window.location.toString(),
                  data: jQuery.param(formData),
                  success: function () {
                    jQuery(document.body).trigger("wc_fragment_refresh");
                    jQuery(document.body).trigger("added_to_cart", [
                      null,
                      null,
                      $button,
                    ]);
                    $button.removeClass("loading").text("Added ✓");
                    setTimeout(function () {
                      $button.text("Add To Cart");
                    }, 2000);
                  },
                  error: function () {
                    $button.removeClass("loading").text("Add To Cart");
                  },
                });
              } else {
                jQuery.ajax({
                  type: "POST",
                  url: thShopable.ajaxurl,
                  data: {
                    action: "woocommerce_add_to_cart",
                    product_id: $button.attr("data-product_id"),
                    quantity: $button.attr("data-quantity"),
                  },
                  success: function (res) {
                    jQuery(document.body).trigger("added_to_cart", [
                      res.fragments,
                      res.cart_hash,
                      $button,
                    ]);
                    $button.removeClass("loading").text("Added ✓");
                    setTimeout(function () {
                      $button.text("Add To Cart");
                    }, 2000);
                  },
                  error: function () {
                    $button.removeClass("loading").text("Add To Cart");
                  },
                });
              }
            });

          content.style.opacity = "1";
        },
      });
    }

    /* ===================================================
     GLOBAL STATIC CLICK BINDINGS FOR POPUP
     =================================================== */
    if (popup) {
      document
        .querySelectorAll(".th-open-popup, .th-product-image")
        .forEach((el) => {
          el.addEventListener("click", (e) => {
            const card = el.closest(".th-shopable-card");
            if (card && card.dataset.showPopup === "true") {
              e.preventDefault();
              e.stopPropagation();
              openPopup(card);
            }
          });
        });

      const closeMainBtn = document.querySelector(".th-popup-close");
      if (closeMainBtn) {
        closeMainBtn.addEventListener("click", () => {
          popup.style.display = "none";
          document.body.style.overflow = "";
          window.removeEventListener("resize", loadContentForCurrentVideo);
          document
            .querySelectorAll(".th-popup-video")
            .forEach((v) => v.pause());
        });
      }
    }
  },
};

export default StoreOneShopableList;
