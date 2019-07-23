window["dataLayer"] = window["dataLayer"] || [];

export default function gtag(...args:any[]) {
    window["dataLayer"].push(arguments);
}

if (__data.gtag) {
    // insert script
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${__data.gtag}`;
    const x = document.getElementsByTagName("script")[0];
    x.parentNode.insertBefore(s, x);

    // initial view
    gtag("js", new Date());
    gtag("config", __data.gtag);
}

window["gtag"] = gtag;


