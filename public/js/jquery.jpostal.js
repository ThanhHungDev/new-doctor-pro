/*jslint browser:true, devel:true*/
/*jslint unparam:true*/
/*global window, $, jQuery*/

/**
 * jquery.jpostal.js ver2.7
 * 
 * Copyright 2014, Aoki Makoto, Ninton G.K. http://www.ninton.co.jp
 * 
 * Released under the MIT license - http://en.wikipedia.org/wiki/MIT_License
 * 
 * Requirements
 * jquery.js
 */
var Jpostal = {};

Jpostal.Database = function () {
    "use strict";

    this.address = [];    // database cache
    this.map     = {};
    this.url     = {
        'http'  : '//jpostal-1006.appspot.com/json/',
        'https' : '//jpostal-1006.appspot.com/json/'
    };
};

Jpostal.Database.prototype.find = function (i_postcode) {
    "use strict";

    var address = [];

    this.address.forEach(function (eachAddress) {
        if (eachAddress[0] === '_' + i_postcode) {
            address = eachAddress;
        }
    });

    return address;
};

Jpostal.Database.prototype.get = function (i_postcode) {
    "use strict";

    //    --------------------------------------------------
    //    i_postcode    find()    find()    result
    //                1234567    123
    //    --------------------------------------------------
    //    1             -        -        defaults
    //    12            -        -        defaults
    //    123           -        Y        find( '123' )
    //    123           -        N        defaults
    //    1234          -        Y        find( '123' )
    //    1234          -        N        defaults
    //    1234567       Y        -        find( '1234567' )
    //    1234567       N        Y        find( '123' )
    //    1234567       N        N        defaults
    //    --------------------------------------------------
    var defaults = ['', '', '', '', '', '', '', '', ''],
        address,
        head3;

    switch (i_postcode.length) {
    case 3:
    case 4:
    case 5:
    case 6:
        head3 = i_postcode.substr(0, 3);
        address = this.find(head3);
        address = $.extend(defaults, address);
        break;

    case 7:
        address = this.find(i_postcode);
        if (address.length === 0) {
            head3 = i_postcode.substr(0, 3);
            address = this.find(head3);
        }
        address = $.extend(defaults, address);
        break;

    default:
        address = defaults;
        break;
    }

    return address;
};

Jpostal.Database.prototype.getUrl = function (i_head3) {
    "use strict";

    var url = '';

    switch (this.getProtocol()) {
    case 'http:':
        url = this.url.http;
        break;

    case 'https:':
        url = this.url.https;
        break;
    }
    url = url + i_head3 + '.json';

    try {
        url = url + '?referer=' + encodeURIComponent(window.location.href);
    } catch (e) {}

    return url;
};

Jpostal.Database.prototype.request = function (i_postcode, i_callback) {
    "use strict";

    var head3,
        url,
        options;

    head3 = i_postcode.substr(0, 3);

    if (i_postcode.length <= 2 || this.getStatus(head3) !== 'none' || head3.match(/\D/)) {
        return false;
    }
    this.setStatus(head3, 'waiting');

    url = this.getUrl(head3);

    options = {
        async         : true,
        dataType      : 'jsonp',
        jsonpCallback : 'jQuery_jpostal_callback',
        type          : 'GET',
        url           : url,
        success       : function () {    // function(i_data, i_dataType
            i_callback();
        },
        timeout : 5000    // msec
    };
    this.ajax(options);
    return true;
};

Jpostal.Database.prototype.ajax = function (options) {
    "use strict";

    $.ajax(options);
};

Jpostal.Database.prototype.save = function (i_data) {
    "use strict";

    var that = this;

    i_data.forEach(function (rcd) {
        var postcode = rcd[0];

        if (that.map[postcode] === undefined) {
            that.address.push(rcd);
            that.map[postcode] = {state : 'complete', time : 0};
        } else if (that.map[postcode].state === 'waiting') {
            that.address.push(rcd);
            that.map[postcode].state = 'complete';
        }
    });
};

