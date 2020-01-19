import deepmerge from "deepmerge";

let settings = {
    // this is not replaced with const, so calls to settings.EXPO won't get replaced with const
    // this is done for template to work
    EXPO: window["__efpEvent"], //process.env.REACT_APP_EFP_EXPO,
    borderless: false,
    // borderWidth: 1,
    colors: {
        // base: "#ebebeb",
        booths: {
            default: "#41b6e7",
            selected: "#fb3e59", //'#002cff',
            empty: "rgba(0,0,0,0.205)" // this is #aaa for default BG #d6d6d6d
        }
    }
};

if (settings.EXPO === "jtrade19") {
    settings.colors.booths.selected = "#dc6533";
} else if (settings.EXPO === "ktrade20") {
    settings.borderless = true;
}


settings = deepmerge(settings, window["__settings"] || {});
export default settings;
