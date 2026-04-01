
jQuery(function($){  

    let isInitialized = false;

    /* ================= YOUTUBE ID ================= */
    function getYouTubeId(url){
        try {
            let u = new URL(url);
            if (u.searchParams.get("v")) return u.searchParams.get("v");
            if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
            if (u.pathname.includes("/embed/")) return u.pathname.split("/embed/")[1];
        } catch(e){}
        return '';
    }

    /* ================= VIMEO ID ================= */
    function getVimeoId(url){
        return url.split('/').pop();
    }

    /* ================= BUILD VIDEO ================= */
    function buildVideo(video, type){

        if(type === 'youtube'){
            let id = getYouTubeId(video);
            if(!id) return '';
            return `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1"
                     allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        }

        if(type === 'vimeo'){
            let id = getVimeoId(video);
            return `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&muted=1"
                     allow="autoplay; fullscreen" allowfullscreen></iframe>`;
        }

        return `<video src="${video}" controls autoplay muted></video>`;
    }

    /* ================= PLAY VIDEO ================= */
    function playVideo($slide){
        let video = $slide.data('video');
        let type  = $slide.data('type') || 'youtube';
        let html  = buildVideo(video, type);
        if(!html) return;
        $slide.html(html);
    }

    /* ================= INIT GALLERY ================= */
    function initGallery(){
        let $gallery = $('.woocommerce-product-gallery');
        if(!$gallery.length) return;

        $gallery.trigger('woocommerce_gallery_reset');

        $gallery.trigger('woocommerce_gallery_reset');

        $gallery.each(function(){
            $(this).wc_product_gallery();
        });

        isInitialized = true;
    }

    function safeInit(){
        if(isInitialized) return;
        if($('.woocommerce-product-gallery__wrapper .th-video-slide').length > 1) return;
        initGallery();
    }

    setTimeout(safeInit, 400);

    /* ================= CLICK VIDEO (INLINE) ================= */
    $(document).on('click', '.th-video-slide a:not(.th-video-trigger)', function(e){

        e.preventDefault();
        e.stopPropagation();

        let slide = $(this).closest('.th-video-slide');
        if(slide.find('iframe, video').length) return;

        playVideo(slide);
    });

    /* ================= LIGHTBOX ================= */
    $(document).on('click', '.th-video-trigger', function(e){

        e.preventDefault();

        let parent = $(this).closest('.th-video-slide');
        let video  = parent.data('video');
        let type   = parent.data('type');

        let html = buildVideo(video, type);
        if(!html) return;

        $('#th-video-lightbox .th-video-content').html(html);
        $('#th-video-lightbox').addClass('active');
    });

    $(document).on('click', '.th-close', function(){
        $('#th-video-lightbox').removeClass('active');
        $('.th-video-content').html('');
    });

    /* ================= STICKY VIDEO ================= */
    let sticky = false;

    $(window).on('scroll', function(){

        let video = $('.woocommerce-product-gallery iframe, .woocommerce-product-gallery video');

        if(!video.length) return;

        if($(window).scrollTop() > 400 && !sticky){
            video.addClass('th-sticky-video');
            sticky = true;
        }

        if($(window).scrollTop() < 200 && sticky){
            video.removeClass('th-sticky-video');
            sticky = false;
        }

    });

    /* ================= THUMB CLICK ================= */
    $(document).on('click', '.flex-control-thumbs li', function(){

        let index = $(this).index();
        let slides = $('.woocommerce-product-gallery__wrapper .woocommerce-product-gallery__image');
        let targetSlide = slides.eq(index);

        if(targetSlide.hasClass('th-video-slide')){
            setTimeout(function(){
                playVideo(targetSlide);
            }, 300);
        }
    });

    /* ================= ACTIVE CLASS ================= */
    setInterval(function(){

        let currentIndex = $('.flex-control-nav li.flex-active').index();
        if(currentIndex < 0) return;

        $('.flex-control-thumbs li').removeClass('is-active');
        $('.flex-control-thumbs li').eq(currentIndex).addClass('is-active');

    }, 400);

    /* ================= VARIATION ================= */
    $(document).ajaxComplete(function(){

        isInitialized = false;

        setTimeout(function(){
            safeInit();
        }, 600);

    });

});