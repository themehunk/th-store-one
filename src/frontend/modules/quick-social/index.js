const StoreOneQuickSocial = {
  init() {
    this.initPopups();
  },

  initPopups() {
    const triggers = document.querySelectorAll(".s1-more-trigger");

    triggers.forEach((trigger) => {
      const wrapper = trigger.closest(".s1-quick-social");
      const popup = wrapper ? wrapper.nextElementSibling : null;

      if (!popup) return;

      const closeBtn = popup.querySelector(".s1-popup-close");

      // Open popup on trigger click
      trigger.addEventListener("click", () => {
        popup.style.display = "flex";
      });

      // Close popup on close button click
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          popup.style.display = "none";
        });
      }

      // Close popup on backdrop/outside click
      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          popup.style.display = "none";
        }
      });
    });
  },
};

export default StoreOneQuickSocial;
