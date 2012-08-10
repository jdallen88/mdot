//an example of creating a submodule in the modular pattern introduced in 
//http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth

var mdot = (function(parent, $) {
  var my = parent.util = parent.util || {};

  // JQ's toggle uses 'display-none' which puts markup off layout tree and as a result
  // cannot get realistic w/h info
  my.toggle = function($elem) {
    if($elem.css('visibility')=='hidden')
  $elem.css('visibility','visible');
    else if($elem.css('visibility')=='visible')
  $elem.css('visibility','hidden');
  }

  // empty means no child tag elem, no child text elem, or whose text elem only
  // contains white space character
  // special cases:
  // <img>, elem that has background-image
  my.isEmptyNode = function(elem) {
    if (elem.nodeType != 1) return true; //only considering element node

    // these elements not considered empty
    var keepNodes = ['iframe','img','br','hr','input'];

    if($.inArray(elem.nodeName.toLowerCase(), keepNodes) != -1) return false;

    if(elem.childNodes.length > 0) {
      // if only one child node and it's a text node
      if(elem.childNodes.length==1 && elem.firstChild.nodeType==3) {
        // if this child text node contains nothing but space/tab/newline
        if(!/\S/.test(elem.firstChild.nodeValue)) {
          return true;
          // and if the element node has no bg img
          //if($(elem).css('background-image')=='none' ||
          //$(elem).css('background-image')=='')
          //return true;
          // has one empty text child node but has bg img
          //else 
          //return false;
        }
        // child text node has actual text
        else 
          return false;
      }
      // if more than one child
      else if(elem.childNodes.length > 1) {
        // consider: text node, comment node, text node, etc. but no element node
        for(var idx=0; idx<elem.childNodes.length; idx++) {
          if(elem.childNodes[idx].nodeType == 1 ) 
            // sudden death: as soon as there's one child that's an element
            return false;
          if(elem.childNodes[idx].nodeType==3 && 
              /\S/.test(elem.childNodes[idx].nodeValue))
            return false;
        }
        return true;
      }
      else {
        // only one child
        if(elem.firstChild.nodeType == 1)
          return false;
        return true;
      }
    }
    else
      return true;

    // if no child nodes and no bg img, then empty
    //else if($(elem).css('background-image')=='none' ||
    //$(elem).css('background-image')=='')
    //return true;
    // if no child nodes but has bg img, then NOT empty
    //else
    //return false;
  }

  my.isInvisible = function(elem) {
    // pass for <br> since it is significant
    if(elem.nodeName.toLowerCase() == 'br')
      return false;

    if($(elem).css('display') == 'none') 
      return true;

    if($(elem).css('position')=='absolute' &&
        $(elem).css('clip')=='rect(1px 1px 1px 1px)' ) 
      return true;

    if($(elem).css('width')=='0px' &&
        $(elem).css('height')=='0px' &&
        $(elem).children().length == 0)
      return true;

    if($(elem).css('visibility')=='hidden') return true;
    return false;
  }

  my.table2div = function(index, table) {
    $(table).replaceWith( $(table).html()
        .replace(/<table/gi, "<div class='table'")
        .replace(/<tbody/gi, "<div class='tbody'")
        .replace(/<tr/gi, "<div class='tr'")
        .replace(/<\/tr>/gi, "</div>")
        .replace(/<td/gi, "<div class='td'")
        .replace(/<\/td>/gi, "</div>")
        .replace(/<\/tbody/gi, "<\/div")
        .replace(/<\/table/gi, "<\/div")
        );
  }

  my.findLogo = function(dtBody) {

    var logos = [];
    var imgFileNamePat = /header|index|logo|title/i;
    var hpNamePat = /index|header|home/i;

    // <img> logo

    $(dtBody).find('img:visible').each(function() {

      var found = false;
      var fileName = $(this).url().attr('file');
      var bgImgUrl = $(this).css('background-image');


      if(fileName !='' && imgFileNamePat.test(fileName)) {
        if(fileName.indexOf('google') == -1) //disregarding goog images
      found = true;//<img> has src whose name contains 'logo', 'index', 'title'
      }

      else if( ($(this).attr('class') && $(this).attr('class').indexOf('logo')!=-1) || 
        ($(this).attr('id') && $(this).attr('id').indexOf('logo')!=-1 ) )
        found = true;//<img> whose id/class is 'logo'

      else if(bgImgUrl!='' && bgImgUrl!='none') {
        if(imgFileNamePat.test($.url(bgImgUrl).attr('file')))
      found = true; //<img> has BG img whose name contains 'logo','index','title'
      }

      else {
        var ancestors = $(this).parentsUntil('body').filter(function() {
          if(this.nodeName.toLowerCase()=='a' &&
            ($(this).url().attr('host')==window.location.hostname ||
             hpNamePat.test($(this).url().attr('host'))))
            found = true; // ancestor is <a> pointing at homepage
          if( this.nodeName.toLowerCase()=='div' &&
            ( ($(this).attr('id') && $(this).attr('id').indexOf('logo')!=-1) ||
              ($(this).attr('class') && $(this).attr('class').indexOf('logo')!=-1) ) )
            found = true; // ancestor is a <div> with class/id containing 'logo'
        });

        if(ancestors.length != 0)
          found = true;
      }

      if(found) {
        logos.push(this);
        return false;
      }

    });

    // <div> logo

    $(dtBody).find('div:visible').each(function() {

      var found = false;

      var bgImgUrl = my.extractUrl($(this).css('background-image'));

      if(bgImgUrl!='' && bgImgUrl!='none' && bgImgUrl.indexOf('webkit')==-1) {
        if(imgFileNamePat.test($.url(bgImgUrl).attr('file')))
      found = true; //<div> has BG img whose name matches 
    //else if($(this).attr('id').indexOf('header')!=-1 ||
    //$(this).attr('class').indexOf('header')!=-1)
    //found = true; // <div> that has BG img and has id/class containing 'header'
      }

      if(found) {
        logos.push(this);
        return false;
      }

    });

    // <a> logo

    // finding visible <a>'s who don't have a child <img> element
    $(dtBody).find('a:visible:not(:has(img))').each(function() {

      var found = false;

      var bgImgUrl = my.extractUrl($(this).css('background-image'));
      if(bgImgUrl!='' && bgImgUrl!='none') {
        if(imgFileNamePat.test($.url(bgImgUrl).attr('file')))
      found = true; //<a> has BG img whose name matches 
        else if($(this).url().attr('host')==window.location.hostname ||
          hpNamePat.test($(this).url().attr('host')))
          found = true;
      }

      if(found) {
        logos.push(this);
        return false;
      }

    });

    if(logos.length == 0) return null;
    if(logos.length == 1) return logos[0];

    // the triage algorithm:
    // 1. if one has 'logo' in its name and the others don't, then bingo
    // 2. if more than 1 image has 'logo' then whoever appears first in DOM order wins
    // 3. if none of the images have 'logo' in name, then return the first one in orig array

    var logoInName = [];
    for(var i=0; i<logos.length; i++) {
      var node = logos[i].nodeName.toLowerCase();
      var fileName;
      if(node == 'img')
        fileName = $.url(logos[i].src).attr('file');
      else 
        fileName = $.url(my.extractUrl($(logos[i]).css('background-image'))).attr('file');

      if(fileName.toLowerCase().indexOf('logo')!=-1)
        logoInName.push(logos[i]);
    }

    if(logoInName.length == 0) return logos[0];
    if(logoInName.length == 1) return logoInName[0];

    // sort by document order
    var sortedLogos = logoInName.sort(function(a,b) {
      return 3 - (a.compareDocumentPosition(b) & 6);
    });
    return sortedLogos[0];

    return null;

  }

  my.findBgColor = function(node) {
    var found = false;
    var color = '';

    $(node).parentsUntil('html').each(function() {
      var bgColor = $(this).css('background-color');
      var bgImgUrl = $(this).css('background-image');

      if(bgColor != 'rgba(0, 0, 0, 0)') {// background-color default value: transparent
        found = true;
        color = bgColor;
        return false;
      }
      else if(bgImgUrl!='none' && bgImgUrl!='') {
        color = my.getDominantColor(my.extractUrl(bgImgUrl));
        return false;
      }
    });

    // verify if the contrast between the background color and logo is good
    var logoSrc;
    if(node.nodeName.toLowerCase() == 'img')
      logoSrc = node.src;
    else
      logoSrc = my.extractUrl($(node).css('background-image'));

    var logoDColor = my.getDominantColor(logoSrc);

    if(my.hasGoodContrast(color, logoDColor))
      return 'rgb(' + color.red + ',' + color.green + ',' + color.blue + ')';
          else
          return 'rgb(240,240,240)';
          }

          my.getDominantColor = function(img_url) {
            var color;

            $.ajax({
              async:false,
              data: {
                get: 'dcolor',
                url: img_url
              },
              dataType: 'json'
            }).done(function(data) {
              color = data
            });

            return color
          }

          //http://particletree.com/notebook/calculating-color-contrast-for-legible-text/
          my.hasGoodContrast = function(color1, color2) {
            var brightness1 = (color1.red*299 + color1.green*587 + color1.blue*114) / 1000;
            var brightness2 = (color2.red*299 + color2.green*587 + color2.blue*114) / 1000;
            if(Math.abs(brightness1 - brightness2) > 125)
              return true;
            else
              return false;
          }

          my.getImageSize = function(img_url) {
            var size;

            $.ajax({
              async:false,
              data: {
                get: 'imgsize',
                url: img_url
              },
              dataType: 'json'
            }).done(function(data) {
              size = data
            });

            return size
          }

          my.extractUrl = function(input) {
            // remove quotes and wrapping url()
            return input.replace(/"/g,"").replace(/url\(|\)$/ig, "");
          }

          my.findNav = function(dtBody) {
            var menuItems = [];
            var $navElem;

            // use $('li').has('ul') to test for sub-level menus
            $navElem = $(dtBody).find('div>ul>li a').closest('div').filter(function() {
              var count = $(this).find('*').andSelf().filter('div>ul>li a').length;
              if(count > 4) return true;
              else return false;
            }).first().find('*').andSelf().filter('div>ul>li a');

            if($navElem.length > 0) {
              $navElem.each(function() {
                var txt = $(this).text().trim();
                if(txt != '') {
                  menuItems.push(txt);
                }
              });
            }

            if(menuItems.length > 0) {
              $navElem.addClass('ignore');
              return menuItems;
            }

            var navTables = $(dtBody).find('table>tbody>tr>td a').closest('table');
            $navElem = navTables.filter(function() {
              var count = $(this).find('tbody>tr>td a').length;
              if(count >= 3) return true;
              else return false;
            }).first().find('tbody>tr>td a');

            if($navElem.length > 0) {
              $navElem.each(function() {
                var $img = $(this).find('img');
                if($img.length > 0) {

                  if($img.attr('alt') && $img.attr('alt')!='') {
                    menuItems.push($img.attr('alt'));
                  }
                  else {// grab the href of <a> and camelcase into separate words 

                    var name = $(this).url('true').attr('file');
                    if(name != '') {
                      menuItems.push(name.slice(0, name.indexOf('.'))
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, function(str) { 
                          return str.toUpperCase(); 
                        }));
                    }
                  }
                }
              });
            }

            if(menuItems.length > 0) {
              $navElem.addClass('ignore');
              return menuItems;
            }

            return menuItems;

          }

          // any use for this? This is stripping a particular CSS attribute from the inline style
          // attribute using regex. With JQ, one can simply set .css(prop,'') to remove it
          //function stripWidth(style) {
          //var pat = /[;\s-]?width:\d+px;/i;
          //var match = pat.exec(style);
          //if(match!=null) {
          //var c = match[0][0];
          //if(c!='w' && c!='-') return style.replace(match[0].substring(1),'');
          //else if(c=='w') return style.replace(match[0],'');
          //}
          //}

          return parent;
}(mdot || {}, jQuery));
