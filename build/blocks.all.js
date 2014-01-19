/**
 * jQuery JSON plugin 2.4.0
 *
 * @author Brantley Harris, 2009-2011
 * @author Timo Tijhof, 2011-2012
 * @source This plugin is heavily influenced by MochiKit's serializeJSON, which is
 *         copyrighted 2005 by Bob Ippolito.
 * @source Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 *         website's http://www.json.org/json2.js, which proclaims:
 *         "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 *         I uphold.
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function ($) {
    'use strict';

    var escape = /["\\\x00-\x1f\x7f-\x9f]/g,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        hasOwn = Object.prototype.hasOwnProperty;

    /**
     * jQuery.toJSON
     * Converts the given argument into a JSON representation.
     *
     * @param o {Mixed} The json-serializable *thing* to be converted
     *
     * If an object has a toJSON prototype, that will be used to get the representation.
     * Non-integer/string keys are skipped in the object, as are keys that point to a
     * function.
     *
     */
    $.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function (o) {
        if (o === null) {
            return 'null';
        }

        var pairs, k, name, val,
            type = $.type(o);

        if (type === 'undefined') {
            return undefined;
        }

        // Also covers instantiated Number and Boolean objects,
        // which are typeof 'object' but thanks to $.type, we
        // catch them here. I don't know whether it is right
        // or wrong that instantiated primitives are not
        // exported to JSON as an {"object":..}.
        // We choose this path because that's what the browsers did.
        if (type === 'number' || type === 'boolean') {
            return String(o);
        }
        if (type === 'string') {
            return $.quoteString(o);
        }
        if (typeof o.toJSON === 'function') {
            return $.toJSON(o.toJSON());
        }
        if (type === 'date') {
            var month = o.getUTCMonth() + 1,
                day = o.getUTCDate(),
                year = o.getUTCFullYear(),
                hours = o.getUTCHours(),
                minutes = o.getUTCMinutes(),
                seconds = o.getUTCSeconds(),
                milli = o.getUTCMilliseconds();

            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            if (milli < 100) {
                milli = '0' + milli;
            }
            if (milli < 10) {
                milli = '0' + milli;
            }
            return '"' + year + '-' + month + '-' + day + 'T' +
                hours + ':' + minutes + ':' + seconds +
                '.' + milli + 'Z"';
        }

        pairs = [];

        if ($.isArray(o)) {
            for (k = 0; k < o.length; k++) {
                pairs.push($.toJSON(o[k]) || 'null');
            }
            return '[' + pairs.join(',') + ']';
        }

        // Any other object (plain object, RegExp, ..)
        // Need to do typeof instead of $.type, because we also
        // want to catch non-plain objects.
        if (typeof o === 'object') {
            for (k in o) {
                // Only include own properties,
                // Filter out inherited prototypes
                if (hasOwn.call(o, k)) {
                    // Keys must be numerical or string. Skip others
                    type = typeof k;
                    if (type === 'number') {
                        name = '"' + k + '"';
                    } else if (type === 'string') {
                        name = $.quoteString(k);
                    } else {
                        continue;
                    }
                    type = typeof o[k];

                    // Invalid values like these return undefined
                    // from toJSON, however those object members
                    // shouldn't be included in the JSON string at all.
                    if (type !== 'function' && type !== 'undefined') {
                        val = $.toJSON(o[k]);
                        pairs.push(name + ':' + val);
                    }
                }
            }
            return '{' + pairs.join(',') + '}';
        }
    };

    /**
     * jQuery.evalJSON
     * Evaluates a given json string.
     *
     * @param str {String}
     */
    $.evalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        /*jshint evil: true */
        return eval('(' + str + ')');
    };

    /**
     * jQuery.secureEvalJSON
     * Evals JSON in a way that is *more* secure.
     *
     * @param str {String}
     */
    $.secureEvalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        var filtered =
            str
            .replace(/\\["\\\/bfnrtu]/g, '@')
            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
            .replace(/(?:^|:|,)(?:\s*\[)+/g, '');

        if (/^[\],:{}\s]*$/.test(filtered)) {
            /*jshint evil: true */
            return eval('(' + str + ')');
        }
        throw new SyntaxError('Error parsing JSON, source is not valid.');
    };

    /**
     * jQuery.quoteString
     * Returns a string-repr of a string, escaping quotes intelligently.
     * Mostly a support function for toJSON.
     * Examples:
     * >>> jQuery.quoteString('apple')
     * "apple"
     *
     * >>> jQuery.quoteString('"Where are we going?", she asked.')
     * "\"Where are we going?\", she asked."
     */
    $.quoteString = function (str) {
        if (str.match(escape)) {
            return '"' + str.replace(escape, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + str + '"';
    };

}(jQuery));
/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);
$.fn.serializeForm = function()
{
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};

$.fn.unserializeForm = function(data)
{
    var setValue = function(input, value) {
        if (input.attr('type') == 'checkbox') {
            value = !!value;
            input.attr('checked', value);
        } else {
            input.val(value);
        }
    };

    for (key in data) {
        var value = data[key];
        var input = $('*[name="'+key+'"]');

        if (value instanceof Array) {
            for (k in value) {
                setValue($(input[k]), value[k]);
            }
        } else {
            setValue(input, value);
        }
    }
};
/* http://keith-wood.name/svg.html
   SVG for jQuery v1.4.5.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2007.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */
(function($){function SVGManager(){this._settings=[];this._extensions=[];this.regional=[];this.regional['']={errorLoadingText:'Error loading',notSupportedText:'This browser does not support SVG'};this.local=this.regional[''];this._uuid=new Date().getTime();this._renesis=detectActiveX('RenesisX.RenesisCtrl')}function detectActiveX(a){try{return!!(window.ActiveXObject&&new ActiveXObject(a))}catch(e){return false}}var q='svgwrapper';$.extend(SVGManager.prototype,{markerClassName:'hasSVG',svgNS:'http://www.w3.org/2000/svg',xlinkNS:'http://www.w3.org/1999/xlink',_wrapperClass:SVGWrapper,_attrNames:{class_:'class',in_:'in',alignmentBaseline:'alignment-baseline',baselineShift:'baseline-shift',clipPath:'clip-path',clipRule:'clip-rule',colorInterpolation:'color-interpolation',colorInterpolationFilters:'color-interpolation-filters',colorRendering:'color-rendering',dominantBaseline:'dominant-baseline',enableBackground:'enable-background',fillOpacity:'fill-opacity',fillRule:'fill-rule',floodColor:'flood-color',floodOpacity:'flood-opacity',fontFamily:'font-family',fontSize:'font-size',fontSizeAdjust:'font-size-adjust',fontStretch:'font-stretch',fontStyle:'font-style',fontVariant:'font-variant',fontWeight:'font-weight',glyphOrientationHorizontal:'glyph-orientation-horizontal',glyphOrientationVertical:'glyph-orientation-vertical',horizAdvX:'horiz-adv-x',horizOriginX:'horiz-origin-x',imageRendering:'image-rendering',letterSpacing:'letter-spacing',lightingColor:'lighting-color',markerEnd:'marker-end',markerMid:'marker-mid',markerStart:'marker-start',stopColor:'stop-color',stopOpacity:'stop-opacity',strikethroughPosition:'strikethrough-position',strikethroughThickness:'strikethrough-thickness',strokeDashArray:'stroke-dasharray',strokeDashOffset:'stroke-dashoffset',strokeLineCap:'stroke-linecap',strokeLineJoin:'stroke-linejoin',strokeMiterLimit:'stroke-miterlimit',strokeOpacity:'stroke-opacity',strokeWidth:'stroke-width',textAnchor:'text-anchor',textDecoration:'text-decoration',textRendering:'text-rendering',underlinePosition:'underline-position',underlineThickness:'underline-thickness',vertAdvY:'vert-adv-y',vertOriginY:'vert-origin-y',wordSpacing:'word-spacing',writingMode:'writing-mode'},_attachSVG:function(a,b){var c=(a.namespaceURI==this.svgNS?a:null);var a=(c?null:a);if($(a||c).hasClass(this.markerClassName)){return}if(typeof b=='string'){b={loadURL:b}}else if(typeof b=='function'){b={onLoad:b}}$(a||c).addClass(this.markerClassName);try{if(!c){c=document.createElementNS(this.svgNS,'svg');c.setAttribute('version','1.1');if(a.clientWidth>0){c.setAttribute('width',a.clientWidth)}if(a.clientHeight>0){c.setAttribute('height',a.clientHeight)}a.appendChild(c)}this._afterLoad(a,c,b||{})}catch(e){if($.browser.msie){if(!a.id){a.id='svg'+(this._uuid++)}this._settings[a.id]=b;a.innerHTML='<embed type="image/svg+xml" width="100%" '+'height="100%" src="'+(b.initPath||'')+'blank.svg" '+'pluginspage="http://www.adobe.com/svg/viewer/install/main.html"/>'}else{a.innerHTML='<p class="svg_error">'+this.local.notSupportedText+'</p>'}}},_registerSVG:function(){for(var i=0;i<document.embeds.length;i++){var a=document.embeds[i].parentNode;if(!$(a).hasClass($.svg.markerClassName)||$.data(a,q)){continue}var b=null;try{b=document.embeds[i].getSVGDocument()}catch(e){setTimeout($.svg._registerSVG,250);return}b=(b?b.documentElement:null);if(b){$.svg._afterLoad(a,b)}}},_afterLoad:function(a,b,c){var c=c||this._settings[a.id];this._settings[a?a.id:'']=null;var d=new this._wrapperClass(b,a);$.data(a||b,q,d);try{if(c.loadURL){d.load(c.loadURL,c)}if(c.settings){d.configure(c.settings)}if(c.onLoad&&!c.loadURL){c.onLoad.apply(a||b,[d])}}catch(e){alert(e)}},_getSVG:function(a){a=(typeof a=='string'?$(a)[0]:(a.jquery?a[0]:a));return $.data(a,q)},_destroySVG:function(a){var b=$(a);if(!b.hasClass(this.markerClassName)){return}b.removeClass(this.markerClassName);if(a.namespaceURI!=this.svgNS){b.empty()}$.removeData(a,q)},addExtension:function(a,b){this._extensions.push([a,b])},isSVGElem:function(a){return(a.nodeType==1&&a.namespaceURI==$.svg.svgNS)}});function SVGWrapper(a,b){this._svg=a;this._container=b;for(var i=0;i<$.svg._extensions.length;i++){var c=$.svg._extensions[i];this[c[0]]=new c[1](this)}}$.extend(SVGWrapper.prototype,{_width:function(){return(this._container?this._container.clientWidth:this._svg.width)},_height:function(){return(this._container?this._container.clientHeight:this._svg.height)},root:function(){return this._svg},configure:function(a,b,c){if(!a.nodeName){c=b;b=a;a=this._svg}if(c){for(var i=a.attributes.length-1;i>=0;i--){var d=a.attributes.item(i);if(!(d.nodeName=='onload'||d.nodeName=='version'||d.nodeName.substring(0,5)=='xmlns')){a.attributes.removeNamedItem(d.nodeName)}}}for(var e in b){a.setAttribute($.svg._attrNames[e]||e,b[e])}return this},getElementById:function(a){return this._svg.ownerDocument.getElementById(a)},change:function(a,b){if(a){for(var c in b){if(b[c]==null){a.removeAttribute($.svg._attrNames[c]||c)}else{a.setAttribute($.svg._attrNames[c]||c,b[c])}}}return this},_args:function(b,c,d){c.splice(0,0,'parent');c.splice(c.length,0,'settings');var e={};var f=0;if(b[0]!=null&&b[0].jquery){b[0]=b[0][0]}if(b[0]!=null&&!(typeof b[0]=='object'&&b[0].nodeName)){e['parent']=null;f=1}for(var i=0;i<b.length;i++){e[c[i+f]]=b[i]}if(d){$.each(d,function(i,a){if(typeof e[a]=='object'){e.settings=e[a];e[a]=null}})}return e},title:function(a,b,c){var d=this._args(arguments,['text']);var e=this._makeNode(d.parent,'title',d.settings||{});e.appendChild(this._svg.ownerDocument.createTextNode(d.text));return e},describe:function(a,b,c){var d=this._args(arguments,['text']);var e=this._makeNode(d.parent,'desc',d.settings||{});e.appendChild(this._svg.ownerDocument.createTextNode(d.text));return e},defs:function(a,b,c){var d=this._args(arguments,['id'],['id']);return this._makeNode(d.parent,'defs',$.extend((d.id?{id:d.id}:{}),d.settings||{}))},symbol:function(a,b,c,d,e,f,g){var h=this._args(arguments,['id','x1','y1','width','height']);return this._makeNode(h.parent,'symbol',$.extend({id:h.id,viewBox:h.x1+' '+h.y1+' '+h.width+' '+h.height},h.settings||{}))},marker:function(a,b,c,d,e,f,g,h){var i=this._args(arguments,['id','refX','refY','mWidth','mHeight','orient'],['orient']);return this._makeNode(i.parent,'marker',$.extend({id:i.id,refX:i.refX,refY:i.refY,markerWidth:i.mWidth,markerHeight:i.mHeight,orient:i.orient||'auto'},i.settings||{}))},style:function(a,b,c){var d=this._args(arguments,['styles']);var e=this._makeNode(d.parent,'style',$.extend({type:'text/css'},d.settings||{}));e.appendChild(this._svg.ownerDocument.createTextNode(d.styles));if($.browser.opera){$('head').append('<style type="text/css">'+d.styles+'</style>')}return e},script:function(a,b,c,d){var e=this._args(arguments,['script','type'],['type']);var f=this._makeNode(e.parent,'script',$.extend({type:e.type||'text/javascript'},e.settings||{}));f.appendChild(this._svg.ownerDocument.createTextNode(e.script));if(!$.browser.mozilla){$.globalEval(e.script)}return f},linearGradient:function(a,b,c,d,e,f,g,h){var i=this._args(arguments,['id','stops','x1','y1','x2','y2'],['x1']);var j=$.extend({id:i.id},(i.x1!=null?{x1:i.x1,y1:i.y1,x2:i.x2,y2:i.y2}:{}));return this._gradient(i.parent,'linearGradient',$.extend(j,i.settings||{}),i.stops)},radialGradient:function(a,b,c,d,e,r,f,g,h){var i=this._args(arguments,['id','stops','cx','cy','r','fx','fy'],['cx']);var j=$.extend({id:i.id},(i.cx!=null?{cx:i.cx,cy:i.cy,r:i.r,fx:i.fx,fy:i.fy}:{}));return this._gradient(i.parent,'radialGradient',$.extend(j,i.settings||{}),i.stops)},_gradient:function(a,b,c,d){var e=this._makeNode(a,b,c);for(var i=0;i<d.length;i++){var f=d[i];this._makeNode(e,'stop',$.extend({offset:f[0],stopColor:f[1]},(f[2]!=null?{stopOpacity:f[2]}:{})))}return e},pattern:function(a,b,x,y,c,d,e,f,g,h,i){var j=this._args(arguments,['id','x','y','width','height','vx','vy','vwidth','vheight'],['vx']);var k=$.extend({id:j.id,x:j.x,y:j.y,width:j.width,height:j.height},(j.vx!=null?{viewBox:j.vx+' '+j.vy+' '+j.vwidth+' '+j.vheight}:{}));return this._makeNode(j.parent,'pattern',$.extend(k,j.settings||{}))},clipPath:function(a,b,c,d){var e=this._args(arguments,['id','units']);e.units=e.units||'userSpaceOnUse';return this._makeNode(e.parent,'clipPath',$.extend({id:e.id,clipPathUnits:e.units},e.settings||{}))},mask:function(a,b,x,y,c,d,e){var f=this._args(arguments,['id','x','y','width','height']);return this._makeNode(f.parent,'mask',$.extend({id:f.id,x:f.x,y:f.y,width:f.width,height:f.height},f.settings||{}))},createPath:function(){return new SVGPath()},createText:function(){return new SVGText()},svg:function(a,x,y,b,c,d,e,f,g,h){var i=this._args(arguments,['x','y','width','height','vx','vy','vwidth','vheight'],['vx']);var j=$.extend({x:i.x,y:i.y,width:i.width,height:i.height},(i.vx!=null?{viewBox:i.vx+' '+i.vy+' '+i.vwidth+' '+i.vheight}:{}));return this._makeNode(i.parent,'svg',$.extend(j,i.settings||{}))},group:function(a,b,c){var d=this._args(arguments,['id'],['id']);return this._makeNode(d.parent,'g',$.extend({id:d.id},d.settings||{}))},use:function(a,x,y,b,c,d,e){var f=this._args(arguments,['x','y','width','height','ref']);if(typeof f.x=='string'){f.ref=f.x;f.settings=f.y;f.x=f.y=f.width=f.height=null}var g=this._makeNode(f.parent,'use',$.extend({x:f.x,y:f.y,width:f.width,height:f.height},f.settings||{}));g.setAttributeNS($.svg.xlinkNS,'href',f.ref);return g},link:function(a,b,c){var d=this._args(arguments,['ref']);var e=this._makeNode(d.parent,'a',d.settings);e.setAttributeNS($.svg.xlinkNS,'href',d.ref);return e},image:function(a,x,y,b,c,d,e){var f=this._args(arguments,['x','y','width','height','ref']);var g=this._makeNode(f.parent,'image',$.extend({x:f.x,y:f.y,width:f.width,height:f.height},f.settings||{}));g.setAttributeNS($.svg.xlinkNS,'href',f.ref);return g},path:function(a,b,c){var d=this._args(arguments,['path']);return this._makeNode(d.parent,'path',$.extend({d:(d.path.path?d.path.path():d.path)},d.settings||{}))},rect:function(a,x,y,b,c,d,e,f){var g=this._args(arguments,['x','y','width','height','rx','ry'],['rx']);return this._makeNode(g.parent,'rect',$.extend({x:g.x,y:g.y,width:g.width,height:g.height},(g.rx?{rx:g.rx,ry:g.ry}:{}),g.settings||{}))},circle:function(a,b,c,r,d){var e=this._args(arguments,['cx','cy','r']);return this._makeNode(e.parent,'circle',$.extend({cx:e.cx,cy:e.cy,r:e.r},e.settings||{}))},ellipse:function(a,b,c,d,e,f){var g=this._args(arguments,['cx','cy','rx','ry']);return this._makeNode(g.parent,'ellipse',$.extend({cx:g.cx,cy:g.cy,rx:g.rx,ry:g.ry},g.settings||{}))},line:function(a,b,c,d,e,f){var g=this._args(arguments,['x1','y1','x2','y2']);return this._makeNode(g.parent,'line',$.extend({x1:g.x1,y1:g.y1,x2:g.x2,y2:g.y2},g.settings||{}))},polyline:function(a,b,c){var d=this._args(arguments,['points']);return this._poly(d.parent,'polyline',d.points,d.settings)},polygon:function(a,b,c){var d=this._args(arguments,['points']);return this._poly(d.parent,'polygon',d.points,d.settings)},_poly:function(a,b,c,d){var e='';for(var i=0;i<c.length;i++){e+=c[i].join()+' '}return this._makeNode(a,b,$.extend({points:$.trim(e)},d||{}))},text:function(a,x,y,b,c){var d=this._args(arguments,['x','y','value']);if(typeof d.x=='string'&&arguments.length<4){d.value=d.x;d.settings=d.y;d.x=d.y=null}return this._text(d.parent,'text',d.value,$.extend({x:(d.x&&isArray(d.x)?d.x.join(' '):d.x),y:(d.y&&isArray(d.y)?d.y.join(' '):d.y)},d.settings||{}))},textpath:function(a,b,c,d){var e=this._args(arguments,['path','value']);var f=this._text(e.parent,'textPath',e.value,e.settings||{});f.setAttributeNS($.svg.xlinkNS,'href',e.path);return f},_text:function(a,b,c,d){var e=this._makeNode(a,b,d);if(typeof c=='string'){e.appendChild(e.ownerDocument.createTextNode(c))}else{for(var i=0;i<c._parts.length;i++){var f=c._parts[i];if(f[0]=='tspan'){var g=this._makeNode(e,f[0],f[2]);g.appendChild(e.ownerDocument.createTextNode(f[1]));e.appendChild(g)}else if(f[0]=='tref'){var g=this._makeNode(e,f[0],f[2]);g.setAttributeNS($.svg.xlinkNS,'href',f[1]);e.appendChild(g)}else if(f[0]=='textpath'){var h=$.extend({},f[2]);h.href=null;var g=this._makeNode(e,f[0],h);g.setAttributeNS($.svg.xlinkNS,'href',f[2].href);g.appendChild(e.ownerDocument.createTextNode(f[1]));e.appendChild(g)}else{e.appendChild(e.ownerDocument.createTextNode(f[1]))}}}return e},other:function(a,b,c){var d=this._args(arguments,['name']);return this._makeNode(d.parent,d.name,d.settings||{})},_makeNode:function(a,b,c){a=a||this._svg;var d=this._svg.ownerDocument.createElementNS($.svg.svgNS,b);for(var b in c){var e=c[b];if(e!=null&&e!=null&&(typeof e!='string'||e!='')){d.setAttribute($.svg._attrNames[b]||b,e)}}a.appendChild(d);return d},add:function(b,c){var d=this._args((arguments.length==1?[null,b]:arguments),['node']);var f=this;d.parent=d.parent||this._svg;d.node=(d.node.jquery?d.node:$(d.node));try{if($.svg._renesis){throw'Force traversal';}d.parent.appendChild(d.node.cloneNode(true))}catch(e){d.node.each(function(){var a=f._cloneAsSVG(this);if(a){d.parent.appendChild(a)}})}return this},clone:function(b,c){var d=this;var e=this._args((arguments.length==1?[null,b]:arguments),['node']);e.parent=e.parent||this._svg;e.node=(e.node.jquery?e.node:$(e.node));var f=[];e.node.each(function(){var a=d._cloneAsSVG(this);if(a){a.id='';e.parent.appendChild(a);f.push(a)}});return f},_cloneAsSVG:function(a){var b=null;if(a.nodeType==1){b=this._svg.ownerDocument.createElementNS($.svg.svgNS,this._checkName(a.nodeName));for(var i=0;i<a.attributes.length;i++){var c=a.attributes.item(i);if(c.nodeName!='xmlns'&&c.nodeValue){if(c.prefix=='xlink'){b.setAttributeNS($.svg.xlinkNS,c.localName||c.baseName,c.nodeValue)}else{b.setAttribute(this._checkName(c.nodeName),c.nodeValue)}}}for(var i=0;i<a.childNodes.length;i++){var d=this._cloneAsSVG(a.childNodes[i]);if(d){b.appendChild(d)}}}else if(a.nodeType==3){if($.trim(a.nodeValue)){b=this._svg.ownerDocument.createTextNode(a.nodeValue)}}else if(a.nodeType==4){if($.trim(a.nodeValue)){try{b=this._svg.ownerDocument.createCDATASection(a.nodeValue)}catch(e){b=this._svg.ownerDocument.createTextNode(a.nodeValue.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'))}}}return b},_checkName:function(a){a=(a.substring(0,1)>='A'&&a.substring(0,1)<='Z'?a.toLowerCase():a);return(a.substring(0,4)=='svg:'?a.substring(4):a)},load:function(j,k){k=(typeof k=='boolean'?{addTo:k}:(typeof k=='function'?{onLoad:k}:(typeof k=='string'?{parent:k}:(typeof k=='object'&&k.nodeName?{parent:k}:(typeof k=='object'&&k.jquery?{parent:k}:k||{})))));if(!k.parent&&!k.addTo){this.clear(false)}var l=[this._svg.getAttribute('width'),this._svg.getAttribute('height')];var m=this;var n=function(a){a=$.svg.local.errorLoadingText+': '+a;if(k.onLoad){k.onLoad.apply(m._container||m._svg,[m,a])}else{m.text(null,10,20,a)}};var o=function(a){var b=new ActiveXObject('Microsoft.XMLDOM');b.validateOnParse=false;b.resolveExternals=false;b.async=false;b.loadXML(a);if(b.parseError.errorCode!=0){n(b.parseError.reason);return null}return b};var p=function(a){if(!a){return}if(a.documentElement.nodeName!='svg'){var b=a.getElementsByTagName('parsererror');var c=(b.length?b[0].getElementsByTagName('div'):[]);n(!b.length?'???':(c.length?c[0]:b[0]).firstChild.nodeValue);return}var d=(k.parent?$(k.parent)[0]:m._svg);var f={};for(var i=0;i<a.documentElement.attributes.length;i++){var g=a.documentElement.attributes.item(i);if(!(g.nodeName=='version'||g.nodeName.substring(0,5)=='xmlns')){f[g.nodeName]=g.nodeValue}}m.configure(d,f,!k.parent);var h=a.documentElement.childNodes;for(var i=0;i<h.length;i++){try{if($.svg._renesis){throw'Force traversal';}d.appendChild(m._svg.ownerDocument.importNode(h[i],true));if(h[i].nodeName=='script'){$.globalEval(h[i].textContent)}}catch(e){m.add(d,h[i])}}if(!k.changeSize){m.configure(d,{width:l[0],height:l[1]})}if(k.onLoad){k.onLoad.apply(m._container||m._svg,[m])}};if(j.match('<svg')){p($.browser.msie?o(j):new DOMParser().parseFromString(j,'text/xml'))}else{$.ajax({url:j,dataType:($.browser.msie?'text':'xml'),success:function(a){p($.browser.msie?o(a):a)},error:function(a,b,c){n(b+(c?' '+c.message:''))}})}return this},remove:function(a){a=(a.jquery?a[0]:a);a.parentNode.removeChild(a);return this},clear:function(a){if(a){this.configure({},true)}while(this._svg.firstChild){this._svg.removeChild(this._svg.firstChild)}return this},toSVG:function(a){a=a||this._svg;return(typeof XMLSerializer=='undefined'?this._toSVG(a):new XMLSerializer().serializeToString(a))},_toSVG:function(a){var b='';if(!a){return b}if(a.nodeType==3){b=a.nodeValue}else if(a.nodeType==4){b='<![CDATA['+a.nodeValue+']]>'}else{b='<'+a.nodeName;if(a.attributes){for(var i=0;i<a.attributes.length;i++){var c=a.attributes.item(i);if(!($.trim(c.nodeValue)==''||c.nodeValue.match(/^\[object/)||c.nodeValue.match(/^function/))){b+=' '+(c.namespaceURI==$.svg.xlinkNS?'xlink:':'')+c.nodeName+'="'+c.nodeValue+'"'}}}if(a.firstChild){b+='>';var d=a.firstChild;while(d){b+=this._toSVG(d);d=d.nextSibling}b+='</'+a.nodeName+'>'}else{b+='/>'}}return b}});function SVGPath(){this._path=''}$.extend(SVGPath.prototype,{reset:function(){this._path='';return this},move:function(x,y,a){a=(isArray(x)?y:a);return this._coords((a?'m':'M'),x,y)},line:function(x,y,a){a=(isArray(x)?y:a);return this._coords((a?'l':'L'),x,y)},horiz:function(x,a){this._path+=(a?'h':'H')+(isArray(x)?x.join(' '):x);return this},vert:function(y,a){this._path+=(a?'v':'V')+(isArray(y)?y.join(' '):y);return this},curveC:function(a,b,c,d,x,y,e){e=(isArray(a)?b:e);return this._coords((e?'c':'C'),a,b,c,d,x,y)},smoothC:function(a,b,x,y,c){c=(isArray(a)?b:c);return this._coords((c?'s':'S'),a,b,x,y)},curveQ:function(a,b,x,y,c){c=(isArray(a)?b:c);return this._coords((c?'q':'Q'),a,b,x,y)},smoothQ:function(x,y,a){a=(isArray(x)?y:a);return this._coords((a?'t':'T'),x,y)},_coords:function(a,b,c,d,e,f,g){if(isArray(b)){for(var i=0;i<b.length;i++){var h=b[i];this._path+=(i==0?a:' ')+h[0]+','+h[1]+(h.length<4?'':' '+h[2]+','+h[3]+(h.length<6?'':' '+h[4]+','+h[5]))}}else{this._path+=a+b+','+c+(d==null?'':' '+d+','+e+(f==null?'':' '+f+','+g))}return this},arc:function(a,b,c,d,e,x,y,f){f=(isArray(a)?b:f);this._path+=(f?'a':'A');if(isArray(a)){for(var i=0;i<a.length;i++){var g=a[i];this._path+=(i==0?'':' ')+g[0]+','+g[1]+' '+g[2]+' '+(g[3]?'1':'0')+','+(g[4]?'1':'0')+' '+g[5]+','+g[6]}}else{this._path+=a+','+b+' '+c+' '+(d?'1':'0')+','+(e?'1':'0')+' '+x+','+y}return this},close:function(){this._path+='z';return this},path:function(){return this._path}});SVGPath.prototype.moveTo=SVGPath.prototype.move;SVGPath.prototype.lineTo=SVGPath.prototype.line;SVGPath.prototype.horizTo=SVGPath.prototype.horiz;SVGPath.prototype.vertTo=SVGPath.prototype.vert;SVGPath.prototype.curveCTo=SVGPath.prototype.curveC;SVGPath.prototype.smoothCTo=SVGPath.prototype.smoothC;SVGPath.prototype.curveQTo=SVGPath.prototype.curveQ;SVGPath.prototype.smoothQTo=SVGPath.prototype.smoothQ;SVGPath.prototype.arcTo=SVGPath.prototype.arc;function SVGText(){this._parts=[]}$.extend(SVGText.prototype,{reset:function(){this._parts=[];return this},string:function(a){this._parts[this._parts.length]=['text',a];return this},span:function(a,b){this._parts[this._parts.length]=['tspan',a,b];return this},ref:function(a,b){this._parts[this._parts.length]=['tref',a,b];return this},path:function(a,b,c){this._parts[this._parts.length]=['textpath',b,$.extend({href:a},c||{})];return this}});$.fn.svg=function(a){var b=Array.prototype.slice.call(arguments,1);if(typeof a=='string'&&a=='get'){return $.svg['_'+a+'SVG'].apply($.svg,[this[0]].concat(b))}return this.each(function(){if(typeof a=='string'){$.svg['_'+a+'SVG'].apply($.svg,[this].concat(b))}else{$.svg._attachSVG(this,a||{})}})};function isArray(a){return(a&&a.constructor==Array)}$.svg=new SVGManager()})(jQuery);/*! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license */
(function(r,G,f,v){var J=f("html"),n=f(r),p=f(G),b=f.fancybox=function(){b.open.apply(this,arguments)},I=navigator.userAgent.match(/msie/i),B=null,s=G.createTouch!==v,t=function(a){return a&&a.hasOwnProperty&&a instanceof f},q=function(a){return a&&"string"===f.type(a)},E=function(a){return q(a)&&0<a.indexOf("%")},l=function(a,d){var e=parseInt(a,10)||0;d&&E(a)&&(e*=b.getViewport()[d]/100);return Math.ceil(e)},w=function(a,b){return l(a,b)+"px"};f.extend(b,{version:"2.1.5",defaults:{padding:15,margin:20,
width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,maxHeight:9999,pixelRatio:1,autoSize:!0,autoHeight:!1,autoWidth:!1,autoResize:!0,autoCenter:!s,fitToView:!0,aspectRatio:!1,topRatio:0.5,leftRatio:0.5,scrolling:"auto",wrapCSS:"",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,autoPlay:!1,playSpeed:3E3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},iframe:{scrolling:"auto",preload:!0},swf:{wmode:"transparent",allowfullscreen:"true",allowscriptaccess:"always"},
keys:{next:{13:"left",34:"up",39:"left",40:"up"},prev:{8:"right",33:"down",37:"right",38:"down"},close:[27],play:[32],toggle:[70]},direction:{next:"left",prev:"right"},scrollOutside:!0,index:0,type:null,href:null,content:null,title:null,tpl:{wrap:'<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen'+
(I?' allowtransparency="true"':"")+"></iframe>",error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',next:'<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,
openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:250,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:250,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:!0,title:!0},onCancel:f.noop,beforeLoad:f.noop,afterLoad:f.noop,beforeShow:f.noop,afterShow:f.noop,beforeChange:f.noop,beforeClose:f.noop,afterClose:f.noop},group:{},opts:{},previous:null,coming:null,current:null,isActive:!1,
isOpen:!1,isOpened:!1,wrap:null,skin:null,outer:null,inner:null,player:{timer:null,isActive:!1},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(a,d){if(a&&(f.isPlainObject(d)||(d={}),!1!==b.close(!0)))return f.isArray(a)||(a=t(a)?f(a).get():[a]),f.each(a,function(e,c){var k={},g,h,j,m,l;"object"===f.type(c)&&(c.nodeType&&(c=f(c)),t(c)?(k={href:c.data("fancybox-href")||c.attr("href"),title:c.data("fancybox-title")||c.attr("title"),isDom:!0,element:c},f.metadata&&f.extend(!0,k,
c.metadata())):k=c);g=d.href||k.href||(q(c)?c:null);h=d.title!==v?d.title:k.title||"";m=(j=d.content||k.content)?"html":d.type||k.type;!m&&k.isDom&&(m=c.data("fancybox-type"),m||(m=(m=c.prop("class").match(/fancybox\.(\w+)/))?m[1]:null));q(g)&&(m||(b.isImage(g)?m="image":b.isSWF(g)?m="swf":"#"===g.charAt(0)?m="inline":q(c)&&(m="html",j=c)),"ajax"===m&&(l=g.split(/\s+/,2),g=l.shift(),l=l.shift()));j||("inline"===m?g?j=f(q(g)?g.replace(/.*(?=#[^\s]+$)/,""):g):k.isDom&&(j=c):"html"===m?j=g:!m&&(!g&&
k.isDom)&&(m="inline",j=c));f.extend(k,{href:g,type:m,content:j,title:h,selector:l});a[e]=k}),b.opts=f.extend(!0,{},b.defaults,d),d.keys!==v&&(b.opts.keys=d.keys?f.extend({},b.defaults.keys,d.keys):!1),b.group=a,b._start(b.opts.index)},cancel:function(){var a=b.coming;a&&!1!==b.trigger("onCancel")&&(b.hideLoading(),b.ajaxLoad&&b.ajaxLoad.abort(),b.ajaxLoad=null,b.imgPreload&&(b.imgPreload.onload=b.imgPreload.onerror=null),a.wrap&&a.wrap.stop(!0,!0).trigger("onReset").remove(),b.coming=null,b.current||
b._afterZoomOut(a))},close:function(a){b.cancel();!1!==b.trigger("beforeClose")&&(b.unbindEvents(),b.isActive&&(!b.isOpen||!0===a?(f(".fancybox-wrap").stop(!0).trigger("onReset").remove(),b._afterZoomOut()):(b.isOpen=b.isOpened=!1,b.isClosing=!0,f(".fancybox-item, .fancybox-nav").remove(),b.wrap.stop(!0,!0).removeClass("fancybox-opened"),b.transitions[b.current.closeMethod]())))},play:function(a){var d=function(){clearTimeout(b.player.timer)},e=function(){d();b.current&&b.player.isActive&&(b.player.timer=
setTimeout(b.next,b.current.playSpeed))},c=function(){d();p.unbind(".player");b.player.isActive=!1;b.trigger("onPlayEnd")};if(!0===a||!b.player.isActive&&!1!==a){if(b.current&&(b.current.loop||b.current.index<b.group.length-1))b.player.isActive=!0,p.bind({"onCancel.player beforeClose.player":c,"onUpdate.player":e,"beforeLoad.player":d}),e(),b.trigger("onPlayStart")}else c()},next:function(a){var d=b.current;d&&(q(a)||(a=d.direction.next),b.jumpto(d.index+1,a,"next"))},prev:function(a){var d=b.current;
d&&(q(a)||(a=d.direction.prev),b.jumpto(d.index-1,a,"prev"))},jumpto:function(a,d,e){var c=b.current;c&&(a=l(a),b.direction=d||c.direction[a>=c.index?"next":"prev"],b.router=e||"jumpto",c.loop&&(0>a&&(a=c.group.length+a%c.group.length),a%=c.group.length),c.group[a]!==v&&(b.cancel(),b._start(a)))},reposition:function(a,d){var e=b.current,c=e?e.wrap:null,k;c&&(k=b._getPosition(d),a&&"scroll"===a.type?(delete k.position,c.stop(!0,!0).animate(k,200)):(c.css(k),e.pos=f.extend({},e.dim,k)))},update:function(a){var d=
a&&a.type,e=!d||"orientationchange"===d;e&&(clearTimeout(B),B=null);b.isOpen&&!B&&(B=setTimeout(function(){var c=b.current;c&&!b.isClosing&&(b.wrap.removeClass("fancybox-tmp"),(e||"load"===d||"resize"===d&&c.autoResize)&&b._setDimension(),"scroll"===d&&c.canShrink||b.reposition(a),b.trigger("onUpdate"),B=null)},e&&!s?0:300))},toggle:function(a){b.isOpen&&(b.current.fitToView="boolean"===f.type(a)?a:!b.current.fitToView,s&&(b.wrap.removeAttr("style").addClass("fancybox-tmp"),b.trigger("onUpdate")),
b.update())},hideLoading:function(){p.unbind(".loading");f("#fancybox-loading").remove()},showLoading:function(){var a,d;b.hideLoading();a=f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");p.bind("keydown.loading",function(a){if(27===(a.which||a.keyCode))a.preventDefault(),b.cancel()});b.defaults.fixed||(d=b.getViewport(),a.css({position:"absolute",top:0.5*d.h+d.y,left:0.5*d.w+d.x}))},getViewport:function(){var a=b.current&&b.current.locked||!1,d={x:n.scrollLeft(),
y:n.scrollTop()};a?(d.w=a[0].clientWidth,d.h=a[0].clientHeight):(d.w=s&&r.innerWidth?r.innerWidth:n.width(),d.h=s&&r.innerHeight?r.innerHeight:n.height());return d},unbindEvents:function(){b.wrap&&t(b.wrap)&&b.wrap.unbind(".fb");p.unbind(".fb");n.unbind(".fb")},bindEvents:function(){var a=b.current,d;a&&(n.bind("orientationchange.fb"+(s?"":" resize.fb")+(a.autoCenter&&!a.locked?" scroll.fb":""),b.update),(d=a.keys)&&p.bind("keydown.fb",function(e){var c=e.which||e.keyCode,k=e.target||e.srcElement;
if(27===c&&b.coming)return!1;!e.ctrlKey&&(!e.altKey&&!e.shiftKey&&!e.metaKey&&(!k||!k.type&&!f(k).is("[contenteditable]")))&&f.each(d,function(d,k){if(1<a.group.length&&k[c]!==v)return b[d](k[c]),e.preventDefault(),!1;if(-1<f.inArray(c,k))return b[d](),e.preventDefault(),!1})}),f.fn.mousewheel&&a.mouseWheel&&b.wrap.bind("mousewheel.fb",function(d,c,k,g){for(var h=f(d.target||null),j=!1;h.length&&!j&&!h.is(".fancybox-skin")&&!h.is(".fancybox-wrap");)j=h[0]&&!(h[0].style.overflow&&"hidden"===h[0].style.overflow)&&
(h[0].clientWidth&&h[0].scrollWidth>h[0].clientWidth||h[0].clientHeight&&h[0].scrollHeight>h[0].clientHeight),h=f(h).parent();if(0!==c&&!j&&1<b.group.length&&!a.canShrink){if(0<g||0<k)b.prev(0<g?"down":"left");else if(0>g||0>k)b.next(0>g?"up":"right");d.preventDefault()}}))},trigger:function(a,d){var e,c=d||b.coming||b.current;if(c){f.isFunction(c[a])&&(e=c[a].apply(c,Array.prototype.slice.call(arguments,1)));if(!1===e)return!1;c.helpers&&f.each(c.helpers,function(d,e){if(e&&b.helpers[d]&&f.isFunction(b.helpers[d][a]))b.helpers[d][a](f.extend(!0,
{},b.helpers[d].defaults,e),c)});p.trigger(a)}},isImage:function(a){return q(a)&&a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)},isSWF:function(a){return q(a)&&a.match(/\.(swf)((\?|#).*)?$/i)},_start:function(a){var d={},e,c;a=l(a);e=b.group[a]||null;if(!e)return!1;d=f.extend(!0,{},b.opts,e);e=d.margin;c=d.padding;"number"===f.type(e)&&(d.margin=[e,e,e,e]);"number"===f.type(c)&&(d.padding=[c,c,c,c]);d.modal&&f.extend(!0,d,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,
mouseWheel:!1,keys:null,helpers:{overlay:{closeClick:!1}}});d.autoSize&&(d.autoWidth=d.autoHeight=!0);"auto"===d.width&&(d.autoWidth=!0);"auto"===d.height&&(d.autoHeight=!0);d.group=b.group;d.index=a;b.coming=d;if(!1===b.trigger("beforeLoad"))b.coming=null;else{c=d.type;e=d.href;if(!c)return b.coming=null,b.current&&b.router&&"jumpto"!==b.router?(b.current.index=a,b[b.router](b.direction)):!1;b.isActive=!0;if("image"===c||"swf"===c)d.autoHeight=d.autoWidth=!1,d.scrolling="visible";"image"===c&&(d.aspectRatio=
!0);"iframe"===c&&s&&(d.scrolling="scroll");d.wrap=f(d.tpl.wrap).addClass("fancybox-"+(s?"mobile":"desktop")+" fancybox-type-"+c+" fancybox-tmp "+d.wrapCSS).appendTo(d.parent||"body");f.extend(d,{skin:f(".fancybox-skin",d.wrap),outer:f(".fancybox-outer",d.wrap),inner:f(".fancybox-inner",d.wrap)});f.each(["Top","Right","Bottom","Left"],function(a,b){d.skin.css("padding"+b,w(d.padding[a]))});b.trigger("onReady");if("inline"===c||"html"===c){if(!d.content||!d.content.length)return b._error("content")}else if(!e)return b._error("href");
"image"===c?b._loadImage():"ajax"===c?b._loadAjax():"iframe"===c?b._loadIframe():b._afterLoad()}},_error:function(a){f.extend(b.coming,{type:"html",autoWidth:!0,autoHeight:!0,minWidth:0,minHeight:0,scrolling:"no",hasError:a,content:b.coming.tpl.error});b._afterLoad()},_loadImage:function(){var a=b.imgPreload=new Image;a.onload=function(){this.onload=this.onerror=null;b.coming.width=this.width/b.opts.pixelRatio;b.coming.height=this.height/b.opts.pixelRatio;b._afterLoad()};a.onerror=function(){this.onload=
this.onerror=null;b._error("image")};a.src=b.coming.href;!0!==a.complete&&b.showLoading()},_loadAjax:function(){var a=b.coming;b.showLoading();b.ajaxLoad=f.ajax(f.extend({},a.ajax,{url:a.href,error:function(a,e){b.coming&&"abort"!==e?b._error("ajax",a):b.hideLoading()},success:function(d,e){"success"===e&&(a.content=d,b._afterLoad())}}))},_loadIframe:function(){var a=b.coming,d=f(a.tpl.iframe.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",s?"auto":a.iframe.scrolling).attr("src",a.href);
f(a.wrap).bind("onReset",function(){try{f(this).find("iframe").hide().attr("src","//about:blank").end().empty()}catch(a){}});a.iframe.preload&&(b.showLoading(),d.one("load",function(){f(this).data("ready",1);s||f(this).bind("load.fb",b.update);f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();b._afterLoad()}));a.content=d.appendTo(a.inner);a.iframe.preload||b._afterLoad()},_preloadImages:function(){var a=b.group,d=b.current,e=a.length,c=d.preload?Math.min(d.preload,
e-1):0,f,g;for(g=1;g<=c;g+=1)f=a[(d.index+g)%e],"image"===f.type&&f.href&&((new Image).src=f.href)},_afterLoad:function(){var a=b.coming,d=b.current,e,c,k,g,h;b.hideLoading();if(a&&!1!==b.isActive)if(!1===b.trigger("afterLoad",a,d))a.wrap.stop(!0).trigger("onReset").remove(),b.coming=null;else{d&&(b.trigger("beforeChange",d),d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());b.unbindEvents();e=a.content;c=a.type;k=a.scrolling;f.extend(b,{wrap:a.wrap,skin:a.skin,
outer:a.outer,inner:a.inner,current:a,previous:d});g=a.href;switch(c){case "inline":case "ajax":case "html":a.selector?e=f("<div>").html(e).find(a.selector):t(e)&&(e.data("fancybox-placeholder")||e.data("fancybox-placeholder",f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()),e=e.show().detach(),a.wrap.bind("onReset",function(){f(this).find(e).length&&e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder",!1)}));break;case "image":e=a.tpl.image.replace("{href}",
g);break;case "swf":e='<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="'+g+'"></param>',h="",f.each(a.swf,function(a,b){e+='<param name="'+a+'" value="'+b+'"></param>';h+=" "+a+'="'+b+'"'}),e+='<embed src="'+g+'" type="application/x-shockwave-flash" width="100%" height="100%"'+h+"></embed></object>"}(!t(e)||!e.parent().is(a.inner))&&a.inner.append(e);b.trigger("beforeShow");a.inner.css("overflow","yes"===k?"scroll":
"no"===k?"hidden":k);b._setDimension();b.reposition();b.isOpen=!1;b.coming=null;b.bindEvents();if(b.isOpened){if(d.prevMethod)b.transitions[d.prevMethod]()}else f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();b.transitions[b.isOpened?a.nextMethod:a.openMethod]();b._preloadImages()}},_setDimension:function(){var a=b.getViewport(),d=0,e=!1,c=!1,e=b.wrap,k=b.skin,g=b.inner,h=b.current,c=h.width,j=h.height,m=h.minWidth,u=h.minHeight,n=h.maxWidth,p=h.maxHeight,s=h.scrolling,q=h.scrollOutside?
h.scrollbarWidth:0,x=h.margin,y=l(x[1]+x[3]),r=l(x[0]+x[2]),v,z,t,C,A,F,B,D,H;e.add(k).add(g).width("auto").height("auto").removeClass("fancybox-tmp");x=l(k.outerWidth(!0)-k.width());v=l(k.outerHeight(!0)-k.height());z=y+x;t=r+v;C=E(c)?(a.w-z)*l(c)/100:c;A=E(j)?(a.h-t)*l(j)/100:j;if("iframe"===h.type){if(H=h.content,h.autoHeight&&1===H.data("ready"))try{H[0].contentWindow.document.location&&(g.width(C).height(9999),F=H.contents().find("body"),q&&F.css("overflow-x","hidden"),A=F.outerHeight(!0))}catch(G){}}else if(h.autoWidth||
h.autoHeight)g.addClass("fancybox-tmp"),h.autoWidth||g.width(C),h.autoHeight||g.height(A),h.autoWidth&&(C=g.width()),h.autoHeight&&(A=g.height()),g.removeClass("fancybox-tmp");c=l(C);j=l(A);D=C/A;m=l(E(m)?l(m,"w")-z:m);n=l(E(n)?l(n,"w")-z:n);u=l(E(u)?l(u,"h")-t:u);p=l(E(p)?l(p,"h")-t:p);F=n;B=p;h.fitToView&&(n=Math.min(a.w-z,n),p=Math.min(a.h-t,p));z=a.w-y;r=a.h-r;h.aspectRatio?(c>n&&(c=n,j=l(c/D)),j>p&&(j=p,c=l(j*D)),c<m&&(c=m,j=l(c/D)),j<u&&(j=u,c=l(j*D))):(c=Math.max(m,Math.min(c,n)),h.autoHeight&&
"iframe"!==h.type&&(g.width(c),j=g.height()),j=Math.max(u,Math.min(j,p)));if(h.fitToView)if(g.width(c).height(j),e.width(c+x),a=e.width(),y=e.height(),h.aspectRatio)for(;(a>z||y>r)&&(c>m&&j>u)&&!(19<d++);)j=Math.max(u,Math.min(p,j-10)),c=l(j*D),c<m&&(c=m,j=l(c/D)),c>n&&(c=n,j=l(c/D)),g.width(c).height(j),e.width(c+x),a=e.width(),y=e.height();else c=Math.max(m,Math.min(c,c-(a-z))),j=Math.max(u,Math.min(j,j-(y-r)));q&&("auto"===s&&j<A&&c+x+q<z)&&(c+=q);g.width(c).height(j);e.width(c+x);a=e.width();
y=e.height();e=(a>z||y>r)&&c>m&&j>u;c=h.aspectRatio?c<F&&j<B&&c<C&&j<A:(c<F||j<B)&&(c<C||j<A);f.extend(h,{dim:{width:w(a),height:w(y)},origWidth:C,origHeight:A,canShrink:e,canExpand:c,wPadding:x,hPadding:v,wrapSpace:y-k.outerHeight(!0),skinSpace:k.height()-j});!H&&(h.autoHeight&&j>u&&j<p&&!c)&&g.height("auto")},_getPosition:function(a){var d=b.current,e=b.getViewport(),c=d.margin,f=b.wrap.width()+c[1]+c[3],g=b.wrap.height()+c[0]+c[2],c={position:"absolute",top:c[0],left:c[3]};d.autoCenter&&d.fixed&&
!a&&g<=e.h&&f<=e.w?c.position="fixed":d.locked||(c.top+=e.y,c.left+=e.x);c.top=w(Math.max(c.top,c.top+(e.h-g)*d.topRatio));c.left=w(Math.max(c.left,c.left+(e.w-f)*d.leftRatio));return c},_afterZoomIn:function(){var a=b.current;a&&(b.isOpen=b.isOpened=!0,b.wrap.css("overflow","visible").addClass("fancybox-opened"),b.update(),(a.closeClick||a.nextClick&&1<b.group.length)&&b.inner.css("cursor","pointer").bind("click.fb",function(d){!f(d.target).is("a")&&!f(d.target).parent().is("a")&&(d.preventDefault(),
b[a.closeClick?"close":"next"]())}),a.closeBtn&&f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb",function(a){a.preventDefault();b.close()}),a.arrows&&1<b.group.length&&((a.loop||0<a.index)&&f(a.tpl.prev).appendTo(b.outer).bind("click.fb",b.prev),(a.loop||a.index<b.group.length-1)&&f(a.tpl.next).appendTo(b.outer).bind("click.fb",b.next)),b.trigger("afterShow"),!a.loop&&a.index===a.group.length-1?b.play(!1):b.opts.autoPlay&&!b.player.isActive&&(b.opts.autoPlay=!1,b.play()))},_afterZoomOut:function(a){a=
a||b.current;f(".fancybox-wrap").trigger("onReset").remove();f.extend(b,{group:{},opts:{},router:!1,current:null,isActive:!1,isOpened:!1,isOpen:!1,isClosing:!1,wrap:null,skin:null,outer:null,inner:null});b.trigger("afterClose",a)}});b.transitions={getOrigPosition:function(){var a=b.current,d=a.element,e=a.orig,c={},f=50,g=50,h=a.hPadding,j=a.wPadding,m=b.getViewport();!e&&(a.isDom&&d.is(":visible"))&&(e=d.find("img:first"),e.length||(e=d));t(e)?(c=e.offset(),e.is("img")&&(f=e.outerWidth(),g=e.outerHeight())):
(c.top=m.y+(m.h-g)*a.topRatio,c.left=m.x+(m.w-f)*a.leftRatio);if("fixed"===b.wrap.css("position")||a.locked)c.top-=m.y,c.left-=m.x;return c={top:w(c.top-h*a.topRatio),left:w(c.left-j*a.leftRatio),width:w(f+j),height:w(g+h)}},step:function(a,d){var e,c,f=d.prop;c=b.current;var g=c.wrapSpace,h=c.skinSpace;if("width"===f||"height"===f)e=d.end===d.start?1:(a-d.start)/(d.end-d.start),b.isClosing&&(e=1-e),c="width"===f?c.wPadding:c.hPadding,c=a-c,b.skin[f](l("width"===f?c:c-g*e)),b.inner[f](l("width"===
f?c:c-g*e-h*e))},zoomIn:function(){var a=b.current,d=a.pos,e=a.openEffect,c="elastic"===e,k=f.extend({opacity:1},d);delete k.position;c?(d=this.getOrigPosition(),a.openOpacity&&(d.opacity=0.1)):"fade"===e&&(d.opacity=0.1);b.wrap.css(d).animate(k,{duration:"none"===e?0:a.openSpeed,easing:a.openEasing,step:c?this.step:null,complete:b._afterZoomIn})},zoomOut:function(){var a=b.current,d=a.closeEffect,e="elastic"===d,c={opacity:0.1};e&&(c=this.getOrigPosition(),a.closeOpacity&&(c.opacity=0.1));b.wrap.animate(c,
{duration:"none"===d?0:a.closeSpeed,easing:a.closeEasing,step:e?this.step:null,complete:b._afterZoomOut})},changeIn:function(){var a=b.current,d=a.nextEffect,e=a.pos,c={opacity:1},f=b.direction,g;e.opacity=0.1;"elastic"===d&&(g="down"===f||"up"===f?"top":"left","down"===f||"right"===f?(e[g]=w(l(e[g])-200),c[g]="+=200px"):(e[g]=w(l(e[g])+200),c[g]="-=200px"));"none"===d?b._afterZoomIn():b.wrap.css(e).animate(c,{duration:a.nextSpeed,easing:a.nextEasing,complete:b._afterZoomIn})},changeOut:function(){var a=
b.previous,d=a.prevEffect,e={opacity:0.1},c=b.direction;"elastic"===d&&(e["down"===c||"up"===c?"top":"left"]=("up"===c||"left"===c?"-":"+")+"=200px");a.wrap.animate(e,{duration:"none"===d?0:a.prevSpeed,easing:a.prevEasing,complete:function(){f(this).trigger("onReset").remove()}})}};b.helpers.overlay={defaults:{closeClick:!0,speedOut:200,showEarly:!0,css:{},locked:!s,fixed:!0},overlay:null,fixed:!1,el:f("html"),create:function(a){a=f.extend({},this.defaults,a);this.overlay&&this.close();this.overlay=
f('<div class="fancybox-overlay"></div>').appendTo(b.coming?b.coming.parent:a.parent);this.fixed=!1;a.fixed&&b.defaults.fixed&&(this.overlay.addClass("fancybox-overlay-fixed"),this.fixed=!0)},open:function(a){var d=this;a=f.extend({},this.defaults,a);this.overlay?this.overlay.unbind(".overlay").width("auto").height("auto"):this.create(a);this.fixed||(n.bind("resize.overlay",f.proxy(this.update,this)),this.update());a.closeClick&&this.overlay.bind("click.overlay",function(a){if(f(a.target).hasClass("fancybox-overlay"))return b.isActive?
b.close():d.close(),!1});this.overlay.css(a.css).show()},close:function(){var a,b;n.unbind("resize.overlay");this.el.hasClass("fancybox-lock")&&(f(".fancybox-margin").removeClass("fancybox-margin"),a=n.scrollTop(),b=n.scrollLeft(),this.el.removeClass("fancybox-lock"),n.scrollTop(a).scrollLeft(b));f(".fancybox-overlay").remove().hide();f.extend(this,{overlay:null,fixed:!1})},update:function(){var a="100%",b;this.overlay.width(a).height("100%");I?(b=Math.max(G.documentElement.offsetWidth,G.body.offsetWidth),
p.width()>b&&(a=p.width())):p.width()>n.width()&&(a=p.width());this.overlay.width(a).height(p.height())},onReady:function(a,b){var e=this.overlay;f(".fancybox-overlay").stop(!0,!0);e||this.create(a);a.locked&&(this.fixed&&b.fixed)&&(e||(this.margin=p.height()>n.height()?f("html").css("margin-right").replace("px",""):!1),b.locked=this.overlay.append(b.wrap),b.fixed=!1);!0===a.showEarly&&this.beforeShow.apply(this,arguments)},beforeShow:function(a,b){var e,c;b.locked&&(!1!==this.margin&&(f("*").filter(function(){return"fixed"===
f(this).css("position")&&!f(this).hasClass("fancybox-overlay")&&!f(this).hasClass("fancybox-wrap")}).addClass("fancybox-margin"),this.el.addClass("fancybox-margin")),e=n.scrollTop(),c=n.scrollLeft(),this.el.addClass("fancybox-lock"),n.scrollTop(e).scrollLeft(c));this.open(a)},onUpdate:function(){this.fixed||this.update()},afterClose:function(a){this.overlay&&!b.coming&&this.overlay.fadeOut(a.speedOut,f.proxy(this.close,this))}};b.helpers.title={defaults:{type:"float",position:"bottom"},beforeShow:function(a){var d=
b.current,e=d.title,c=a.type;f.isFunction(e)&&(e=e.call(d.element,d));if(q(e)&&""!==f.trim(e)){d=f('<div class="fancybox-title fancybox-title-'+c+'-wrap">'+e+"</div>");switch(c){case "inside":c=b.skin;break;case "outside":c=b.wrap;break;case "over":c=b.inner;break;default:c=b.skin,d.appendTo("body"),I&&d.width(d.width()),d.wrapInner('<span class="child"></span>'),b.current.margin[2]+=Math.abs(l(d.css("margin-bottom")))}d["top"===a.position?"prependTo":"appendTo"](c)}}};f.fn.fancybox=function(a){var d,
e=f(this),c=this.selector||"",k=function(g){var h=f(this).blur(),j=d,k,l;!g.ctrlKey&&(!g.altKey&&!g.shiftKey&&!g.metaKey)&&!h.is(".fancybox-wrap")&&(k=a.groupAttr||"data-fancybox-group",l=h.attr(k),l||(k="rel",l=h.get(0)[k]),l&&(""!==l&&"nofollow"!==l)&&(h=c.length?f(c):e,h=h.filter("["+k+'="'+l+'"]'),j=h.index(this)),a.index=j,!1!==b.open(h,a)&&g.preventDefault())};a=a||{};d=a.index||0;!c||!1===a.live?e.unbind("click.fb-start").bind("click.fb-start",k):p.undelegate(c,"click.fb-start").delegate(c+
":not('.fancybox-item, .fancybox-nav')","click.fb-start",k);this.filter("[data-fancybox-start=1]").trigger("click");return this};p.ready(function(){var a,d;f.scrollbarWidth===v&&(f.scrollbarWidth=function(){var a=f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),b=a.children(),b=b.innerWidth()-b.height(99).innerWidth();a.remove();return b});if(f.support.fixedPosition===v){a=f.support;d=f('<div style="position:fixed;top:20px;"></div>').appendTo("body");var e=20===
d[0].offsetTop||15===d[0].offsetTop;d.remove();a.fixedPosition=e}f.extend(b.defaults,{scrollbarWidth:f.scrollbarWidth(),fixed:f.support.fixedPosition,parent:f("body")});a=f(r).width();J.addClass("fancybox-lock-test");d=f(r).width();J.removeClass("fancybox-lock-test");f("<style type='text/css'>.fancybox-margin{margin-right:"+(d-a)+"px;}</style>").appendTo("head")})})(window,document,jQuery);/**
 * Remove an item from an array
 */
function arrayRemove(array, index)
{
    index = parseInt(index);
    var last = array[array.length-1];
    array[array.length-1] = array[index];
    array[index] = last;
    array.pop();
};
/**
 * A metaField field
 */
function Field(metaField)
{
    var self = this;
    this.onUpdate = null;

    // Value
    this.value = null;

    if ('defaultValue' in metaField) {
        this.value = metaField.defaultValue;
    }

    // Default unit
    if (metaField.unit == undefined) {
        this.unit = '';
    } else {
        this.unit = metaField.unit;
    }

    // Length
    this.dimension = 'dimension' in metaField ? metaField.dimension : null;

    // Setting attributes
    this.attrs = metaField.attrs;

    // Is this metaField a title ?
    this.asTitle = 'asTitle' in metaField && metaField.asTitle;

    // Getting type
    if (metaField.type == undefined) {
        this.type = 'string';
    } else {
        var type = metaField.type.toLowerCase();
        type = Types.normalize(type);

        this.type = type;
    }

    // Cardinalities
    this.card = 'card' in metaField ? metaField.card : '*';
    this.card = this.parseCardinality(this.card, this.is('output'));

    // Hide the field ?
    this.hide = 'hide' in metaField && metaField.hide;

    // Hide the label ?
    this.hideLabel = 'hideLabel' in metaField && metaField.hideLabel;

    // Field iname
    this.name = metaField.name.toLowerCase();

    this.label = 'label' in metaField ? metaField.label
        : metaField.name;

    this.dynamicLabel = 'dynamicLabel' in metaField ? metaField.dynamicLabel
        : null;

    // Choices
    this.choices = 'choices' in metaField ? metaField.choices : null;

    // Is this field auto-extensible?
    this.extensible = 'extensible' in metaField && metaField.extensible;
    this.size = 1;
    
    // Is it an array ?
    this.isArray = (this.type.substr(-2) == '[]');

    if (this.isArray) {
        this.dimension = this.name;
        this.type = this.type.substr(0, this.type.length-2);
    }

    // Is variadic?
    this.variadic = !!this.dimension;

    // Default value
    this.defaultValue = 'defaultValue' in metaField ? metaField.defaultValue : null;
};

/**
 * The render was updated
 */
Field.prototype.updated = function()
{
    if (this.onUpdate) {
        this.onUpdate();
    }
};

/**
 * HTML render for the field
 */
Field.prototype.getFieldHtml = function()
{
    var field = this.label+':<br/>';

    if (this.type == 'longtext') {
        field += '<textarea name="'+this.name+'"></textarea>';
    } else if (this.type == 'choice' || this.choices) {
        field += '<select name="'+this.name+'">';
        for (k in this.choices) {
            var choice = this.choices[k];
            field += '<option value="'+choice+'">'+choice+'</option>';
        }
        field += '</select>';
    } else {
        var type = this.type == 'bool' ? 'checkbox' : 'text';
        field += '<input value="'+this.getPrintableValue()+'" type="'+type+'" name="'+this.name+'" />'+this.unit;
    }

    field += '<br/>';

    return field;
};

/**
 * Returns the HTML rendering
 */
Field.prototype.getHtml = function()
{
    var html = '';

    if (!this.hideLabel) {
        html += '<b>' + this.label + '</b>: ';
    }
    
    html += this.getPrintableValueWithUnit() + '<br/>';

    return html;
};

/**
 * Return the (value) HTML rendering
 */
Field.prototype.getValue = function()
{
    return this.value;
};

/**
 * Get printable value
 */
Field.prototype.getPrintableValue = function(index)
{
    var value = this.getValue();

    if (value instanceof Array) {
        if (index == undefined) {
            value = value.join(',');
        } else {
            value = value[index];
        }
    }

    return value;
};

/**
 * Get printable value with units
 */
Field.prototype.getPrintableValueWithUnit = function(index)
{
    var value = this.getPrintableValue(index);

    if (this.unit) {
        value += this.unit;
    }

    return value;
};

/**
 * Getting the label
 */
Field.prototype.getLabel = function()
{
    return this.label;
};

/**
 * Setting the value of the field
 */
Field.prototype.setValue = function(value)
{
    if (this.isArray && !(value instanceof Array)) {
        value = value.split(',');
    }

    if (this.type == 'bool') {
        value = !!value;
    }

    this.value = value;
};

/**
 * Gets the variadic dimension
 */
Field.prototype.getDimension = function()
{
    if (this.extensible) {
        return this.size+1;
    } else if (this.isArray) {
        return this.getValue().length;
    } else {
        return parseInt(this.getValue());
    }
};

/**
 * Checks if the fields has an attribute
 */
Field.prototype.is = function(attr)
{
    return (attr in this.attrs);
};

/**
 * Parses the cardinality
 */
Field.prototype.parseCardinality = function(ioCard, isOutput)
{
    var card = [0, 1];

    if (isOutput) {
        card = [0, '*'];
    }

    if (ioCard != undefined) {
        if (typeof(ioCard) != 'string') {
            card = [ioCard, ioCard];
        } else {
            tab = ioCard.split('-');
            if (tab.length == 1) {
                card = [0, tab[0]];
            } else {
                card = tab;
            }
        }
    }

    for (idx in card) {
        if (card[idx] != '*') {
            card[idx] = parseInt(card[idx]);
        }
    }

    return card;
};
/**
 * Parameters managers
 */
function Fields(block)
{
    var self = this;

    // Block & meta
    this.block = block;
    this.meta = this.block.meta;

    // Is the form displayed ?
    this.display = false;

    // Div
    this.div = null;

    // Fields
    this.fields = [];
    for (k in this.meta.fields) {
        var field = new Field(this.meta.fields[k]);
        field.onUpdate = function() {
            self.block.cssParameters();
        };
        this.fields.push(field);
    }

    // Indexed fields
    this.inputs = [];
    this.outputs = [];
    this.editables = [];
    this.indexedFields = {};

    // Indexing
    for (k in this.fields) {
        var field = this.fields[k];
        this.indexedFields[field.name] = field;

        if ('editable' in field.attrs) {
            this.editables.push(field);
        }
        if ('input' in field.attrs) {
            this.inputs.push(field);
            field.hide = true;
        }
        if ('output' in field.attrs) {
            this.outputs.push(field);
            field.hide = true;
        }
    }
};

/**
 * Getting a field by name
 */
Fields.prototype.getField = function(name)
{
    name = name.toLowerCase();

    return (name in this.indexedFields ? this.indexedFields[name] : null);
};

/**
 * Show the settings window
 */
Fields.prototype.show = function()
{
    var self = this;
    var html = '<h3>'+this.block.meta.name+'#'+this.block.id+'</h3>';

    html += '<form class="form">';
    for (k in this.editables) {
        html += this.editables[k].getFieldHtml();
    }
    html += '<input type="submit" style="display:none" width="0" height="0" />';
    html += '</form>';
    
    html += '<button class="save" href="javascript:void(0);">Save</button>';
    html += '<button class="close" href="javascript:void(0);">Close</button>';

    this.div.html(html);

    this.div.find('.close').click(function() {
        $.fancybox.close();
    });

    var form = this.div.find('form');
    
    this.div.find('.save').click(function() {
        self.save(form.serializeForm());
        $.fancybox.close();
    });

    this.div.find('form').submit(function() {
        self.save($(this).serializeForm());
        $.fancybox.close();
        return false;
    });

    this.div.find('input').dblclick(function() {
        $(this).select();
    });

    $.fancybox.open(this.div, {wrapCSS: 'blocks_js_modal'});
    this.display = true;
};

/**
 * Show the fields
 */
Fields.prototype.getHtml = function()
{
    var html = '';

    for (k in this.editables) {
        html += this.editables[k].getHtml();
    }

    return html;
};

/**
 * Hide the form
 */
Fields.prototype.hide = function()
{
    this.div.hide();
    this.display = false;
};

/**
 * Saves the form
 */
Fields.prototype.save = function(serialize)
{
    var values = {};

    for (key in serialize) {
        var newKey = key;
        var isArray = false;
        if (newKey.substr(newKey.length-2, 2) == '[]') {
            newKey = newKey.substr(0, newKey.length-2);
            isArray = true;
        }
        if (serialize[key] == null && isArray) {
            serialize[key] = [];
        }

        this.getField(newKey).setValue(serialize[key]);
    }

    this.block.render();
    this.block.redraw();
};

/**
 * Show or hide the config
 */
Fields.prototype.toggle = function()
{
    if (this.meta.parametersEditor != undefined && typeof(this.meta.parametersEditor) == 'function') {
        this.meta.parametersEditor(this.block.values, function(values) {
            this.block.updateValues(values);
            this.block.render();
            this.block.redraw();
        });
    } else {
        if (this.display) {
            this.hide();
        } else {
            this.show();
        }
    }
};
function Segment(x, y, dx, dy)
{
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
};

/**
 * Distance
 */
Segment.prototype.distance = function(point1, point2)
{
    return Math.sqrt(Math.pow(point2.x-point1.x,2) + Math.pow(point2.y-point1.y,2));
}

/**
 * Distance with a point
 */
Segment.prototype.distanceP = function(point)
{
    var normal = this.normal();
    normal.x = point.x;
    normal.y = point.y;
    var intersection = this.intersection(normal);

    return [intersection[0], this.distance(normal.alpha(intersection[1]), point)];
};

/**
 * Normal
 */
Segment.prototype.normal = function()
{
    return new Segment(this.x, this.y, this.dy, -this.dx);
};

/**
 * Gets the intersection alpha with another 
 */
Segment.prototype.intersection = function(other)
{
    var a = this.dx;
    var b = -other.dx;
    var c = this.dy;
    var d = -other.dy;
    var b0 = other.x-this.x;
    var b1 = other.y-this.y;
    var det = a*d - b*c;

    if (det == 0) {
        return null;
    }

    r1 = (d*b0 - b*b1)/det;
    r2 = (-c*b0 + a*b1)/det;

    return [r1, r2];
};

/**
 * Gets the alpha point
 */
Segment.prototype.alpha = function(a)
{
    var point = {};
    point.x = this.x+this.dx*a;
    point.y = this.y+this.dy*a;

    return point;
};
/**
 * Manage the types compatibility
 */
Types = function()
{
    this.compatibles = {};
};

/**
 * Normalize types
 */
Types.normalize = function(type)
{
    type = type.toLowerCase();

    if (type == 'check' || type == 'bool' || type == 'checkbox') {
        type = 'bool';
    }

    if (type == 'integer') {
        type = 'int';
    }

    if (type == 'float' || type == 'double') {
        type = 'number';
    }

    if (type == 'text') {
        type = 'string';
    }

    if (type == 'select' || type == 'choices' || type == 'combobox') {
        type = 'choice';
    }

    if (type == 'textarea') {
        type = 'longtext';
    }

    return type;
}

/**
 * Checks if a type is compatible with another
 */
Types.prototype.isCompatible = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    if (typeA == typeB) {
        return true;
    }

    if (typeA in this.compatibles) {
        for (k in this.compatibles[typeA]) {
            if (typeB == this.compatibles[typeA][k]) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Get all the compatible types
 */
Types.prototype.getCompatibles = function(type)
{
    type = Types.normalize(type);
    var compatibles = [type];

    if (type in this.compatibles) {
        for (k in this.compatibles[type]) {
            compatibles.push(this.compatibles[type][k]);
        }
    }

    return compatibles;
};

/**
 * Add compatibility (one way)
 */
Types.prototype.addCompatibilityOneWay = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    if (!(typeA in this.compatibles)) {
        this.compatibles[typeA] = [];
    }

    this.compatibles[typeA].push(typeB);
};

/**
 * Add a types compatibility
 */
Types.prototype.addCompatibility = function(typeA, typeB)
{
    typeA = Types.normalize(typeA);
    typeB = Types.normalize(typeB);

    this.addCompatibilityOneWay(typeA, typeB);
    this.addCompatibilityOneWay(typeB, typeA);
};
/**
 * A connector
 */
Connector = function(name, type, index)
{
    this.name = name;
    this.index = index;
    this.type = type;
};

/**
 * Gets the connector identifier
 */
Connector.prototype.id = function()
{
    var id = this.name + '_' + this.type;

    if (this.index != null) {
        id += '_' + this.index;
    }

    return id;
};

/**
 * Is this connector an input?
 */
Connector.prototype.isInput = function()
{
    return this.type == 'input';
};

/**
 * Is this connector an output?
 */
Connector.prototype.isOutput = function()
{
    return this.type == 'output';
};

/**
 * Is this connector the same as another?
 */
Connector.prototype.same = function(other)
{
    return (this.name == other.name && 
            this.index == other.index && this.type == other.type);
};

/**
 * Export the connector
 */
Connector.prototype.exportData = function()
{
    var data = [this.name, this.type];

    if (this.index !== null) {
        data.push(this.index);
    }

    return data;
}

/**
 * Import a connector
 */
function ConnectorImport(data)
{
    if (!(data instanceof Array) || data.length<2 || data.length>3) {
        throw 'Unable to import a connector';
    }

    if (data.length == 2) {
        data.push(null);
    }

    return new Connector(data[0], data[1], data[2]);
}

/**
 * Creates a connector from its id
 */
function IdToConnector(connectorId)
{
    var parts = connectorId.split('_');

    var name = parts[0];
    var type = parts[1];
    var index = null;
    if (parts.length == 3) {
        index = parts[2];
    }

    return new Connector(name, type, index);
}
/**
 * An edge linking two blocks
 */
function Edge(id, block1, connector1, block2, connector2, blocks)
{
    this.blocks = blocks;
    this.label = null;
    this.id = parseInt(id);
    this.block1 = block1;
    this.connector1 = connector1;
    this.block2 = block2;
    this.connector2 = connector2;
    this.selected = false;

    this.defaultSize = 3;
    this.defaultFontSize = 10;

    this.position1 = null;
    this.position2 = null;
    this.segment = null;
};

/**
 * Should this edge be ignored in loop analysis ?
 */
Edge.prototype.isLoopable = function()
{
    return (this.block1.isLoopable() || this.block2.isLoopable());
}

/**
 * Returns an array with the blocks ordered
 */
Edge.prototype.fromTo = function()
{
    return [this.block1, this.block2];
};

/**
 * Sets the label of the edge
 */
Edge.prototype.setLabel = function(label)
{
    this.label = label;
};

/**
 * Draws the edge
 */
Edge.prototype.draw = function(svg)
{
    this.position1 = this.block1.linkPositionFor(this.connector1);
    this.position2 = this.block2.linkPositionFor(this.connector2);
    
    this.segment = new Segment(
        this.position1.x, this.position1.y, 
        this.position2.x-this.position1.x, this.position2.y-this.position1.y
    );

    var lineWidth = this.defaultSize*this.blocks.scale;

    if (this.selected) {
        var strokeStyle = 'rgba(0, 200, 0, 1)';
    } else {
        var strokeStyle = 'rgba(255, 200, 0, 1)';
    }
    svg.line(this.position1.x, this.position1.y, this.position2.x, this.position2.y, {
        stroke: strokeStyle, strokeWidth: lineWidth
    });
    
    var xM = ((this.position1.x+this.position2.x)/2.0);
    var yM = ((this.position1.y+this.position2.y)/2.0);
    var norm = Math.sqrt(Math.pow(this.position1.x-this.position2.x,2)+Math.pow(this.position1.y-this.position2.y,2));
    var alpha = 30;
    alpha = (alpha*Math.PI/180.0);
    var cos = Math.cos(alpha);
    var sin = Math.sin(alpha);
    var cosB = Math.cos(-alpha);
    var sinB = Math.sin(-alpha);

    // Drawing the arrow
    if (this.blocks.getOption('orientation', true)) {
        var xA = (this.position1.x-xM)*this.blocks.scale*10/(norm/2);
        var yA = (this.position1.y-yM)*this.blocks.scale*10/(norm/2);
        var lineWidth = this.defaultSize*this.blocks.scale/3.0;
        svg.line(xM, yM, xM+(xA*cos-yA*sin), yM+(yA*cos+xA*sin), {
            stroke: strokeStyle, strokeWidth: lineWidth
        });
        svg.line(xM, yM, xM+(xA*cosB-yA*sinB), yM+(yA*cosB+xA*sinB), {
            stroke: strokeStyle, strokeWidth: lineWidth
        });
    }

    if (this.label != null) {
        var fontSize = Math.round(this.defaultFontSize*this.blocks.scale);

        svg.text(xM-2*fontSize, yM+fontSize/3, this.label, {
            fontSize: fontSize+'px',
            fill: '#3a3b01',
            stroke: '#fff',
            strokeWidth: 2
        });
        svg.text(xM-2*fontSize, yM+fontSize/3, this.label, {
            fontSize: fontSize+'px',
            fill: '#3a3b01',
        });
    }
    };

/**
 * Does the position collide the line ?
 */
Edge.prototype.collide = function(x, y)
{
    var dp = this.segment.distanceP({x: x, y: y});

    if (dp[0] >= 0 && dp[0] <= 1) {
        if (dp[1] < (this.defaultSize*blocks.scale)*2) {
            return dp[0];
        }
    }

    return false;
};

/**
 * Initializes the edge and do some tests
 */ 
Edge.prototype.create = function()
{
    // You can't link a block to itself
    if (this.block1 == this.block2) {
        throw 'You can\'t link a block to itself';
    }

    // You have to link an input with an output
    if (!this.blocks.getOption('canLinkInputs', false) && this.connector1.type == this.connector2.type) {
        throw 'You have to link an input with an output';
    }

    // The cards have to be okay
    if ((!this.block1.canLink(this.connector1)) || (!this.block2.canLink(this.connector2))) {
        throw 'Can\'t create such an edge because of the cardinalities';
    }

    this.block1.addEdge(this.connector1, this);
    this.block2.addEdge(this.connector2, this);
    this.block1.render();
    this.block2.render();
};

/**
 * Get the types of the blocks
 */
Edge.prototype.getTypes = function()
{
    return [this.block1.getField(this.connector1.name).type,
            this.block2.getField(this.connector2.name).type];
};

/**
 * Erase an edge
 */
Edge.prototype.erase = function()
{
    this.block1.eraseEdge(this.connector1, this);
    this.block2.eraseEdge(this.connector2, this);
    this.block1.render();
    this.block2.render();
};

/**
 * Test if this edge is the same than another
 */
Edge.prototype.same = function(other)
{
    if (this.block1 == other.block1 && this.block2 == other.block2 
            && this.connector1.same(other.connector1)
            && this.connector2.same(other.connector2)) {
        return true;
    }
    
    if (this.block1 == other.block1 && this.block2 == other.block2 
            && this.connector1.same(other.connector2)
            && this.connector2.same(other.connector1)) {
        return true;
    }

    return false;
};

/**
 * Exports the edge to JSON
 */
Edge.prototype.exportData = function()
{
    return {
        id: this.id,
        block1: this.block1.id,
        connector1: this.connector1.exportData(),
        block2: this.block2.id,
        connector2: this.connector2.exportData()
    };
};

/**
 * Imports JSON data into an edge
 */
function EdgeImport(blocks, data)
{
    if (!'id' in data) {
        throw "An edge does not have id";
    }

    var block1 = blocks.getBlockById(data.block1);
    var block2 = blocks.getBlockById(data.block2);

    if (!block1 || !block2) {
	throw "Error while importing an edge, a block did not exists";
    }

    return new Edge(data.id, block1, ConnectorImport(data.connector1), 
                             block2, ConnectorImport(data.connector2), blocks);
};
/**
 * Draw messages on the screen
 */
function BlocksMessages(messages, width)
{
    var self = this;

    // Timer to hide
    this.hideTimer = null;

    // Messages
    this.messages = messages;

    // Width
    this.width = width;

    messages.click(function() {
	self.hide();
    });
};

/**
 * Show a message
 */
BlocksMessages.prototype.show = function(text, options)
{
    var self = this;

    if (this.hideTimer != null) {
        clearTimeout(this.hideTimer);
    }

    var classes = 'message';

    if (options['class'] != undefined) {
        classes += ' '+options['class'];
    }

    html = '<div class="'+classes+'">'+text+'</div>';

    this.messages.html(html);
    this.messages.fadeIn();
    this.messages.css('margin-left', Math.round((this.width-350)/2.0)+'px');
    this.messages.css('margin-top', '20px');

    this.hideTimer = setTimeout(function() { self.hide(); }, 5000);
};

/**
 * Hide the message
 */
BlocksMessages.prototype.hide = function()
{
    this.messages.fadeOut();
    this.hideTimer = null;
};
/**
 * Handles the menu for creating blocks
 */
function BlocksMenu(blocks)
{
    var self = this;

    // Is the menu visible ?
    this.visible = false;

    // Position on the scene
    this.position = {};

    // Blocks
    this.blocks = blocks;

    // Menu div
    this.menu = blocks.div.find('.contextmenu');

    // Menu items
    this.actions = [
	{
	    label: 'Compact',
	    action: function(blocks) {
		blocks.toggleCompact();
	    },
            icon: 'compact'
	},
	{
	    label: 'Scale',
	    action: function(blocks) {
		blocks.perfectScale();
	    },
            icon: 'scale'
	}
    ];

    /**
     * Initialisation
     */
    blocks.div.bind('contextmenu', function() {
        if (self.visible) {
            self.hide();
        } else {
            self.position = blocks.getPosition();

            // Sorting types by family
            var families = {};
            for (k in blocks.metas) {
                var meta = blocks.metas[k];

                if (meta.family in families) {
                    families[meta.family].push(meta);
                } else {
                    families[meta.family] = [meta];
                }
            }

            html = '';

	    for (action in self.actions) {
                var icon = 'none';
                if ('icon' in self.actions[action]) {
                    icon = self.actions[action].icon;
                }
		html += '<div rel="'+action+'" class="menuentry menu_action_'+action+'"><div class="menu_icon menu_icon_'+icon+'"></div>'+self.actions[action].label+'</div>';
	    }

            for (family in families) {
                if (family) {
                    var className = family.replace(/[^a-zA-Z]/g,'');
                    html += '<div class="family">';
                    html += '<div class="familyName family_'+family+'"><div class="menu_icon menu_icon_family_'+className+'"></div>'+family+' <span>&raquo;</span></div>';
                    html += '<div class="childs">';
                }
                for (k in families[family]) {
                    var type = families[family][k];
                    html += '<div class="type type_'+type.name+'" rel="'+type.name+'">'+type.name+'</div>';
                }
                if (family) {
                    html += '</div>';
                    html += '</div>';
                }
            }

            self.menu.find('.types').html(html);
            self.show();

            self.menu.find('.type').click(function() {
                blocks.addBlock($(this).attr('rel'), self.position.x, self.position.y);
                self.hide();
            });

            self.menu.find('.family').each(function() {
                var family = $(this);
                $(this).find('.familyName').hover(function() {
                    self.menu.find('.childs').hide();
                    family.find('.childs').show();
                });
            });

	    for (k in self.actions) {
		self.menu.find('.menu_action_'+k).click(function() {
		    var action = self.actions[$(this).attr('rel')];
		    action.action(blocks);
		    self.hide();
		});
	    }

            $(this).find('.types > .type').hover(function() {
                self.menu.find('.childs').hide();
            });
        }
        
        return false;
    });
}

/**
 * Adds an action
 */
BlocksMenu.prototype.addAction = function(name, action, icon)
{
    this.actions.push({label: name, action: action, icon: icon});
};

/**
 * Hide the menu
 */
BlocksMenu.prototype.hide = function()
{
    this.menu.hide();
    this.visible = false;
};

/**
 * Show the menu
 */
BlocksMenu.prototype.show = function()
{
    this.menu.css('margin-left', (5+this.blocks.mouseX)+'px');
    this.menu.css('margin-top', (5+this.blocks.mouseY)+'px');
    this.menu.show();
    this.visible = true;
};

/**
 * Manage one block meta
 */
Meta = function(meta)
{
    var self = this;

    this.name = meta.name;
    this.loopable = ('loopable' in meta && meta['loopable']);
    this.size = ('size' in meta ? meta.size : 'normal');
    this.fields = [];

    // Importing fields meta data
    if ('fields' in meta) {
        for (k in meta.fields) {
            var field = meta.fields[k];
            var attributes = ('attrs' in field ? field.attrs.split(' ') : []);
            field.attrs = {};
            for (i in attributes) {
                field.attrs[attributes[i]] = true;
            }
            this.fields.push(field);
        }
    }

    // Checking for parameters editor
    for (k in meta.parametersEditor) {
        var key = keys[k];
        if (meta[key] != undefined) {
            this[key] = meta[key];
        } else {
            this[key] = [];
        }
    }

    // Adding module
    if ('module' in meta) {
        this.module = meta.module;
    } else {
        this.module = null;
    }

    // Checking the family
    if (meta.family == undefined) {
        this.family = ''; // Root family
    } else {
        this.family = meta.family;
    }

    // Style
    if (meta['class'] != undefined) {
        this['class'] = meta['class'];
    } else {
        this['class'] = '';
    }

    // Description
    this.description = null;
    if (meta.description != undefined) {
        this.description = meta.description;
    }
}

/**
 * Handles the history
 */
function History(blocks)
{
    var self = this;
    this.historySize = 30;

    this.blocks = blocks;
    this.history = [];
    this.historyPos = 0;
    this.ctrlDown = false;
    
    $(document).keydown(function(evt) {
        if (evt.keyCode == 17) {
            self.ctrlDown = true;
        } 

        // Ctrl+Z
        if (evt.keyCode == 90 && self.ctrlDown) {
            self.restoreLast();
        }
    });

    $(document).keyup(function(evt) {
        if (evt.keyCode == 17) {
            self.ctrlDown = false;
        }
    });
};

/**
 * Save the current situation to the history
 */
History.prototype.save = function()
{
    this.history.push(this.blocks.exportData());

    if (this.history.length > this.historySize) {
        this.history.shift();
    }
};

/**
 * Restores the last saved situation
 */
History.prototype.restoreLast = function()
{
    if (this.history.length) {
        var last = this.history.pop();
        this.blocks.importData(last);
    } else {
        alert('Nothing to get');
    }
};
/**
 * Creates an instance of a block
 */
Block = function(blocks, meta, id)
{
    this.blocks = blocks;
    this.meta = meta;

    // Appareance values
    this.defaultFont = 10;

    // Custom description
    this.description = null;
    
    // Width
    if (this.meta.size == 'normal') {
        this.width = 150;
    } else if (this.meta.size == 'small') {
        this.width = 100;
    } else {
        this.width = this.meta.size;
    }

    // History saved before move
    this.historySaved = false;

    // Id
    this.id = id;

    // Do I have focus ?
    this.hasFocus = false;

    // Division (object)
    this.div = null;

    // Is the user dragging ?
    this.drag = null;

    // Last scale
    this.lastScale = null;

    // Parameters
    this.fields = new Fields(this);

    // Position
    this.x = 0;
    this.y = 0;

    // I/Os cardinality
    this.ios = {};

    // Which IO has focus ?
    this.focusedConnector = null;

    // Edges
    this.edges = {};

    // Connectors
    this.connectors = [];
};

// Can this block be used to break a loop ?
Block.prototype.isLoopable = function()
{
    return this.meta.loopable;
};

/**
 * Sets the block description to something custom
 */
Block.prototype.setDescription = function(description)
{
    this.description = description;
    this.div.find('.description').html(description);
};

/**
 * Update the block values
 */
Block.prototype.updateValues = function()
{
    this.blocks.history.save();
};

/**
 * Set the values
 */
Block.prototype.setValues = function(values)
{
    for (field in values) {
        this.fields.getField(field).setValue(values[field]);
    }
};

/**
 * Getting the values
 */
Block.prototype.getValues = function(values)
{
    var values = {};
    for (k in this.fields.editables) {
        var field = this.fields.editables[k];
        values[field.name] = field.getValue();
    }

    return values;
};

/**
 * Getting a field value
 */
Block.prototype.getValue = function(name)
{
    var field = this.fields.getField(name);

    if (field) {
        return field.getValue();
    } else {
        return null;
    }
};

/**
 * Parses a length
 */
Block.prototype.parseDimension = function(dimension)
{
    if (typeof(dimension) == 'number') {
        return dimension;
    }

    var field = this.fields.getField(dimension);
    if (!field) {
        throw 'Unable to find dimension field '+dimension;
    }

    return field.getDimension();
};

/**
 * Html entities on a string
 */
Block.prototype.htmlentities = function(str)
{
    str = str.replace(/</, '&lt;');
    str = str.replace(/>/, '&gt;');
    return str;
}

/**
 * Set the infos of the block
 */
Block.prototype.setInfos = function(html)
{
    this.div.find('.infos').html(html);
};

/**
 * Returns the render of the block
 */
Block.prototype.getHtml = function()
{
    var self = this;
    this.connectors = [];

    // Getting the title
    var title = this.meta.name + '<span class="blockId">#' + this.id + '</span>';
    for (k in this.fields.fields) {
        var field = this.fields.fields[k];
        if (field.asTitle) {
            title = field.getPrintableValue();
        }
    }

    html = '<div class="parameters"></div>';
    html += '<div class="blockTitle"><span class="titleText">'+title+'</span><div class="blockicon delete"></div>';
    html += '<div class="blockicon info"></div>';

    if (this.description) {
        html += '<div class="description">' + self.description + '</div>';
    } else {
        if (this.meta.description) {
            html += '<div class="description">' + this.meta.description + '</div>';
        } else {
            html += '<div class="description">No description</div>';
        }
    }
    html += '<div class="blockicon settings"></div></div>';
    html += '<div class="infos"></div>';
    
    for (k in self.fields.editables) {
        var field = self.fields.editables[k];
        var fieldHtml = field.getHtml();
        if (html && (!field.hide) && (!field.asTitle) && (!this.blocks.compactMode)) {
            html += '<div class="parameter">'+fieldHtml+'</div>';
        }
    }

    // Handling inputs & outputs
    handle = function(key, fields) {
        html += '<div class="' + key + 's '+(self.isLoopable() ? 'loopable' : '')+'">';

        for (k in fields) {
            var field = fields[k];

            if (field.extensible) {
                field.size = self.maxEntry(field.name);
            }

            var size = 1;
            if (field.variadic) {
                size = self.parseDimension(field.dimension);
            }

            for (x=0; x<size; x++) {
                var connectorId = field.name.toLowerCase() + '_' + key;
                var label = field.getLabel().replace('#', x+1);

                var value = '';
                if (field.dynamicLabel != null) {
                    label = String(field.dynamicLabel(self, x));
                } else {
                    if (field && field.is('editable')) {
                        value = ' ('+field.getPrintableValueWithUnit(field.variadic ? x : undefined)+')';
                    }
                }

                if (field.variadic) {
                    connectorId += '_' + x;
                }

                // Generating HTML
                html += '<div class="'+key+' type_'+field.type+' connector '+connectorId+'" rel="'+connectorId+ '"><div class="circle"></div>' + self.htmlentities(label) + value + '</div>';
                self.connectors.push(connectorId);
            }
        }
            html += '</div>';
    };

    handle('input', this.fields.inputs);
    handle('output', this.fields.outputs);

    return html;
};

/**
 * Render the block
 */
Block.prototype.render = function()
{
    this.lastScale = null;
    this.hasFocus = false;
    this.div.html(this.getHtml());
    this.initListeners();
    this.redraw();
};

/**
 * Returns the maximum index of entry for input field name
 */
Block.prototype.maxEntry = function(name)
{
    var max = 0;

    for (connectorId in this.edges) {
        if (this.edges[connectorId].length) {
            var connector = IdToConnector(connectorId);
            if (connector.name == name) {
                max = Math.max(parseInt(connector.index)+1, max);
            }
        }
    }

    return max;
};

/**
 * Creates and inject the div
 */
Block.prototype.create = function(div)
{
    html = '<div id="block' + this.id + '" class="block ' + this.meta['class'] + '"></div>'

    div.append(html);
    this.div = div.find('#block' + this.id);

    this.render();
};

/**
 * Sets the position and the scale of the block
 */
Block.prototype.redraw = function(selected)
{
    // Setting the position
    this.div.css('margin-left', this.blocks.center.x+this.x*this.blocks.scale+'px');
    this.div.css('margin-top', this.blocks.center.y+this.y*this.blocks.scale+'px');

    // Showing/hiding icons
    if (this.blocks.showIcons && this.blocks.scale > 0.8) {
        this.div.find('.blockicon').show();
    } else {
        this.div.find('.blockicon').hide();
    }

    // Rescaling
    if (this.lastScale != this.blocks.scale) {
        this.div.css('font-size', Math.round(this.blocks.scale*this.defaultFont)+'px');
        this.div.css('width', Math.round(this.blocks.scale*this.width)+'px');
    
        var size = Math.round(12*this.blocks.scale);
        this.div.find('.circle').css('width', size+'px');
        this.div.find('.circle').css('height', size+'px');
        this.div.find('.circle').css('background-size', size+'px '+size+'px');

        this.div.find('.inputs, .outputs').width(this.div.width()/2-10);

        this.cssParameters();
        this.lastScale = this.blocks.scale
    }

    // Changing the circle rendering
    for (k in this.connectors) {
        var connectorId = this.connectors[k];
        var connectorDiv = this.div.find('.' + connectorId);
        var connectorVisual = connectorDiv.find('.circle');

        connectorVisual.removeClass('io_active');
        connectorVisual.removeClass('io_selected');
        if (connectorId in this.edges && this.edges[connectorId].length) {
            connectorVisual.addClass('io_active');

            for (n in this.edges[connectorId]) {
                if (this.edges[connectorId][n].selected) {
                    connectorVisual.addClass('io_selected');
                }
            }
        }
    }

    // Updating the fields manager div
    this.fields.div = this.div.find('.parameters');

    // Is selected ?
    this.div.removeClass('block_selected');
    if (selected) {
        this.div.addClass('block_selected');
    }
};

/**
 * Sets the css for the inputs
 */
Block.prototype.cssParameters = function()
{
    this.div.find('input').css('font-size', Math.round(this.blocks.scale*this.defaultFont)+'px');
};

/**
 * Init the function listeners
 */
Block.prototype.initListeners = function()
{
    var self = this;
    // Drag & drop the block
    self.div.find('.blockTitle').mousedown(function(event) {
        if (event.which == 1) {
            self.historySaved = false;
            self.drag = [self.blocks.mouseX/self.blocks.scale-self.x, self.blocks.mouseY/self.blocks.scale-self.y];
        }
    });

    // Handle focus
    self.div.hover(function() {
        self.hasFocus = true;
    }, function() {
        self.hasFocus = false;
    });

    // Handle focus on the I/Os
    self.div.find('.connector').hover(function() {
        self.focusedConnector = $(this).attr('rel');
    }, function() {
        self.focusedConnector = null;
    });
        
    // Dragging
    $('html').mousemove(function(evt) {
        if (self.drag) {
            if (!self.historySaved) {
                self.blocks.history.save();
                self.historySaved = true;
            }
            self.x = (self.blocks.mouseX/self.blocks.scale-self.drag[0]);
            self.y = (self.blocks.mouseY/self.blocks.scale-self.drag[1]);
            self.blocks.redraw();
        }
    });

    // Drag the block
    $('html').mouseup(function() {
        self.drag = null;
    });

    // Draw a link
    self.div.find('.connector').mousedown(function(event) {
        if (event.which == 1) {
            self.blocks.beginLink(self, $(this).attr('rel'));
            event.preventDefault();
        }
    });

    // Handle the parameters
    self.div.find('.settings').click(function() {
        self.fields.toggle();
        self.cssParameters();
    });

    // Handle the deletion
    self.div.find('.delete').click(function() {
        self.blocks.removeBlock(self.blocks.getBlockId(self));
    });

    // Show the description
    self.div.find('.info').hover(function() {
        self.div.find('.description').show();
    }, function() {
        self.div.find('.description').hide();
    });
};

/**
 * Gets the link position for an input or output
 */
Block.prototype.linkPositionFor = function(connector)
{
    var connectorId = connector;

    if (connector instanceof Object) {
        connectorId = connector.id();
    }

    try {
        div = this.div.find('.' + connectorId + ' .circle')

        var x = (div.offset().left-this.blocks.div.offset().left)+div.width()/2;
        var y = (div.offset().top-this.blocks.div.offset().top)+div.height()/2;
    } catch (error) {
        throw 'Unable to find link position for '+connectorId+' ('+error+')';
    }

    return {x: x, y: y};
};

/**
 * Can the io be linked ?
 */
Block.prototype.canLink = function(connector)
{
    var tab = [];
    var connectorId = connector.id();

    if (connectorId in this.edges) {
        tab = this.edges[connectorId];
    }

    var card = this.fields.getField(connector.name).card;

    if (card[1] == '*') {
        return true;
    }

    return (tab.length < card[1]);
};

/**
 * Add an edge
 */
Block.prototype.addEdge = function(connector, edge)
{
    var tab = [];
    var connectorId = connector.id();

    if (this.edges[connectorId] != undefined) {
        tab = this.edges[connectorId];
    }

    tab.push(edge);
    this.edges[connectorId] = tab;
};

/**
 * Erase an edge
 */
Block.prototype.eraseEdge = function(connector, edge)
{
    var connectorId = connector.id();

    if (this.edges[connectorId] != undefined) {
        for (k in this.edges[connectorId]) {
            if (this.edges[connectorId][k] == edge) {
                arrayRemove(this.edges[connectorId], k);
                break;
            }
        }
    }
};

/**
 * Erase the block
 */
Block.prototype.erase = function()
{
    this.div.remove();
};

/**
 * Find all successors of a block, and their successors
 */
Block.prototype.allSuccessors = function()
{
    // Blocks already explored
    var explored = {};
    var exploreList = [this];
    var ids = [this.id];
    explored[this.id] = true;

    while (exploreList.length > 0) {
        var currentBlock = exploreList.pop();

        for (key in currentBlock.edges) {
            for (i in currentBlock.edges[key]) {
                var edge = currentBlock.edges[key][i];
                if (edge.isLoopable()) {
                    continue;
                }
                fromTo = edge.fromTo();

                if (fromTo[0] == currentBlock) {
                    target = fromTo[1];
                    
                    if (!(target.id in explored)) {
                        explored[target.id] = true;
                        exploreList.push(target);
                        ids.push(target.id);
                    }
                }
            }
        }
    }

    return ids;
};

/**
 * Exports the block to JSON
 */
Block.prototype.exportData = function()
{
    return {
        id: this.id,
        x: this.x,
        y: this.y,
        type: this.meta.name,
        module: this.meta.module,
        values: this.getValues()
    };
};

/**
 * Gets the field
 */
Block.prototype.getField = function(name)
{
    return this.fields.getField(name);
};

/**
 * Imports a block from its data
 */
function BlockImport(blocks, data)
{
    for (t in blocks.metas) {
	var meta = blocks.metas[t];
        var module = ('module' in data) ? data.module : null;
	if (meta.name == data.type && meta.module == module) {
	    var block = new Block(blocks, meta, data.id);
	    block.x = data.x;
	    block.y = data.y;
            block.setValues(data.values);
	    return block;
	}
    }

    throw 'Unable to create a block of type ' + data.type;
}
/**
 * Manage the blocks
 *
 * Options can contains :
 * - canLinkInputs (default false): can inputs be linked together?
 * - orientatiion (default true): is the graph oriented?
 */
Blocks = function(options)
{
    if (typeof options != 'undefined') {
        this.options = options;
    } else {
        this.options = {};
    }

    // Types checker
    this.types = new Types;

    // View center & scale
    this.center = {};
    this.scale = 1.0;
    this.redrawTimeout = null;

    // History manager
    this.history = null;

    // Is the user dragging the view ?
    this.moving = null;

    // Is the system ready ?
    this.isReady = false;

    // Compact mode
    this.compactMode = false;

    // Context menu
    this.menu = null;

    // Mouse
    this.mouseX = 0;
    this.mouseY = 0;

    // Linking ?
    this.linking = null;

    // Selected items
    this.selectedLink = null;
    this.selectedSide = null;
    this.selectedBlock = null;

    // BLocks division
    this.div = null;

    // Context for drawingc
    this.context = null;

    // Blocks types
    this.metas = [];

    // Instances
    this.blocks = [];

    // Edges
    this.edges = [];

    /**
     * Next block id
     */
    this.id = 1;

    /**
     * Next edge id
     */
    this.edgeId = 1;

    /**
     * Clears blocks
     */
    this.clear = function()
    {
        this.edges = [];
        this.blocks = [];
        this.id = 1;
        this.edgeId = 1;
        this.div.find('.blocks').html('');
        this.redraw();
    }

    /**
     * Gets an option value
     */
    this.getOption = function(key, defaultValue)
    {
        if (key in this.options) {
            return this.options[key];
        } else {
            return defaultValue;
        }
    }

    /**
     * Show/hide icons
     */
    this.showIcons = true;    
};

/**
 * Runs the blocks editor
 */
Blocks.prototype.run = function(selector)
{
    var self = this;

    $(document).ready(function() {
        self.div = $(selector);

        if (!self.div.size()) {
            alert('blocks.js: Unable to find ' + selector);
        }

        // Inject the initial editor
        self.div.html(
              '<div class="blocks_js_editor">'
            + '<div class="messages"></div>'
            + '<div class="contextmenu"><div class="types"></div></div>'
            + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>'
            + '<div class="blocks"></div>'
            + '</div>'
        );

        self.div.find('svg').css('width', '100%');
        self.div.find('svg').css('height', '100%');

        self.context = self.div.find('svg');

        // Setting up default viewer center
        self.center.x = self.div.width()/2;
        self.center.y = self.div.height()/2;

        // Run the menu
        self.menu = new BlocksMenu(self);

        // Create the message handler
        self.messages = new BlocksMessages(self.div.find('.messages'), self.div.width());

        // Listen for mouse position
        self.div[0].addEventListener('mousemove', function(evt) {
            self.mouseX = evt.pageX - self.div.offset().left;
            self.mouseY = evt.pageY - self.div.offset().top;
            self.move(evt);
        });

        $('html').mouseup(function(event) {
            if (event.which == 1) {
                self.release();
            }
        });

        // Detect clicks on the canvas
        self.div.mousedown(function(event) {
            if (self.canvasClicked()) {
                event.preventDefault();
            } 
            
            if (event.which == 2 || (!self.selectedLink && !self.selectedBlock && event.which == 1)) {
                self.moving = [self.mouseX, self.mouseY];
            }
        });
        
        self.div.mouseup(function(event) {
            if (event.which == 2 || event.which == 1) {
                self.moving = null;
            }
           
            if (event.which == 1) {
                self.menu.hide();
            }
        });
        
        // Initializing canvas
        self.context.svg();

        // Detecting key press
        $(document).keydown(function(e){
            if ($('input').is(':focus')) {
                return;
            }   

            // "del" will delete a selected link
            if (e.keyCode == 46) {
                self.deleteEvent();
            }
        });

        // Binding the mouse wheel
        self.div.bind('mousewheel', function(event, delta, deltaX, deltaY) {
            var dX = self.mouseX - self.center.x;
            var dY = self.mouseY - self.center.y;
            var deltaScale = Math.pow(1.1, deltaY);
            self.center.x -= dX*(deltaScale-1);
            self.center.y -= dY*(deltaScale-1);
            self.scale *= deltaScale;
            self.redraw();
            event.preventDefault();
        });

        self.history = new History(self);

        if (!self.isReady) {
            self.postReady();
        }
    });
};

/**
 * Tell the system is ready
 */
Blocks.prototype.postReady = function()
{
    this.isReady = true;
    if (this.readyQueue != undefined) {
        for (k in this.readyQueue) {
            this.readyQueue[k]();
        }
    }
};

/**
 * Callback when ready
 */
Blocks.prototype.ready = function(callback) 
{
    if (this.isReady) {
        callback();
    } else {
        var queue = [];
        if (this.readyQueue != undefined) {
            queue = this.readyQueue;
        }
        queue.push(callback);
        this.readyQueue = queue;
    }
};

/**
 * Gets the mouse position
 */
Blocks.prototype.getPosition = function()
{
    var position = {};
    position.x = (this.mouseX-this.center.x)/this.scale;
    position.y = (this.mouseY-this.center.y)/this.scale;

    return position;
};

/**
 * Adds a block
 */
Blocks.prototype.addBlock = function(name, x, y)
{
    for (k in this.metas) {
        var type = this.metas[k];

        if (type.name == name) {
            var block = new Block(this, this.metas[k], this.id);
            block.x = x;
            block.y = y;
            block.create(this.div.find('.blocks'));
            this.history.save();
            this.blocks.push(block);
            this.id++;
        }
    }
};

/**
 * Registers a new block type
 */
Blocks.prototype.register = function(meta)
{
    this.metas.push(new Meta(meta));
};

/**
 * Begin to draw an edge
 */
Blocks.prototype.beginLink = function(block, connectorId)
{
    this.linking = [block, connectorId];
    this.highlightTargets();
};

/**
 * Highlight possible targets for a connector ID
 */
Blocks.prototype.highlightTargets = function()
{
    var block = this.linking[0];
    var connector = IdToConnector(this.linking[1]);
    var type = block.getField(connector.name).type;
    $('.connector').addClass('disabled');

    var compatibles = this.types.getCompatibles(type);
    for (k in compatibles) {
        var compatible = compatibles[k];
        $('.connector.type_'+compatible).removeClass('disabled');
    }
};

/**
 * The mouse has moved
 */
Blocks.prototype.move = function()
{
    if (this.selectedSide) {
        var distance = Math.sqrt(Math.pow(this.mouseX-this.selectedSide[1],2)+Math.pow(this.mouseY-this.selectedSide[2],2));
        if (distance > 15) {
            var edge = this.edges[this.selectedLink];
            if (this.selectedSide[0] == 2) {
                this.linking = [edge.block1, edge.connector1.id()];
            } else {
                this.linking = [edge.block2, edge.connector2.id()];
            }

            this.removeEdge(this.selectedLink);
            this.selectedSide = null;
            this.highlightTargets();
            if (this.selectedLink != null) {
                this.edges[this.selectedLink].selected = false;
            }
            this.selectedLink = null;
            this.redraw();
        }
    }

    if (this.moving) {
        this.center.x += (this.mouseX-this.moving[0]);
        this.center.y += (this.mouseY-this.moving[1]);
        this.moving = [this.mouseX, this.mouseY];
        this.redraw();
    }

    if (this.linking) {
        this.redraw();
    }
};

/**
 * Clicks the canvas
 */
Blocks.prototype.canvasClicked = function()
{
    var prevent = false;
    this.selectedBlock = null;
    if (this.selectedLink != null) {
        this.edges[this.selectedLink].selected = false;
    }
    this.selectedLink = null;
    this.selectedSide = null;

    for (k in this.blocks) {
        var block = this.blocks[k];
        if (block.hasFocus) {
            this.selectedBlock = k;
        }
    }

    if (!this.selectedBlock) {
        for (k in this.edges) {
            var collide = this.edges[k].collide(this.mouseX, this.mouseY);
            if (collide != false) {
                if (collide < 0.2) {
                    this.selectedSide = [1, this.mouseX, this.mouseY];
                } else if (collide > 0.8) {
                    this.selectedSide = [2, this.mouseX, this.mouseY];
                }
                this.selectedLink = k;
                this.edges[k].selected = true;
                prevent = true;
                break;
            }
        }
    }
            
    this.redraw();
    return prevent;
};

/**
 * Edge to remove
 */
Blocks.prototype.removeEdge = function(edge)
{
    this.history.save();
    this.edges[edge].erase();
    arrayRemove(this.edges, edge);
};

/**
 * Returns an edge id
 */
Blocks.prototype.getEdgeId = function(edge)
{
    for (k in this.edges) {
        if (edge == this.edges[k]) {
            return k;
        }
    }

    return false;
};
    
/**
 * Remove a block
 */
Blocks.prototype.removeBlock = function(key)
{
    var block = this.blocks[key];

    var newEdges = [];
    for (k in this.edges) {
        var edge = this.edges[k];
        if (edge.block1 == block || edge.block2 == block) {
            edge.erase();
        } else {
            newEdges.push(edge);
        }
    }
    this.edges = newEdges;

    block.erase();
    arrayRemove(this.blocks, this.selectedBlock);

    this.redraw();
};

/**
 * Get a block id
 */
Blocks.prototype.getBlockId = function(block)
{
    for (k in this.blocks) {
        if (this.blocks[k] == block) {
            return k;
        }
    }

    return null;
};

/**
 * Retreive a block by ID
 */
Blocks.prototype.getBlockById = function(blockId)
{
    for (k in this.blocks) {
        if (this.blocks[k].id == blockId) {
            return this.blocks[k];
        }
    }

    return null;
};

/**
 * Delete the current link
 */
Blocks.prototype.deleteEvent = function()
{
    // Remove a block and its edges
    if (this.selectedBlock != null) {
        this.history.save();
        this.removeBlock(this.selectedBlock);
        this.selectedBlock = null;
    }

    // Remove an edge
    if (this.selectedLink != null) {
        this.history.save();
        this.removeEdge(this.selectedLink);
        this.selectedLink = null;
        this.redraw();
    }
};

/**
 * Do the redraw
 */
Blocks.prototype.doRedraw = function()
{
    // Set the position for blocks
    for (k in this.blocks) {
        this.blocks[k].redraw(this.selectedBlock == k);
    }

    // Redraw edges
    var svg = this.context.svg('get');
    svg.clear();

    for (k in this.edges) {
        this.edges[k].draw(svg);
    }

    if (this.linking) {
        try {
            var position = this.linking[0].linkPositionFor(this.linking[1]);

            svg.line(position.x, position.y, this.mouseX, this.mouseY, {
                stroke: 'rgba(0,0,0,0.4)',
                strokeWidth: 3*this.scale
            });
        } catch (error) {
            this.linking = null;
        }
    }
    
    this.redrawTimeout = null;
};

/**
 *  Draw the edges
 */
Blocks.prototype.redraw = function()
{
    var self = this;

    if (!this.redrawTimeout) {
        this.redrawTimeout = setTimeout(function() { self.doRedraw(); }, 25);
    }
};

/**
 * Release the mouse
 */
Blocks.prototype.release = function()
{
    if (this.linking) {
        this.tryEndLink();
        this.linking=null;
    }
    $('.connector').removeClass('disabled');
    this.redraw();
};

/**
 * Tries to end a link
 */
Blocks.prototype.tryEndLink = function()
{
    for (k in this.blocks) {
        var block = this.blocks[k];
        if (block.hasFocus && block.focusedConnector) {
            this.endLink(block, block.focusedConnector);
            break;
        }
    }
};

/**
 * End drawing an edge
 */
Blocks.prototype.endLink = function(block, connectorId)
{
    try {
        var id = this.edgeId++;

        var blockA = this.linking[0];
        var connectorA = IdToConnector(this.linking[1]);
        var blockB = block;
        var connectorB = IdToConnector(connectorId);

        if (connectorA.isOutput()) {
            var edge = new Edge(id, blockA, connectorA, blockB, connectorB, this);
        } else {
            var edge = new Edge(id, blockB, connectorB, blockA, connectorA, this);
        }

        for (k in this.edges) {
            var other = this.edges[k];
            if (other.same(edge)) {
                throw 'This edge already exists';
            }
        }

        var fromTo = edge.fromTo();
        if (fromTo[1].allSuccessors().indexOf(fromTo[0].id) != -1) {
            throw 'You can not create a loop';
        }

        this.history.save();
        edge.create();
        var edgeIndex = this.edges.push(edge)-1;

        var types = edge.getTypes();
        if (!this.types.isCompatible(types[0], types[1])) {
            this.removeEdge(edgeIndex);
            throw 'Types '+types[0]+' and '+types[1]+' are not compatible';
        }
    } catch (error) {
        this.messages.show('Unable to create this edge :' + "\n" + error, {'class': 'error'});
    }
    this.linking = null;
    this.selectedBlock = null;
    this.redraw();
};

/**
 * Changing the compact mode
 */
Blocks.prototype.toggleCompact = function()
{
    this.compactMode = !this.compactMode;
    for (k in this.blocks) {
        this.blocks[k].render();
    }
    this.redraw();
};

/**
 * Export the scene
 */
Blocks.prototype.exportData = function()
{
    var blocks = [];
    var edges = [];

    for (k in this.blocks) {
        blocks.push(this.blocks[k].exportData());
    }

    for (k in this.edges) {
        edges.push(this.edges[k].exportData());
    }

    return {
        edges: edges,
        blocks: blocks
    };
};

/**
 * Import some data
 */
Blocks.prototype.importData = function(scene)
{
    this.clear();
    this.doLoad(scene, false);
}

/**
 * Lads a scene
 */
Blocks.prototype.load = function(scene)
{
    this.doLoad(scene, true);
}

/**
 * Loads the scene
 */
Blocks.prototype.doLoad = function(scene, init)
{
    var self = this;

    this.ready(function() {
            var errors = [];
            self.id = 1;
            self.edgeId = 1;

            for (k in scene.blocks) {
                try {
                    var data = scene.blocks[k];
                    var block = BlockImport(self, data);
                    self.id = Math.max(self.id, block.id+1);
                    block.create(self.div.find('.blocks'));
                    self.blocks.push(block);
                } catch (error) {
                    errors.push('Block #'+k+ ':'+error);
                }
            }

            for (k in scene.edges) {
                try {
                    var data = scene.edges[k];
                    var edge = EdgeImport(self, data);

                    self.edgeId = Math.max(self.edgeId, edge.id+1);

                    edge.create();
                    self.edges.push(edge);
                } catch (error) {
                    errors.push('Edge #'+k+' :'+error);
                }
            }

            if (errors.length) {
                var text = errors.length + " loading errors :<br/>";
                text += '<ul>';
                for (k in errors) {
                    text += '<li>' + errors[k] + '</li>';
                }
                text += '</ul>';
                self.messages.show(text, {'class': 'error'});
            }

            self.redraw();

            if (init) {
                self.perfectScale();	    
            }
    });
};

/**
 * Go to the perfect scale
 */
Blocks.prototype.perfectScale = function()
{
    if (!this.div) {
        return;
    }

    var xMin = null, xMax = null;
    var yMin = null, yMax = null;

    for (k in this.blocks) {
        var block = this.blocks[k];
        if (xMin == null) {
            xMin = xMax = block.x;
            yMin = yMax = block.y;
        } else {
            xMin = Math.min(xMin, block.x-15);
            xMax = Math.max(xMax, block.x+block.width+18);
            yMin = Math.min(yMin, block.y-15);
            yMax = Math.max(yMax, block.y+115);
        }
    }
    var scaleA = this.div.width()/(xMax-xMin);
    var scaleB = this.div.height()/(yMax-yMin);
    var scale = Math.min(scaleA, scaleB);

    this.scale = scale;
    this.center.x = this.div.width()/2 - scale*(xMin+xMax)/2.0;
    this.center.y = this.div.height()/2 - scale*(yMin+yMax)/2.0;

    this.redraw();
}

/**
 * Write labels on the edges, edges is an object of ids => label
 */
Blocks.prototype.setLabels = function(labels)
{
    for (k in this.edges) {
        var edge = this.edges[k];

        if (edge.id in labels) {
            edge.setLabel(labels[k]);
        }
    }
}
