
var mdot = (function(my, $) {

  var tmplString = '<!doctype html><html><head>' + 
  "<meta name='viewport' content='width=320' />" + 
  "<link rel='stylesheet' href='assets/jquery.mobile.css' />" +
  "<link rel='stylesheet' href='assets/jqm-icon-pack-2.0-original.css' />" +
  "<link rel='stylesheet' href='assets/mobile/iphone.css' />" +
  "<script src='assets/jquery.js'></script>" +
  "<script src='assets/jquery.mobile.js'></script>" +
  '</head><body>' + 
  "<div data-role='content'>" +
  "<a href='#' data-role='button' data-inline='true' data-icon='phone'>Call Us!</a>" +
  "<a href='#' data-role='button' data-inline='true' data-icon='mappin'>Find Us!</a>" +
  "<ul id='nav' data-role='listview' data-inset='true'></ul>" +
  '</div>' +
  '</body></html>';

// CB to be executed when AJAX returns markup from server
// this markup is what's to be mobilized
// the weird returning annon func is a way to get the anchor var passed in as parameter
// from the closure that initiated the AJAX
// ref: http://stackoverflow.com/questions/939032/jquery-pass-more-parameters-into-callback
function renderMarkup(anchor) {
  return function(markup) {

    // reset base href to load image sources that use relative URIs 
    // using regex: cannot use $.prepend because we don't have a DOM yet
    // the '?' is to make the matching lazy/non-greedy, ie matching the first '>'
    // it sees rather than the last
    var pat = /<head(.*?)>/gi,
        match = pat.exec(markup);

    // goal: adding the <base> immediately after <head>
    markup = markup.replace(pat, '<head ' +
        match[1] +
        '><base href=\'' +
        anchor.protocol +
        '//' +
        anchor.hostname +
        anchor.pathname + '\'  />');


    var chromeFrame = document.createElement('iframe');
    $('#chrome').append(chromeFrame);

    var iphoneFrame = document.createElement('iframe');
    $('#iphone .screen').append(iphoneFrame);
    $(iphoneFrame).addClass('preview hidden');

    var chromeDoc = chromeFrame.contentWindow.document;
    var iphoneDoc = iphoneFrame.contentWindow.document;

    chromeDoc.open();
    iphoneDoc.open();

    $(chromeFrame).load(function() {
      $('#chrome .loading').remove();
      $(chromeFrame).removeClass('hidden');

      // processing begins after doc loaded, need to have a DOM first
      // has to be in this order: close immediately following write
      // with the load event handler after 
      iphoneDoc.write(tmplString);
      iphoneDoc.close();

      // when done remove frame
      setTimeout(function() {
        chromeFrame.parentNode.removeChild(chromeFrame);
      }, 1000);
    });

    $(iphoneFrame).load(function($evt) {
      //$evt to get ahold of iphoneFrame and its jQuery reference
      var iphoneWin = $evt.target.contentWindow;

      // since there's no scrollbars, gotta use mousewheel to scroll
      iphoneDoc.addEventListener('mousewheel',function(e) {
        e.preventDefault();//to stop the entire page being scrolled
        var scrollTop = $(iphoneDoc).scrollTop();
        $(iphoneDoc).scrollTop(scrollTop-e.wheelDeltaY);

      }, false);

      // setting base href to point to remote to fix urls for resources
      $(iphoneDoc).find('head').prepend("<base href='" +
        anchor.protocol +
        '//' +
        anchor.hostname +
        anchor.pathname + "' />");

      $(chromeDoc).find('head title').appendTo($(iphoneDoc).find('head'));

      // calling into main meat of the app - transforming desktop markup into mobile
      // using the iframe's $ object so that we can access jQM's added prototypes
      mdot.mobilize(iphoneWin.jQuery("div[data-role='page']"), chromeDoc.body);

      // this is a way to remove bad images:
      // http://stackoverflow.com/questions/4317312/want-to-hide-image-when-image-is-not-found-at-the-src-location
      iphoneWin.jQuery('img').error(function(){
        this.style.display = 'none';
      });
      iphoneWin.jQuery('img').each(function() { this.src = this.src; });

      $('#iphone .loading').remove();
      $(iphoneFrame).removeClass('hidden');
    });

    chromeDoc.write(markup);
    chromeDoc.close();
  }}

my.init = function() {

  $('#action').click(function() {
    var url = $('#url').val(),
  anchor = document.createElement('a');

  anchor.href = url;

  // emptying previous contents if any
  $('.screen').empty();

  // add loading... animated gif
  $('.screen').append($('<img class=\'loading\'/>').attr('src','assets/loading.gif').css('margin-top',40));

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
    //url: proxyUrl + '?bustCache=' + Math.random(), // cache always fresh for debug
  }).done(renderMarkup(anchor));// refer to callback comments for why passing anchor

  });
}

return my;
}(mdot || {}, jQuery));
