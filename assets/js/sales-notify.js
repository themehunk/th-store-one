(function () {

    const items = document.querySelectorAll(".th-notification");
    if (!items.length) return;

    let currentIndex = 0;
    let isClosed = false;
    let timer = null;

    function getRandomDelay(range) {
        return Math.floor(Math.random() * range);
    }

    function applyAnimation(el) {
        const animation = el.dataset.animation || "slide";

        // remove all old animation classes
        el.classList.remove("slide", "fade", "zoom");

        // add new one
        el.classList.add(animation);
    }

    function showItem(index) {

        if (!items[index] || isClosed) return;

        const el = items[index];

        const duration = parseInt(el.dataset.duration || 5) * 1000;
        const delayBetween = parseInt(el.dataset.delayBetween || 10) * 1000;

        const randomEnabled = el.dataset.random === "true";
        const randomRange = parseInt(el.dataset.randomRange || 0) * 1000;

        const extraDelay = randomEnabled ? getRandomDelay(randomRange) : 0;

        /* APPLY ANIMATION */
        applyAnimation(el);

        /* SHOW */
        el.classList.remove("hide");
        el.classList.add("show");

        /* AUTO HIDE */
        timer = setTimeout(() => {

            hideItem(el);

            timer = setTimeout(() => {
                nextItem();
            }, delayBetween + extraDelay);

        }, duration);
    }

    function hideItem(el) {

        // same animation reverse feel
        el.classList.remove("show");
        el.classList.add("hide");

    }

    function nextItem() {

        if (isClosed) return;

        currentIndex++;

        if (currentIndex >= items.length) {

            const loop = items[0].dataset.loop === "true";

            if (!loop) return;

            currentIndex = 0;
        }

        showItem(currentIndex);
    }

    /*CLOSE ALL (SMOOTH FIXED) */
    document.addEventListener("click", function (e) {

    const closeBtn = e.target.closest(".th-close-btn");

    if (closeBtn) {

        isClosed = true;

        if (timer) clearTimeout(timer);

        items.forEach(el => {

            hideItem(el);

            setTimeout(() => {
                el.style.display = "none";
            }, 400);

        });
    }

});

    /* INITIAL DELAY */
    const initialDelay = parseInt(items[0].dataset.initial || 3) * 1000;

    setTimeout(() => {
        showItem(currentIndex);
    }, initialDelay);

})();