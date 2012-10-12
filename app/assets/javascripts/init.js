//an example of creating a submodule in the modular pattern introduced in 
//http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth

// following the JS modular pattern here, whereby everything is enclosed inside one
// namespace, named 'mdot' here. Think of this 'mdot' as a huge class in Object Oriented
// speak, and each single JS file is one partial class of that huge class

// init.js:
// as the name suggests, this is the initial entry point of the conversion algorithm
// follow code from the init function

var mdot = (function(my, $) {

  var tmplString = '<!doctype html><html><head>' + 
  "<meta charset='utf-8'>" +
  "<meta name='viewport' content='width=320,initial-scale=0.75' />" + 
  "<link rel='stylesheet' href='assets/jquery.mobile.css' />" +
  "<link rel='stylesheet' href='assets/jqm-icon-pack-2.0-original.css' />" +
  "<link rel='stylesheet' href='assets/mobile/iphone.css' />" +
  "<script src='assets/jquery.js'></script>" +
  "<script src='assets/jquery.mobile.js'></script>" +
  '</head><body>' + 
  "<div data-role='content'>" +
  "<a href='#' data-role='button' data-inline='false' data-icon='phone'>Call Us!</a>" +
  "<a href='#' data-role='button' data-inline='false' data-icon='mappin'>Find Us!</a>" +
  "<ul id='nav' data-role='listview' data-inset='true'></ul>" +
  '</div>' +
  '</body></html>';

  var desktopDoc, mobileDoc;

  // This is a callback to be executed when AJAX returns markup from server, which is
  // what's to be mobilized.
  // This weird returning annon function is a way to get the anchor var passed in as parameter
  // from the closure that initiated the AJAX
  // details here: http://stackoverflow.com/questions/939032/jquery-pass-more-parameters-into-callback
  function renderMarkup(anchor) {
    return function(markup) {
  
      // reset base href to load image sources that use relative URIs 
      // using regex: cannot use $.prepend because we don't have a DOM yet
      // the '?' is to make the matching lazy/non-greedy, ie matching the first '>'
      // it sees rather than the last
      var pat = /<head(.*?)>/gi,
          match = pat.exec(markup);
  
      // adding the <base> immediately after <head>
      markup = markup.replace(pat, '<head ' +
          match[1] +
          '><base href=\'' +
          anchor.protocol +
          '//' +
          anchor.hostname +
          anchor.pathname + '\'  />');
  
  
      var desktopFrame = document.createElement('iframe');
      $(desktopFrame).addClass('preview hidden');
      $('.desktop .screen').append(desktopFrame);
  
      var mobileFrame = document.createElement('iframe');
      $('.mobile .screen').append(mobileFrame);
      $(mobileFrame).addClass('preview hidden');
  
      desktopDoc = desktopFrame.contentWindow.document;
      mobileDoc = mobileFrame.contentWindow.document;
  
      desktopDoc.open();
      mobileDoc.open();
  
      $(desktopFrame).load(function() {
        // processing begins after doc loaded, need to have a DOM first
        // has to be in this order: close immediately following write
        // with the load event handler after 
        mobileDoc.write(tmplString);
        mobileDoc.close();
        $(desktopFrame).removeClass('hidden');
        $('.desktop .loading').remove();
  
        // when done remove frame. Currently commented out because I'm showing off 
        // before and after comparison. If no need for comparison then we can uncomment this
        // and remove the frame when done
        //setTimeout(function() {
          //desktopFrame.parentNode.removeChild(desktopFrame);
        //}, 1000);
      });
  
      $(mobileFrame).load(function($evt) {
        //$evt to get ahold of mobileFrame and its jQuery reference
        var mobileWin = $evt.target.contentWindow;
  
        // since there's no scrollbars, gotta use mousewheel to scroll
        mobileDoc.addEventListener('mousewheel',function(e) {
          e.preventDefault();//to stop the entire page being scrolled
          var scrollTop = $(mobileDoc).scrollTop();
          $(mobileDoc).scrollTop(scrollTop-e.wheelDeltaY);
        }, false);
  
        // setting base href to point to remote to fix urls for resources
        $(mobileDoc).find('head').prepend("<base href='" +
          anchor.protocol +
          '//' +
          anchor.hostname +
          anchor.pathname + "' />");
  
        $(desktopDoc).find('head title').appendTo($(mobileDoc).find('head'));
  
        // calling into main meat of the app - transforming desktop markup into mobile
        // using the iframe's $ object so that we can access jQM's added prototypes
        mdot.mobilize(mobileWin.jQuery("div[data-role='page']"), desktopDoc.body);
  
        // this is a way to remove bad images:
        // http://stackoverflow.com/questions/4317312/want-to-hide-image-when-image-is-not-found-at-the-src-location
        mobileWin.jQuery('img').error(function(){
          this.style.display = 'none';
        });
  
        mobileWin.jQuery('img').each(function() { this.src = this.src; });
  
        $('.mobile .loading').remove();
        $(mobileFrame).removeClass('hidden');

        $('.roundabout-holder').bind('animationStart', function() {
          $(mobileFrame).addClass('hidden');
          $(desktopFrame).addClass('hidden');
        });
        $('.roundabout-holder').bind('animationEnd', function() {
          $(mobileFrame).removeClass('hidden');
          $(desktopFrame).removeClass('hidden');
        });

        $('.roundabout-moveable-item.mobile').bind('blur', function() {
          $(this.firstElementChild).css({
            '-webkit-transform-origin':'0% 0%',
            '-webkit-transform':'scale(0.85)',
            top:'95.2px',
            left:'28.05px'
          });
        });
        $('.roundabout-moveable-item.mobile').bind('focus', function() {
          $(this.firstElementChild).css({
            '-webkit-transform-origin':'0% 0%',
            '-webkit-transform':'none',
            top:'112px',
            left:'33px'
          });
        });

        $('.roundabout-moveable-item.desktop').bind('blur', function() {
          $(this.firstElementChild).css({
            '-webkit-transform-origin':'0% 0%',
            '-webkit-transform':'scale(0.85)',
            top:'95.2px',
            left:'28.05px'
          });
        });
        $('.roundabout-moveable-item.desktop').bind('focus', function() {
          $(this.firstElementChild).css({
            '-webkit-transform-origin':'0% 0%',
            '-webkit-transform':'none',
            top:'112px',
            left:'33px'
          });
        });

  
        $('#action').removeAttr('disabled');
  
        // zoom the contents of the desktop page to fit the iphone width
        $(desktopDoc.body).css({
          'zoom': 256 / desktopDoc.width,
          'overflow-y':'hidden'
        });
  
        desktopDoc.addEventListener('mousewheel',function(e) {
          e.preventDefault();//to stop the entire page being scrolled
          var scrollTop = $(desktopDoc).scrollTop();
          $(desktopDoc).scrollTop(scrollTop-e.wheelDeltaY);
        }, false);
      });
  
      desktopDoc.write(markup);
      desktopDoc.close();
  
    }}
  
  
  // this is supposed to be the place where initialization stuff happens 
  my.init = function() {

    $('.phones').roundabout({
      childSelector:'div',
      clickToFocus:false,
      minScale:0.8,
      minOpacity:0.9
    });

    var isAtBefore = false;

    $('.before').click(function() {
      if(!isAtBefore) $('.phones').roundabout('animateToNextChild');
      isAtBefore = true;
    });
  
    $('.after').click(function() {
      if(isAtBefore) $('.phones').roundabout('animateToPreviousChild');
      isAtBefore = false;
    });

    $('#action').click(function() {
      $(this).attr('disabled', 'disabled');
  
      var anchor = document.createElement('a');
  
      var url = $('#url_input').val() || $('#url_select').val();
  
      anchor.href = url;
  
      // emptying previous contents if any
      $('.screen').empty();
  
      // add loading... animated gif
      $('.screen').append($('<img class=\'loading\'/>')
        .attr('src','assets/loading.gif')
        .css({
          'position':'relative',
          'top':'130px',
          'left':'78px',
        }));
  
      // the AJAX call to get markup from arbitrary domains, side-stepping same-orig
      // restriction by using jsonp:
      // different domains: the server hosting this JS file vs. the server that retrieves
      // markup from arbitrary domains
      $.ajax({
        data: { 
          get: 'markup',
          url: url 
        },
        dataType: 'json',
      }).done(renderMarkup(anchor));// refer to callback comments for why passing anchor
  
    });
  
    //$('#savePageForm').submit(function() {
      //var foo = mobileDoc.documentElement.outerHTML;
      //$('#mobileHtml').val(foo);
    //});
  
  }

  return my;

}(mdot || {}, jQuery));
