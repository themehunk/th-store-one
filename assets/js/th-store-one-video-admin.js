jQuery(function($){

    // Tabs
    $(document).on('click','.th-tab', function(){
        let tab = $(this).data('tab');

        $('.th-tab').removeClass('active');
        $(this).addClass('active');

        $('.th-panel').removeClass('active');
        $('#th-panel-' + tab).addClass('active');
    });

    // Toggle Label
    function updateToggleLabel(input){
        let label = input.closest('.th-toggle-wrap').find('.th-toggle-label');

        if(input.prop('checked')){
            label.text('ON').css('color','#2271b1');
        } else {
            label.text('OFF').css('color','#999');
        }
    }

    function toggleFeatured(){
        let el = $('#th_enable_video');

        el.prop('checked')
            ? $('.th-featured-wrap').stop(true,true).slideDown(150)
            : $('.th-featured-wrap').stop(true,true).slideUp(150);

        updateToggleLabel(el);
    }

    function toggleGallery(){
        let el = $('#th_enable_gallery');

        el.prop('checked')
            ? $('#th_gallery_wrap').stop(true,true).slideDown(150)
            : $('#th_gallery_wrap').stop(true,true).slideUp(150);

        updateToggleLabel(el);
    }

    // INIT
    setTimeout(function(){
        toggleFeatured();
        toggleGallery();
    }, 50);

    // EVENTS
    $(document).on('change','#th_enable_video',toggleFeatured);
    $(document).on('change','#th_enable_gallery',toggleGallery);

    // ADD
    $('#add_video').on('click', function(){
        $('#th_gallery_list').append(`
            <li class="th-item">
                <span class="drag">☰</span>
                <select name="th_gallery_type[]">
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="upload">Upload</option>
                </select>
                <input type="text" name="th_gallery[]">
                <button class="button upload">Upload</button>
                <a href="#" class="remove"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="s1-icon s1-icon-danger"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></a>
            </li>
        `);
    });

    // REMOVE
    $(document).on('click','.remove',function(e){
        e.preventDefault();
        $(this).closest('li').remove();
    });

    // UPLOAD
    $(document).on('click','.upload, .th-upload-btn',function(e){
        e.preventDefault();

        let input = $(this).closest('.th-item').find('input');
        if(!input.length){
            input = $('[name="th_video_url"]');
        }

        let frame = wp.media({multiple:false,library:{type:'video'}});
        frame.on('select',function(){
            let file = frame.state().get('selection').first().toJSON();
            input.val(file.url);
        });
        frame.open();
    });

    $('#th_gallery_list').sortable({handle:'.drag'});

});