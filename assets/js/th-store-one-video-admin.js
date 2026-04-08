jQuery(function ($) {
  // Tabs
  $(document).on("click", ".th-tab", function () {
    let tab = $(this).data("tab");

    $(".th-tab").removeClass("active");
    $(this).addClass("active");

    $(".th-panel").removeClass("active");
    $("#th-panel-" + tab).addClass("active");
  });

  // Toggle Label
  function updateToggleLabel(input) {
    let label = input.closest(".th-toggle-wrap").find(".th-toggle-label");

    if (input.prop("checked")) {
      label.text("ON").css("color", "#2271b1");
    } else {
      label.text("OFF").css("color", "#999");
    }
  }

  function toggleFeatured() {
    let el = $("#th_enable_video");

    el.prop("checked")
      ? $(".th-featured-wrap").stop(true, true).slideDown(150)
      : $(".th-featured-wrap").stop(true, true).slideUp(150);

    updateToggleLabel(el);
  }

  function toggleGallery() {
    let el = $("#th_enable_gallery");
    let isOn = el.prop("checked");

    let target = $("#th_gallery_wrap, .th-s1-other, .th-s1-auto-play");

    isOn
      ? target.stop(true, true).slideDown(150)
      : target.stop(true, true).slideUp(150);

    updateToggleLabel(el);
  }

  function toggleUploadButton(scope) {
    // 🔹 Gallery items
    scope.find(".th-item").each(function () {
      let type = $(this).find('select[name="th_gallery_type[]"]').val();
      let btn = $(this).find(".upload");

      if (type === "upload") {
        btn.show();
      } else {
        btn.hide();
      }
    });

    //Featured (top)
    let mainType = $('select[name="th_source"]').val();
    let mainBtn = $(".fetiured-upload-btn");

    if (mainType === "upload") {
      mainBtn.show();
    } else {
      mainBtn.hide();
    }
  }

  // INIT
  setTimeout(function () {
    toggleFeatured();
    toggleGallery();
    toggleUploadButton($(document));
  }, 50);

  // EVENTS
  $(document).on("change", "#th_enable_video", toggleFeatured);
  $(document).on("change", "#th_enable_gallery", toggleGallery);

  // ADD
  $("#add_video").on("click", function () {

    $("#th_gallery_list").append(`
        <li class="th-item">
            <div class="th-item-inner">
                <span class="drag">☰</span>

                <select name="th_gallery_type[]">
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="upload">Upload</option>
                </select>

                <input type="text" name="th_gallery[]">

                <button class="button upload">Upload</button>

                <a href="#" class="remove">
                   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="s1-icon s1-icon-danger"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                </a>
            </div>

            <div class="th-thumb-wrap" style="display:none;">
                
                <div class="th-thumb-left">
                    <div class="th-thumb-preview">
                        <div class="th-thumb-placeholder">No Image</div>
                    </div>
                </div>

                <div class="th-thumb-right">
                    <input type="text"
                        class="th-thumb-input"
                        name="th_gallery_thumb[]"
                        placeholder="Thumbnail URL">

                    <div class="th-thumb-buttons">
                        <button class="button upload-thumb">Upload</button>
                        <a href="#" class="remove-thumb">Remove</a>
                    </div>
                </div>

            </div>
        </li>
    `);

});

  $(document).on(
    "change",
    'select[name="th_gallery_type[]"], select[name="th_source"]',
    function () {
      toggleUploadButton($(document));
    },
  );

  // REMOVE
  $(document).on("click", ".remove", function (e) {
    e.preventDefault();
    $(this).closest("li").remove();
  });

  // UPLOAD
  $(document).on("click", ".upload, .th-upload-btn", function (e) {
    e.preventDefault();

    let button = $(this);

    //FIX: only video input target
    let input = button.closest(".th-item").find('input[name="th_gallery[]"]');

    if (!input.length) {
        input = $('[name="th_video_url"]');
    }

    let frame = wp.media({ multiple: false, library: { type: "video" } });

    frame.on("select", function () {
        let file = frame.state().get("selection").first().toJSON();
        input.val(file.url);
    });

    frame.open();
    });

  $("#th_gallery_list").sortable({ handle: ".drag" });
});


jQuery(function($){

    /* ================= THUMB UPLOAD ================= */
    $(document).on('click','.upload-thumb', function(e){
        e.preventDefault();

        let button = $(this);
        let wrap = button.closest('.th-thumb-wrap');
        let input = wrap.find('.th-thumb-input');
        let preview = wrap.find('.th-thumb-preview');

        let frame = wp.media({
            title: 'Select Thumbnail',
            button: { text: 'Use Thumbnail' },
            multiple: false
        });

        frame.on('select', function(){
            let attachment = frame.state().get('selection').first().toJSON();
            input.val(attachment.url);
            preview.html('<img src="'+attachment.url+'">');
        });

        frame.open();
    });

    /* ================= REMOVE THUMB ================= */
    $(document).on('click','.remove-thumb', function(e){
        e.preventDefault();

        let wrap = $(this).closest('.th-thumb-wrap');
        wrap.find('.th-thumb-input').val('');
        wrap.find('.th-thumb-preview').html('<div class="th-thumb-placeholder">No Image</div>');
    });

    /* ================= SHOW/HIDE THUMB FIELD ================= */
    $(document).on('change','select[name="th_gallery_type[]"]', function(){

        let li = $(this).closest('.th-item');
        let thumbWrap = li.find('.th-thumb-wrap');

        if($(this).val() === 'upload'){
            thumbWrap.slideDown(150);
        }else{
            thumbWrap.slideUp(150);
        }

    });

    /* ================= INIT ON LOAD ================= */
    function initThumbFields(){

    $('select[name="th_gallery_type[]"]').each(function(){

        let li = $(this).closest('.th-item');

        let type = $(this).val();

        let toggleWrap = li.find('.th-thumb-toggle-wrap');
        let uploadWrap = li.find('.th-thumb-upload-wrap');
        let checkbox = li.find('input[name="th_enable_custom_poster[]"]');

        // STEP 1: type check
        if(type === 'upload'){
            toggleWrap.show();

            // STEP 2: toggle check
            if(checkbox.is(':checked')){
                uploadWrap.show();
            } else {
                uploadWrap.hide();
            }

        } else {
            toggleWrap.hide();
            uploadWrap.hide();
        }
    });
}

/* ON TYPE CHANGE */
$(document).on('change', 'select[name="th_gallery_type[]"]', function(){
    initThumbFields();
});

/*ON TOGGLE CHANGE */
$(document).on('change', 'input[name="th_enable_custom_poster[]"]', function(){

    let li = $(this).closest('.th-item');
    let uploadWrap = li.find('.th-thumb-upload-wrap');

    if($(this).is(':checked')){
        uploadWrap.show();
    } else {
        uploadWrap.hide();
    }
});

/* INIT */
initThumbFields();


});