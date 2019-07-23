var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
// Typescript has its polyfill, but not complete
if (isIE11 && Array.from) {
    var orig = Array.from;
    Array.from = function (arrayLike) {
        if (arrayLike.forEach) {
            var ar = [];
            arrayLike.forEach(function (x) { ar.push(x); });
            return ar;
        }
        return orig(arrayLike);
    }
}

if (isIE11) {
    Map.prototype.keys = function () {
        var ar = [];
        this.forEach(function (value, key) { ar.push(key); })
        return ar;
    }
}

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, pos) {
            pos = !pos || pos < 0 ? 0 : +pos;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}