Jpostal.Database.prototype.getStatus = function (i_postcode) {
    "use strict";

    //    --------------------------------------------------
    //    #    ['_001']    ..state        .time        result
    //    --------------------------------------------------
    //    1     =undefined    -            -            none
    //    2    !=undefined    'complete'    -           complete
    //    3    !=undefined    'waiting'    <5sec        waiting
    //    4    !=undefined    'waiting'    >=5sec       none
    //    --------------------------------------------------
    var st = '',
        postcode = '_' + i_postcode,
        t_ms;

    if (this.map[postcode] === undefined) {
        // # 1
        st = 'none';

    } else if ('complete' === this.map[postcode].state) {
        // # 2
        st = 'complete';

    } else {
        t_ms = this.getTime() - this.map[postcode].time;
        if (t_ms < 5000) {
            // # 3
            st = 'waiting';

        } else {
            // # 4
            st = 'none';
        }
    }

    return st;
};

Jpostal.Database.prototype.setStatus = function (i_postcode) {
    "use strict";

    var postcode = '_' + i_postcode;

    if (this.map[postcode] === undefined) {
        this.map[postcode] = {
            state : 'waiting',
            time  : 0
        };
    }

    this.map[postcode].time = this.getTime();
};

Jpostal.Database.prototype.getProtocol = function () {
    "use strict";

    return window.location.protocol;
};

Jpostal.Database.prototype.getTime = function () {
    "use strict";

    return (new Date()).getTime();
};

(function () {
    "use strict";

    var instance;

    Jpostal.Database.getInstance = function () {
        if (instance === undefined) {
            instance = new Jpostal.Database();
        }
        return instance;
    };
}());

Jpostal.Jpostal = function (i_JposDb) {
    "use strict";

    this.address  = '';
    this.jposDb   = i_JposDb;
    this.options  = {};
    this.postcode = '';
    this.minLen   = 3;
};

Jpostal.Jpostal.prototype.displayAddress = function () {
    "use strict";

    var that = this;

    if (this.postcode === '000info') {
        this.address[2] += ' ' + this.getScriptSrc();
    }

    Object.keys(this.options.address).forEach(function (key) {
        var format = that.options.address[key],
            value = that.formatAddress(format, that.address);

        if (that.isSelectTagForPrefecture(key, format)) {
            that.setSelectTagForPrefecture(key, value);
        } else {
            $(key).val(value);
            that.trigger(key);
        }
    });
};

Jpostal.Jpostal.prototype.isSelectTagForPrefecture = function (i_key, i_fmt) {
    "use strict";

    // ﾃｩﾆ陳ｽﾃｩﾂ≫愿･ﾂｺﾅ禿ｧﾅ毒墜δ�ｮSELECTﾄ�堋ｿﾄ�堋ｰﾄδ≫ｹﾃｯﾂｼﾅｸ
    var f;

    switch (i_fmt) {
    case '%3':
    case '%p':
    case '%prefecture':
        if ($(i_key).get(0).tagName.toUpperCase() === 'SELECT') {
            f = true;
        } else {
            f = false;
        }
        break;

    default:
        f = false;
        break;
    }
    return f;
};

Jpostal.Jpostal.prototype.setSelectTagForPrefecture = function (i_key, i_value) {
    "use strict";

    var value,
        el;

    // ﾃｩﾆ陳ｽﾃｩﾂ≫愿･ﾂｺﾅ禿ｧﾅ毒墜δ�ｮSELECTﾄ�堋ｿﾄ�堋ｰ
    // ﾄ�堋ｱﾄθ陳ｼﾄ�堋ｹ1: <option value="ﾃｦﾂ敖ｱﾃ､ﾂｺﾂｬﾃｩﾆ陳ｽ">ﾃｦﾂ敖ｱﾃ､ﾂｺﾂｬﾃｩﾆ陳ｽ</option>
    $(i_key).val(i_value);
    if ($(i_key).val() === i_value) {
        this.trigger(i_key);
        return;
    }

    // ﾄ�堋ｱﾄθ陳ｼﾄ�堋ｹ2: valueﾄδ�津ｦ窶｢ﾂｰﾃ･竄ｬﾂ､(ﾃｨ窶｡ﾂｪﾃｦﾂｲﾂｻﾃ､ﾂｽ窶愼�堋ｳﾄθ陳ｼﾄθ停ｰﾄδ�ｮﾃ･ ﾂｴﾃ･ﾂ斥�δ�津･ﾂ､ﾂ堝δ≫�)
    //    ﾄθ停�ﾄ�堋ｭﾄ�堋ｹﾄθ塚�δ�墜�ぎﾅ津･ﾅ停氾ｦﾂｵﾂｷﾃｩﾂ≫愼�ぎﾂ再�壺凖･ﾂ青ｫﾄ�壺ぎﾄδ≫ｹﾄδ�ｩﾄδ≫�ﾄδ≫ｹﾄδ�ｧﾃ･ﾋ�､ﾃｦ窶督ｭﾄδ≫┐ﾄ�壺ｹ
    //    <option value="01">ﾃ･ﾅ停氾ｦﾂｵﾂｷﾃｩﾂ≫�(01)</option>
    //    <option value="1">1.ﾃ･ﾅ停氾ｦﾂｵﾂｷﾃｩﾂ≫�</option>
    value = '';
    el = $(i_key)[0];
    Object.keys(el.options).forEach(function (i) {
        var p = String(el.options[i].text).indexOf(i_value);
        if (0 <= p) {
            value = el.options[i].value;
        }
    });

    if (value !== '') {
        $(i_key).val(value);
        this.trigger(i_key);
    }

};

