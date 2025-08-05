const baseUrl = (document.currentScript as HTMLScriptElement).getAttribute("src").replace(/expofp(?:-[a-zA-Z0-9]+)?\.js.*$/, "");

export default baseUrl;
