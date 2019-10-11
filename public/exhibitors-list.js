(function(d) {
    var mm = d.getElementsByTagName("script");
    var expo;
    var m;
    for (var i = 0; i < mm.length; i++) {
        var m = mm[i];
        var src = m.getAttribute("data-src") || m.src;
        var ma = src.match(/^http(s?):\/\/([^.]+)\.expofp\.com\/exhibitors-list\.js/);
        console.log(src);
        if (ma) {
            expo = ma[2];
            break;
        }
    }
    if (!expo) {
        console.error("Cannot find expo");
    }

    var s = d.createElement("script");
    s.src = "https://expofp.com/js_dist/embed/exhibitors-list.min.js";
    s.async = 1;

    s.onload = function() {
        exhibitorsList("#exhibitors-list", expo);
    };

    m.parentNode.insertBefore(s, m);
})(document);