Jpostal.Jpostal.prototype.trigger = function (i_key) {
    "use strict";

    if (this.options.trigger === undefined || this.options.trigger[i_key] === undefined || this.options.trigger[i_key] === false) {
        return;
    }
    $(i_key).trigger("change");
};

Jpostal.Jpostal.prototype.formatAddress = function (i_fmt, i_address) {
    "use strict";

    var s = i_fmt,
        that = this;

    s = s.replace(/%3|%p|%prefecture/, i_address[1]);
    s = s.replace(/%4|%c|%city/,       i_address[2]);
    s = s.replace(/%5|%t|%town/,       i_address[3]);
    s = s.replace(/%6|%a|%address/,    i_address[4]);
    s = s.replace(/%7|%n|%name/,       i_address[5]);

    s = s.replace(/%8/,  i_address[6]);
    s = s.replace(/%9/,  i_address[7]);
    s = s.replace(/%10/, i_address[8]);

    s = s.replace(/%([ASHKV]+)8/, function (match, p1) {
        return that.mb_convert_kana(i_address[6], p1);
    });
    s = s.replace(/%([ASHKV]+)9/, function (match, p1) {
        return that.mb_convert_kana(i_address[7], p1);
    });
    s = s.replace(/%([ASHKV]+)10/, function (match, p1) {
        return that.mb_convert_kana(i_address[8], p1);
    });

    return s;
};

