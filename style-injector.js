function insertStyle(element) {
    window["__efpStyleElements"].push(element);
    var event = new CustomEvent("__efpStyleLoad");
    window.dispatchEvent(event);
}

module.exports = insertStyle;