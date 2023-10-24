const isWebview = (userAgent: string) => {
    return /webview|wv|ip((?!.*Safari)|(?=.*like Safari))|iosWebView|AndroidWebView/i.test(userAgent);
};

export default isWebview;
