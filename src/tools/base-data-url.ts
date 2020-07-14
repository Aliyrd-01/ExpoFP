const baseUrl = Array.from(document.getElementsByTagName("script"))
    .filter((x) => x.src.indexOf("data.js") > -1)[0]
    .src.replace(/data\.js(\?v=\d{1,3})?$/, "");

export default baseUrl;
