const useShadow = document.body.attachShadow && localStorage.getItem("noShadowDom") !== "1" && window["FontFace"];

export default useShadow;
