const baseUrl = Array.from(document.getElementsByTagName("script"))
    .filter(x => x.src.endsWith("data.js"))[0]
    .src.replace(/data.js$/, "");
    
export default baseUrl;