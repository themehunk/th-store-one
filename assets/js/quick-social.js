document.addEventListener("DOMContentLoaded", function () {

    const triggers = document.querySelectorAll(".s1-more-trigger");

    triggers.forEach(function(trigger) {

        const wrapper = trigger.closest(".s1-quick-social");
        const popup = wrapper ? wrapper.nextElementSibling : null;

        if (!popup) return;

        const closeBtn = popup.querySelector(".s1-popup-close");

        trigger.addEventListener("click", function () {
            popup.style.display = "flex";
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                popup.style.display = "none";
            });
        }

        popup.addEventListener("click", function (e) {
            if (e.target === popup) {
                popup.style.display = "none";
            }
        });

    });

});