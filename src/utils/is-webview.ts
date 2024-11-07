const isWebview = /webview|wv|ip((?!.*Safari)|(?=.*like Safari))|iosWebView|AndroidWebView/i.test(navigator.userAgent);

export default isWebview;
