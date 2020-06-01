const baseUrl = (document.currentScript as HTMLScriptElement).getAttribute("src").replace(/expofp\.js.*$/, "");

export default baseUrl;
