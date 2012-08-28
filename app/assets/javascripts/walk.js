
var mdot = (function(my, $) {
    
    // most of these styles only apply to certain elements
    // need to trim them to reduce clutter
    // also, need to trim them if they are default value, e.g. no need to add background
    // prop if background-image=='none'
    var SMALL_IMG_WIDTH = 50;
    var SMALL_IMG_HEIGHT = 50;
    var cssToKeep = ['width','font','color','list-style','display','background'];
    var attribsToIgnore = {
        'align':/left|right/, //removing left/right aligning attributes
        'onload':null, //ridding any onload JSs, e.g. dreamweaver's MM_preloadImages
        'onmouseout':null,
        'onmouseover':null,
    };
    var sliderNamePat = /slider|slideshow/i;

    function walk(node) {

        // gotta preprocess the clones before appending which would trigger the JS to be
        // evaluated

        // make a shallow copy of orig node
        var cloned;
        var nodeName = node.nodeName.toLowerCase();

        // should we ignore this node?
        if(mdot.util.isIgnorable(node)) return null;

        // does this DIV house a slider?
        if(node.className && sliderNamePat.test(node.className))
          return mdot.util.extractSliderImg(node);

        // disregard fixed positioning elements
        if($(node).css('position')=='fixed') {
            return null;
        }

        // only allow FB iframe
        if(nodeName=='iframe') {
            if($(node).attr('src').indexOf('facebook.com')==-1)
                return null;
        }

        if(nodeName == 'body')
            cloned = $('<div />', { class:'body' }).get(0);
        else
            cloned = node.cloneNode(false);

        if(node.nodeType == 1) { 

            // prune attributes
            $.each(attribsToIgnore, function(attr, regex) {
                var origVal = cloned.getAttribute(attr);
                if(origVal) {
                    if(regex && regex.test(origVal)) cloned.removeAttribute(attr);
                    else if(!regex) cloned.removeAttribute(attr);
                }
            });

            // if <img>, then either center it or keep orig props
            if( nodeName == 'img') {

                // if image w h ratio is out of wack, don't use it
                if( (node.width / node.height > 50) ||
                   (node.height / node.width > 50) )
                    return null;

                if(node.width < SMALL_IMG_WIDTH && node.height < SMALL_IMG_HEIGHT) {
                    $(cloned).addClass('smallImg');
                }
                else {
                    $(cloned).removeAttr('width');
                    $(cloned).removeAttr('height');
                }
            }

            // deal with CSS properties
            else {

                // float: unset 'float' if it is specified through inline styles
                // note: for smaller element, we still want to keep 'float'
                if($(cloned).css('float') != 'none') {
                    if($(cloned).width() > 100) // only applies to bigger element
                        $(cloned).css('float', 'none');
                }

                // color: inherit
                var colorVal = $(node).css('color');
                if(colorVal != $(node.parentNode).css('color')) {
                    $(cloned).css('color', colorVal);
                }

                // font: inherit
                var fontVal = $(node).css('font');
                if(fontVal != $(node.parentNode).css('font')) {
                    $(cloned).css('font', fontVal);
                }

                // Disregard all bg images
                //var bgImageVal = $(node).css('background-image');
                //if( (bgImageVal!='none' && bgImageVal!='') || bgColorVal!='rgba(0, 0, 0, 0)') {
                    //if(bgImageVal!='none' && bgImageVal!='') {
                        //// if image w h ratio is out of wack, don't use it
                        //var imagUrl = mdot.util.extractUrl(bgImageVal);
                        //var size = mdot.util.getImageSize(imageUrl);
                        //if( !size ||
                           //(size.width / size.height > 50) ||
                               //(size.height / size.width > 50) )
                            //$(cloned).css('background-image', 'none');
                    //}

                    //$(cloned).css('background', $(node).css('background'));
                //}

                // background-color: no inherit
                var bgColorVal = $(node).css('background-color');
                if( (bgColorVal != 'rgba(0, 0, 0, 0)') &&
                    (nodeName != 'body') ) {
                    $(cloned).css('background-color', $(node).css('background-color'));
                }

                // display: no inherit
                //var displayVal = $(node).css('display');
                //if(displayVal != 'inline') {
                    //$(cloned).css('display', displayVal);
                //}

                // width: no inherit
                var widthVal = parseInt($(node).css('width'));
                // magic number 224: 87.5% of 256, should be 280 for 320px
                if(widthVal>224 || nodeName=='input') {
                    $(cloned).removeAttr('width','');
                    $(cloned).removeAttr('height','');
                    $(cloned).css('width','');
                    $(cloned).css('height','');
                } else {
                    $(cloned).css('width', widthVal);
                }

            }

        } 
        else if(node.nodeType == 3) {
            if(node.nodeValue.indexOf('_____') != -1) {
                cloned = document.createElement('hr');
            }
        }

        node = node.firstChild;

        // special treatment for <cufon>
        if ( node && (node.nodeType == 1) && (node.nodeName.toLowerCase() == 'cufon') ) {
            var str = $(node).text() + $(node).siblings().text();
            cloned.appendChild(document.createTextNode(str));
            return cloned
        }

        while(node) {
            var clonedChild = walk(node);
            if (clonedChild) cloned.appendChild(clonedChild);
            node = node.nextSibling;
        }
        // extra check here to prune the node if it's an empty node
        if(cloned.nodeType==1 && mdot.util.isEmptyNode(cloned)) 
            return null
        else return cloned

    }

    my.mobilize = function($mo, dtBody) {

        var logo = mdot.util.findLogo(dtBody);

        if(logo) {
            $(logo).addClass('ignore'); // do not process already extracted logos

            var $clonedLogo = $(logo).clone();
            var size;

            if($clonedLogo.is('img')) {
                size = mdot.util.getImageSize(logo.src);
            }

            if( (size && (size.width<10 || size.height<10)) || !$clonedLogo.is('img')) {
                $clonedLogo = $('<img />', {
                    src:mdot.util.extractUrl($(logo).css('background-image'))
                });
            }

            $clonedLogo.attr('id','logo').wrap("<div class='logoWrapper' />");
            $clonedLogo.removeAttr('width').removeAttr('height');
            $clonedLogo.parent().prependTo($mo);

            var color = mdot.util.findBgColor(logo);
            if(color != '')
                $clonedLogo.parent().css('background-color', color);
        }

        var navMenu = mdot.util.findNav(dtBody);

        var $nav = $mo.find('#nav');

        // only displaying the first 3 menu options, however how many actual items
        // there are - TODO: figure how to do collapsible listview
        $.each(navMenu.slice(0,3), function() {
            $('<li>').append($('<a>', { href:'#' }).text(this)).appendTo($nav);
        });
        $('<li>').append($('<a>',{href:'#'}).text('More ...')).appendTo($nav);

        // 'listview' exists because we obtain this $ object through the frame's $ reference
        // rather than that of the current doc
        $nav.listview('refresh');

        var content = walk(dtBody);

        // convert table into divs
        $(content).find('table').each(mdot.util.table2div);

        // hiding all sub-level <ul> used for hovers
        // temp solution - what's the menu story?
        $(content).find('li>ul').css('display','none');

        $(content).addClass('mdContent').appendTo($mo);
    }


    return my;
}(mdot || {}, jQuery));

