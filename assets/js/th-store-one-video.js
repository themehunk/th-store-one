jQuery(function($){  
    /* ================= HELPERS ================= */
    function getYouTubeId(url){
        try {
            let u = new URL(url);
            if (u.searchParams.get("v")) return u.searchParams.get("v");
            if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
            if (u.pathname.includes("/embed/")) return u.pathname.split("/embed/")[1];
        } catch(e){}
        return '';
    }

    function getVimeoId(url){
        return url.split('/').pop().split('?')[0];
    }

    function buildVideo(video, type, autoplay, thumb){
        let auto = autoplay ? 1 : 0;
        let mute = autoplay ? 1 : 0;

        if(type === 'youtube'){
            let id = getYouTubeId(video);
            if(!id) return '';
            return `<iframe src="https://www.youtube.com/embed/${id}?autoplay=${auto}&mute=${mute}&rel=0"
                     allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        }

        if(type === 'vimeo'){
            let id = getVimeoId(video);
            return `<iframe src="https://player.vimeo.com/video/${id}?autoplay=${auto}&muted=${mute}"
                     allow="autoplay; fullscreen" allowfullscreen></iframe>`;
        }

        return `<video src="${video}" 
        ${autoplay ? 'autoplay muted' : 'controls'} 
        playsinline 
        preload="metadata"
        poster="${thumb}">
</video>`;
    }

    /* ================= PLAY VIDEO ON SLIDE ================= */
    function playVideo($slide){
        if($slide.find('iframe, video').length) return; 

        let video = $slide.data('video');
        let type  = $slide.data('type') || 'youtube';
        let autoplay = $slide.data('autoplay') == 1;
        let thumb = $slide.data('thumb');

        let html  = buildVideo(video, type, autoplay, thumb);
        if(!html) return;

        // Image ko hide karke video dikhayenge taaki zoom trigger na ho
        let $link = $slide.find('a');

// image ko completely hide nahi karna
$link.css({
    opacity: 0,
    pointerEvents: 'none'
});

// wrapper add karo (agar pehle se nahi hai)
if(!$slide.find('.th-video-wrapper').length){
    $slide.append('<div class="th-video-wrapper">' + html + '</div>');
}
    }

    /* ================= THUMBS & ICONS ================= */
    function modifyVideoThumbs(){
        let $gallery = $('.woocommerce-product-gallery');
        let thumbs = $gallery.find('.flex-control-thumbs > li');
        let slides = $gallery.find('.woocommerce-product-gallery__wrapper .woocommerce-product-gallery__image');
        if(!thumbs.length) return;
         slides.each(function(index){
        if($(this).hasClass('th-video-slide')){
            thumbs.eq(index).addClass('th-video-thumb');
        }
    });

        slides.each(function(index){
            let slide = $(this);
            if(!slide.hasClass('th-video-slide')) return;

            let thumb = slide.data('thumb');
            let li = thumbs.eq(index);

            if(li.length && !li.find('.th-video-thumb-icon').length){
                li.find('img').attr('src', thumb);
                li.css('position','relative');
                let iconType  = thVideoData?.icon || 'outline';
                let iconColor = thVideoData?.color || '#e3e3e3';
                let iconHtml = getVideoIcon(iconType, iconColor);
                li.append(`<span class="th-video-thumb-icon">${iconHtml}</span>`);
            }
        });
    }

    /* ================= EVENT HANDLERS ================= */

    // 1. Click on Slide to Play
    $(document).on('click', '.th-video-slide', function(e){
        
        if($(e.target).closest('.woocommerce-product-gallery__trigger').length) return;
        
        e.preventDefault();
        playVideo($(this));
    });

    // 2. Click on Thumbnail
    $(document).on('click', '.flex-control-thumbs li', function(){
        let index = $(this).index();
        setTimeout(function(){
            let targetSlide = $('.woocommerce-product-gallery__wrapper .woocommerce-product-gallery__image').eq(index);
            if(targetSlide.hasClass('th-video-slide')){
                playVideo(targetSlide);
            }
        }, 300);
    });

    // 3. Fix for Variation & Initial Load
    function runFixes() {
        modifyVideoThumbs();
    }

    $(window).on('load', runFixes);

    /* ================= INITIAL LOAD VIDEO ================= */
function loadInitialVideo(){
    let activeSlide = $('.woocommerce-product-gallery__wrapper .flex-active-slide');
    if(activeSlide.hasClass('th-video-slide')){
        playVideo(activeSlide);
    }
}

/* ================= SLIDE CHANGE VIDEO ================= */
function onSlideChange(){
    setTimeout(function(){
        let activeSlide = $('.woocommerce-product-gallery__wrapper .flex-active-slide');

        // Remove old videos
        $('.th-video-wrapper').remove();
        $('.th-video-slide a').css('visibility','visible');

        if(activeSlide.hasClass('th-video-slide')){
            playVideo(activeSlide);
        }
    }, 400);
}

$(window).on('load', function(){
    loadInitialVideo();
});

/* Flexslider change detect */
$(document).on('click', '.flex-control-thumbs li', onSlideChange);
$(document).on('click', '.flex-next, .flex-prev', onSlideChange);
    
    // Ajax complete ki jagah WooCommerce variation event use karein (STUCK FIX)
    $(document).on('found_variation', 'form.variations_form', function() {
        setTimeout(runFixes, 500);
    });

    /* ================= SHOP LOOP VIDEO ================= */
    $(document).on('click', '.th-loop-video .th-video-play', function(e){
        e.preventDefault();
        let wrap = $(this).closest('.th-video-wrap');
        let url = wrap.data('src');
        wrap.html(`<video src="${url}" autoplay controls muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>`);
    });

function getVideoIcon(type, color){

    switch(type){

        case 'triangle':
            return `<svg viewBox="0 0 24 24" width="34" height="34">
                <polygon points="8,5 19,12 8,19" fill="${color}"/>
            </svg>`;

        case 'camera':
            return `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="${color}" stroke-width="2">
                <rect x="3" y="6" width="11" height="12" rx="2"></rect>
                <polygon points="16,9 21,6 21,18 16,15"></polygon>
            </svg>`;

        case 'youtube':
            return `<svg viewBox="0 0 68 48" width="34" height="24">
                <rect width="68" height="48" rx="10" fill="${color}"/>
                <polygon points="28,18 28,30 42,24" fill="#fff"/>
            </svg>`;

        case 'circle':
            return `<svg viewBox="0 0 24 24" width="34" height="34">
                <circle cx="12" cy="12" r="10" fill="${color}"/>
                <polygon points="10,8 16,12 10,16" fill="#fff"/>
            </svg>`;

        default:
            return `<svg width="34" height="34" fill="${color}" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                <path d="M10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"/>
            </svg>`;
    }
}
});