Jpostal.Jpostal.prototype.mb_convert_kana = function (i_str, i_option) {
    "use strict";

    var str = i_str,
        i,
        o,
        funcs;

    function tr(i_str, map) {
        var reg = new RegExp("(" + Object.keys(map).join("|") + ")", "g");

        return i_str.replace(reg, function (s) {
            return map[s];
        });
    }

    funcs = {
        A: function (i_str) {
            var reg = /[A-Za-z0-9!#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}]/g,
                s;

            s = i_str.replace(reg, function (s) {
                return String.fromCharCode(s.charCodeAt(0) + 65248);
            });

            return s;
        },
        S: function (i_str) {
            return i_str.replace(/\u0020/g, '\u3000');
        },
        H: function (i_str) {
            var map = {
                "ﾃｯﾂｽﾂｱ": "ﾄδ≫�",
                "ﾃｯﾂｽﾂｲ": "ﾄδ≫�",
                "ﾃｯﾂｽﾂｳ": "ﾄδ≫�",
                "ﾃｯﾂｽﾂｴ": "ﾄδ⇒�",
                "ﾃｯﾂｽﾂｵ": "ﾄδ��",
                "ﾃｯﾂｽﾂｶ": "ﾄδ≫ｹ",
                "ﾃｯﾂｽﾂｷ": "ﾄδ��",
                "ﾃｯﾂｽﾂｸ": "ﾄδ��",
                "ﾃｯﾂｽﾂｹ": "ﾄδ≫�",
                "ﾃｯﾂｽﾂｺ": "ﾄδ≫�",
                "ﾃｯﾂｽﾂｻ": "ﾄδ≫｢",
                "ﾃｯﾂｽﾂｼ": "ﾄδ≫�",
                "ﾃｯﾂｽﾂｽ": "ﾄδ≫┐",
                "ﾃｯﾂｽﾂｾ": "ﾄδ≫ｺ",
                "ﾃｯﾂｽﾂｿ": "ﾄδ��",
                "ﾃｯﾂｾ竄ｬ": "ﾄδ�ｸ",
                "ﾃｯﾂｾﾂ�": "ﾄδ�｡",
                "ﾃｯﾂｾ窶�": "ﾄδ�､",
                "ﾃｯﾂｾﾆ�": "ﾄδ�ｦ",
                "ﾃｯﾂｾ窶�": "ﾄδ�ｨ",
                "ﾃｯﾂｾ窶ｦ": "ﾄδ�ｪ",
                "ﾃｯﾂｾ窶�": "ﾄδ�ｫ",
                "ﾃｯﾂｾ窶｡": "ﾄδ�ｬ",
                "ﾃｯﾂｾﾋ�": "ﾄδ�ｭ",
                "ﾃｯﾂｾ窶ｰ": "ﾄδ�ｮ",
                "ﾃｯﾂｾﾂ�": "ﾄδ�ｯ",
                "ﾃｯﾂｾ窶ｹ": "ﾄδ�ｲ",
                "ﾃｯﾂｾﾅ�": "ﾄδ�ｵ",
                "ﾃｯﾂｾﾂ�": "ﾄδ�ｸ",
                "ﾃｯﾂｾﾂ�": "ﾄδ�ｻ",
                "ﾃｯﾂｾﾂ�": "ﾄδ�ｾ",
                "ﾃｯﾂｾﾂ�": "ﾄδ�ｿ",
                "ﾃｯﾂｾ窶�": "ﾄ�壺ぎ",
                "ﾃｯﾂｾ窶�": "ﾄ�堋�",
                "ﾃｯﾂｾ窶�": "ﾄ�壺�",
                "ﾃｯﾂｾ窶�": "ﾄ�壺�",
                "ﾃｯﾂｾ窶｢": "ﾄ�壺�",
                "ﾃｯﾂｾ窶�": "ﾄ�塒�",
                "ﾃｯﾂｾ窶�": "ﾄ�壺ｰ",
                "ﾃｯﾂｾﾋ�": "ﾄ�堋�",
                "ﾃｯﾂｾ邃｢": "ﾄ�壺ｹ",
                "ﾃｯﾂｾﾂ�": "ﾄ�塲�",
                "ﾃｯﾂｾ窶ｺ": "ﾄ�堋�",
                "ﾃｯﾂｾﾅ�": "ﾄ�堋�",
                "ﾃｯﾂｽﾂｦ": "ﾄ�壺�",
                "ﾃｯﾂｾﾂ�": "ﾄ�壺�",
                "ﾃｯﾂｽﾂｧ": "ﾄδ��",
                "ﾃｯﾂｽﾂｨ": "ﾄδ��",
                "ﾃｯﾂｽﾂｩ": "ﾄδ≫ｦ",
                "ﾃｯﾂｽﾂｪ": "ﾄδ≫｡",
                "ﾃｯﾂｽﾂｫ": "ﾄδ≫ｰ",
                "ﾃｯﾂｽﾂｯ": "ﾄδ�｣",
                "ﾃｯﾂｽﾂｬ": "ﾄ�堡�",
                "ﾃｯﾂｽﾂｭ": "ﾄ�壺ｦ",
                "ﾃｯﾂｽﾂｮ": "ﾄ�壺｡",
                "ﾃｯﾂｽﾂ｡": "ﾄ�ぎ窶�",
                "ﾃｯﾂｽﾂ､": "ﾄ�ぎﾂ�",
                "ﾃｯﾂｽﾂｰ": "ﾄθ陳ｼ",
                "ﾃｯﾂｽﾂ｢": "ﾄ�ぎﾅ�",
                "ﾃｯﾂｽﾂ｣": "ﾄ�ぎﾂ�",
                "ﾃｯﾂｽﾂ･": "ﾄθ陳ｻ",
                "ﾃｯﾂｾﾂ�": "ﾄ�壺ｺ",
                "ﾃｯﾂｾﾅｸ": "ﾄ�塲�"
            };
            return tr(i_str, map);
        },
        K: function (i_str) {
            var map = {
                "ﾃｯﾂｽﾂｱ": "ﾄ�堋｢",
                "ﾃｯﾂｽﾂｲ": "ﾄ�堋､",
                "ﾃｯﾂｽﾂｳ": "ﾄ�堋ｦ",
                "ﾃｯﾂｽﾂｴ": "ﾄ�堋ｨ",
                "ﾃｯﾂｽﾂｵ": "ﾄ�堋ｪ",
                "ﾃｯﾂｽﾂｶ": "ﾄ�堋ｫ",
                "ﾃｯﾂｽﾂｷ": "ﾄ�堋ｭ",
                "ﾃｯﾂｽﾂｸ": "ﾄ�堋ｯ",
                "ﾃｯﾂｽﾂｹ": "ﾄ�堋ｱ",
                "ﾃｯﾂｽﾂｺ": "ﾄ�堋ｳ",
                "ﾃｯﾂｽﾂｻ": "ﾄ�堋ｵ",
                "ﾃｯﾂｽﾂｼ": "ﾄ�堋ｷ",
                "ﾃｯﾂｽﾂｽ": "ﾄ�堋ｹ",
                "ﾃｯﾂｽﾂｾ": "ﾄ�堋ｻ",
                "ﾃｯﾂｽﾂｿ": "ﾄ�堋ｽ",
                "ﾃｯﾂｾ竄ｬ": "ﾄ�堋ｿ",
                "ﾃｯﾂｾﾂ�": "ﾄθ陳�",
                "ﾃｯﾂｾ窶�": "ﾄθ停�",
                "ﾃｯﾂｾﾆ�": "ﾄθ停�",
                "ﾃｯﾂｾ窶�": "ﾄθ塚�",
                "ﾃｯﾂｾ窶ｦ": "ﾄθ陳�",
                "ﾃｯﾂｾ窶�": "ﾄθ停ｹ",
                "ﾃｯﾂｾ窶｡": "ﾄθ椎�",
                "ﾃｯﾂｾﾋ�": "ﾄθ陳�",
                "ﾃｯﾂｾ窶ｰ": "ﾄθ陳�",
                "ﾃｯﾂｾﾂ�": "ﾄθ陳�",
                "ﾃｯﾂｾ窶ｹ": "ﾄθ停�",
                "ﾃｯﾂｾﾅ�": "ﾄθ停｢",
                "ﾃｯﾂｾﾂ�": "ﾄθ塚�",
                "ﾃｯﾂｾﾂ�": "ﾄθ停ｺ",
                "ﾃｯﾂｾﾂ�": "ﾄθ陳�",
                "ﾃｯﾂｾﾂ�": "ﾄθ椎ｸ",
                "ﾃｯﾂｾ窶�": "ﾄθ� ",
                "ﾃｯﾂｾ窶�": "ﾄθ陳｡",
                "ﾃｯﾂｾ窶�": "ﾄθ陳｢",
                "ﾃｯﾂｾ窶�": "ﾄθ陳､",
                "ﾃｯﾂｾ窶｢": "ﾄθ陳ｦ",
                "ﾃｯﾂｾ窶�": "ﾄθ陳ｨ",
                "ﾃｯﾂｾ窶�": "ﾄθ陳ｩ",
                "ﾃｯﾂｾﾋ�": "ﾄθ陳ｪ",
                "ﾃｯﾂｾ邃｢": "ﾄθ陳ｫ",
                "ﾃｯﾂｾﾂ�": "ﾄθ陳ｬ",
                "ﾃｯﾂｾ窶ｺ": "ﾄθ陳ｭ",
                "ﾃｯﾂｾﾅ�": "ﾄθ陳ｯ",
                "ﾃｯﾂｽﾂｦ": "ﾄθ陳ｲ",
                "ﾃｯﾂｾﾂ�": "ﾄθ陳ｳ",
                "ﾃｯﾂｽﾂｧ": "ﾄ�堋｡",
                "ﾃｯﾂｽﾂｨ": "ﾄ�堋｣",
                "ﾃｯﾂｽﾂｩ": "ﾄ�堋･",
                "ﾃｯﾂｽﾂｪ": "ﾄ�堋ｧ",
                "ﾃｯﾂｽﾂｫ": "ﾄ�堋ｩ",
                "ﾃｯﾂｽﾂｯ": "ﾄθ槌�",
                "ﾃｯﾂｽﾂｬ": "ﾄθ陳｣",
                "ﾃｯﾂｽﾂｭ": "ﾄθ陳･",
                "ﾃｯﾂｽﾂｮ": "ﾄθ陳ｧ",
                "ﾃｯﾂｽﾂ｡": "ﾄ�ぎ窶�",
                "ﾃｯﾂｽﾂ､": "ﾄ�ぎﾂ�",
                "ﾃｯﾂｽﾂｰ": "ﾄθ陳ｼ",
                "ﾃｯﾂｽﾂ｢": "ﾄ�ぎﾅ�",
                "ﾃｯﾂｽﾂ｣": "ﾄ�ぎﾂ�",
                "ﾃｯﾂｽﾂ･": "ﾄθ陳ｻ",
                "ﾃｯﾂｾﾂ�": "ﾄ�壺ｺ",
                "ﾃｯﾂｾﾅｸ": "ﾄ�塲�"
            };
            return tr(i_str, map);
        },
        V: function (i_str) {
            var map = {
                "ﾄδ≫ｹﾄ�壺ｺ": "ﾄδ��",
                "ﾄδ�再�壺ｺ": "ﾄδ��",
                "ﾄδ�焼�壺ｺ": "ﾄδ��",
                "ﾄδ≫估�壺ｺ": "ﾄδ≫�",
                "ﾄδ≫愼�壺ｺ": "ﾄδ≫�",
                "ﾄδ≫｢ﾄ�壺ｺ": "ﾄδ≫�",
                "ﾄδ≫汎�壺ｺ": "ﾄδ⇒�",
                "ﾄδ≫┐ﾄ�壺ｺ": "ﾄδ��",
                "ﾄδ≫ｺﾄ�壺ｺ": "ﾄδ��",
                "ﾄδ�敍�壺ｺ": "ﾄδ��",
                "ﾄδ�ｸﾄ�壺ｺ": "ﾄδ� ",
                "ﾄδ�｡ﾄ�壺ｺ": "ﾄδ�｢",
                "ﾄδ�､ﾄ�壺ｺ": "ﾄδ�･",
                "ﾄδ�ｦﾄ�壺ｺ": "ﾄδ�ｧ",
                "ﾄδ�ｨﾄ�壺ｺ": "ﾄδ�ｩ",
                "ﾄδ�ｯﾄ�壺ｺ": "ﾄδ�ｰ",
                "ﾄδ�ｲﾄ�壺ｺ": "ﾄδ�ｳ",
                "ﾄδ�ｵﾄ�壺ｺ": "ﾄδ�ｶ",
                "ﾄδ�ｸﾄ�壺ｺ": "ﾄδ�ｹ",
                "ﾄδ�ｻﾄ�壺ｺ": "ﾄδ�ｼ",
                "ﾄδ�ｯﾄ�塲�": "ﾄδ�ｱ",
                "ﾄδ�ｲﾄ�塲�": "ﾄδ�ｴ",
                "ﾄδ�ｵﾄ�塲�": "ﾄδ�ｷ",
                "ﾄδ�ｸﾄ�塲�": "ﾄδ�ｺ",
                "ﾄδ�ｻﾄ�塲�": "ﾄδ�ｽ",

                "ﾄ�堋ｫﾄ�壺ｺ": "ﾄ�堋ｬ",
                "ﾄ�堋ｭﾄ�壺ｺ": "ﾄ�堋ｮ",
                "ﾄ�堋ｯﾄ�壺ｺ": "ﾄ�堋ｰ",
                "ﾄ�堋ｱﾄ�壺ｺ": "ﾄ�堋ｲ",
                "ﾄ�堋ｳﾄ�壺ｺ": "ﾄ�堋ｴ",
                "ﾄ�堋ｵﾄ�壺ｺ": "ﾄ�堋ｶ",
                "ﾄ�堋ｷﾄ�壺ｺ": "ﾄ�堋ｸ",
                "ﾄ�堋ｹﾄ�壺ｺ": "ﾄ�堋ｺ",
                "ﾄ�堋ｻﾄ�壺ｺ": "ﾄ�堋ｼ",
                "ﾄ�堋ｽﾄ�壺ｺ": "ﾄ�堋ｾ",
                "ﾄ�堋ｿﾄ�壺ｺ": "ﾄθ停ぎ",
                "ﾄθ陳��壺ｺ": "ﾄθ停�",
                "ﾄθ停榮�壺ｺ": "ﾄθ停ｦ",
                "ﾄθ停�ﾄ�壺ｺ": "ﾄθ停｡",
                "ﾄθ塚��壺ｺ": "ﾄθ停ｰ",
                "ﾄθ陳焼�壺ｺ": "ﾄθ陳�",
                "ﾄθ停卞�壺ｺ": "ﾄθ停�",
                "ﾄθ停｢ﾄ�壺ｺ": "ﾄθ停�",
                "ﾄθ塚愼�壺ｺ": "ﾄθ停┐",
                "ﾄθ停ｺﾄ�壺ｺ": "ﾄθ椎�",
                "ﾄθ陳焼�塲�": "ﾄθ停�",
                "ﾄθ停卞�塲�": "ﾄθ停�",
                "ﾄθ停｢ﾄ�塲�": "ﾄθ停�",
                "ﾄθ塚愼�塲�": "ﾄθ陳�",
                "ﾄθ停ｺﾄ�塲�": "ﾄθ陳�"
            };
            return tr(i_str, map);
        }
    };

    for (i = 0; i < i_option.length; i += 1) {
        o = i_option[i];
        str = funcs[o](str);
    }

    return str;
};

Jpostal.Jpostal.prototype.getScriptSrc = function () {
    "use strict";

    var src = '',
        el_arr,
        i,
        n,
        el_src;

    el_arr = document.getElementsByTagName('script');
    n = el_arr.length;
    for (i = 0; i < n; i += 1) {
        el_src = el_arr[i].src;
        if (0 <= el_src.indexOf("jquery.jpostal.js")) {
            src = el_src;
            break;
        }
    }

    return src;
};

Jpostal.Jpostal.prototype.init = function (i_options) {
    "use strict";

    if (i_options.postcode === undefined) {
        throw new Error('postcode undefined');
    }
    if (i_options.address === undefined) {
        throw new Error('address undefined');
    }

    this.options.postcode = [];
    if (typeof i_options.postcode === 'string') {
        this.options.postcode.push(i_options.postcode);
    } else {
        this.options.postcode = i_options.postcode;
    }

    this.options.address = i_options.address;

    if (i_options.url !== undefined) {
        this.jposDb.url = i_options.url;
    }

    this.options.trigger = {};
    if (i_options.trigger !== undefined) {
        this.options.trigger = i_options.trigger;
    }
};

Jpostal.Jpostal.prototype.main = function () {
    "use strict";

    var that,
        f;

    this.scanPostcode();
    if (this.postcode.length < this.minLen) {
        // git hub issue #4: ﾃｩﾆ陳ｵﾃ､ﾂｾﾂｿﾃｧ窶｢ﾂｪﾃ･ﾂ渉ｷﾃｦﾂｬ窶榮δ��0ﾃｯﾂｽﾂ�2ﾃｦ窶凪｡ﾃ･ﾂｭ窶汎δ�ｮﾄδ�ｨﾄδ�再�ぎﾂ�､ﾂｽﾂ湘ｦ窶ｰ竄ｬﾃｦﾂｬ窶榮�壺凖ｧﾂｩﾂｺﾃｦﾂｬ窶榮δ�ｫﾄδ≫ｺﾄδ�堝�ぎﾂ�･窶ｦﾂ･ﾃ･ﾂ岩ｺﾃ･窶�窶ｦﾃ･ﾂｮﾂｹﾄ�壺凖ｧﾂｶﾂｭﾃｦﾅ陳�δ≫汎δ�ｦﾄδ�ｻﾄδ≫汎δ≫� 
        return;
    }

    that = this;
    f = this.jposDb.request(this.postcode, function () {
        that.callback();
    });
    if (!f) {
        this.callback();
    }
};

Jpostal.Jpostal.prototype.callback = function () {
    "use strict";

    this.address = this.jposDb.get(this.postcode);
    this.displayAddress();
};

Jpostal.Jpostal.prototype.scanPostcode = function () {
    "use strict";

    var s = '',
        s3,
        s4;

    switch (this.options.postcode.length) {
    case 0:
        break;

    case 1:
        //    github issue #8: 1ﾄδ�､ﾃｧ窶ｺﾂｮﾄ�壺凖ｧﾂｩﾂｺﾃｦﾂｬ窶榮�ぎﾂ�2ﾄδ�､ﾃｧ窶ｺﾂｮﾄ�壺卞�ぎﾅ�001ﾄ�ぎﾂ再δ�ｨﾄδ≫汎δ�ｦﾄ�壺堝�ぎﾂ��ぎﾅ�001ﾄ�ぎﾂ再δ�ｨﾄδ≫汎δ�ｦﾃ･ﾅ停氾ｦﾂｵﾂｷﾃｩﾂ≫愿ｦﾅ督ｭﾃ･ﾂｹﾅ津･ﾂｸ窶堝�壺凖ｨﾂ｡ﾂｨﾃｧﾂ､ﾂｺﾄδ≫汎δ�ｦﾄδ≫汎δ�ｾﾄδ≫�
        //    ----------------------------------------
        //    case    postcode    result
        //    ----------------------------------------
        //    1        ''            ''
        //    1        12            ''
        //    2        123           123
        //    2        123-          123
        //    2        123-4         123
        //    3        123-4567      1234567
        //    2        1234          123
        //    4        1234567       1234567
        //    ----------------------------------------
        s = String($(this.options.postcode[0]).val());
        if (0 <= s.search(/^([0-9]{3})([0-9A-Za-z]{4})/)) {
            // case 4
            s = s.substr(0, 7);
        } else if (0 <= s.search(/^([0-9]{3})-([0-9A-Za-z]{4})/)) {
            // case 3
            s = s.substr(0, 3) + s.substr(4, 4);
        } else if (0 <= s.search(/^([0-9]{3})/)) {
            // case 2
            s = s.substr(0, 3);
        } else {
            // case 1
            s = '';
        }
        break;

    case 2:
        //    github issue #8: 1ﾄδ�､ﾃｧ窶ｺﾂｮﾄ�壺凖ｧﾂｩﾂｺﾃｦﾂｬ窶榮�ぎﾂ�2ﾄδ�､ﾃｧ窶ｺﾂｮﾄ�壺卞�ぎﾅ�001ﾄ�ぎﾂ再δ�ｨﾄδ≫汎δ�ｦﾄ�壺堝�ぎﾂ��ぎﾅ�001ﾄ�ぎﾂ再δ�ｨﾄδ≫汎δ�ｦﾃ･ﾅ停氾ｦﾂｵﾂｷﾃｩﾂ≫愿ｦﾅ督ｭﾃ･ﾂｹﾅ津･ﾂｸ窶堝�壺凖ｨﾂ｡ﾂｨﾃｧﾂ､ﾂｺﾄδ≫汎δ�ｦﾄδ≫汎δ�ｾﾄδ≫�
        //    ----------------------------------------
        //    case    post1    post2    result
        //    ----------------------------------------
        //    1        ''        ---        ''
        //    1        12        ---        ''
        //    2        123        ''        123
        //    2        123        4         123
        //    3        123        4567      1234567
        //    ----------------------------------------
        s3 = String($(this.options.postcode[0]).val());
        s4 = String($(this.options.postcode[1]).val());
        if (0 <= s3.search(/^[0-9]{3}$/)) {
            if (0 <= s4.search(/^[0-9A-Za-z]{4}$/)) {
                // case 3
                s = s3 + s4;
            } else {
                // case 2
                s = s3;
            }
        } else {
            // case 1
            s = '';
        }
        break;
    }

    this.postcode = s;
};

//    MEMO: For the following reason, JposDb was put on the global scope, not local scope.
//    ---------------------------------------------------------------------
//     data file    callback            JposDb scope
//    ---------------------------------------------------------------------
//    001.js        JposDb.save            global scope
//    001.js.php    $_GET['callback']    local scopde for function($){}
//    ---------------------------------------------------------------------
window.jQuery_jpostal_callback = function (i_data) {
    "use strict";

    Jpostal.Database.getInstance().save(i_data);
};


(function (factory) {
    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(require("jquery"), window, document);
    } else {
        factory(jQuery, window, document);
    }
//}(function ($, window, document, undefined) {
}(function ($) {
    "use strict";

    $.fn.jpostal = function (i_options) {
        var Jpos,
            selector;

        Jpos = new Jpostal.Jpostal(Jpostal.Database.getInstance());
        Jpos.init(i_options);

        if (typeof i_options.click === 'string' && i_options.click !== '') {
            $(i_options.click).bind('click', function () {
                Jpos.main();
            });
        } else {
            selector = Jpos.options.postcode[0];
            $(selector).bind('keyup change', function () {
                Jpos.main();
            });

            if (1 <= Jpos.options.postcode.length) {
                selector = Jpos.options.postcode[1];
                $(selector).bind('keyup change', function () {
                    Jpos.main();
                });
            }
        }
    };

}));