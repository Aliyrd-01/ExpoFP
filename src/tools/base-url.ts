// TODO: make it work in webworker

const baseUrl = (document.currentScript as HTMLScriptElement).getAttribute("src").replace(/expofp\.js.*$/, "");
// console.log("baseUrl", baseUrl)
//alert(baseUrl)
export default baseUrl;
