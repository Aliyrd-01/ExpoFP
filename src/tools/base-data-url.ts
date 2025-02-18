const baseUrl = Array.from(document.getElementsByTagName("script"))
    .filter((x) => x.src.indexOf("/data.js") > -1)[0]
    .src.replace(/data\.js(\?v=\d+)?$/, "");
    
export default baseUrl;
