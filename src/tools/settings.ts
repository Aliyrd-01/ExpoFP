import deepmerge from "deepmerge";

export class FpSettings {
    boothLabelColor: string = "#fff";
    boothBorderColor: string = "#fff";
    backgroundColor: string = "#ebebeb";
    boothBorderWidth:number;
}

class Settings extends FpSettings {
    // this is not replaced with const, so calls to settings.EXPO won't get replaced with const
    // this is done for template to work
    EXPO: string = window["__efpEvent"]; //process.env.REACT_APP_EFP_EXPO,
    borderless: boolean = false;
    wayfinding: boolean = false;
    // borderWidth: 1,
    colors = {
        // base: "#ebebeb",
        booths: {
            default: "#41b6e7",
            selected: "#fb3e59", //'#002cff',
            empty: "rgba(0,0,0,0.205)", // this is #aaa for default BG #d6d6d6d
        },
    };
}

// console.log("aaa", window["__efpEvent"]);
let settings = new Settings();

if (settings.EXPO === "jtrade19") {
    settings.colors.booths.selected = "#dc6533";
} else if (settings.EXPO === "ktrade20") {
    settings.borderless = true;
}

// else if (settings.EXPO === "eventtechlive2019") {
//     settings.borderless = true;
// }

// if (
//     (process.env.REACT_APP_EFP_EXPO === "aweusa2020" ||
//         process.env.REACT_APP_EFP_EXPO === "ktrade20" ||
//         process.env.REACT_APP_EFP_EXPO === "sydneybuildexpo") &&
//     (process.env.REACT_APP_MODE === "deploy-dev" || process.env.REACT_APP_MODE === "start")
// ) {
//     settings.borderless = true;
// }

settings = deepmerge(settings, window["__settings"] || window["__fpSettings"] || {});
settings = deepmerge<any, FpSettings>(settings, (window["__fpSettings"] as FpSettings) || {});

export default settings;
// extendGlobal({ __settings: settings })

// declare global {
//     const __settings: typeof settings;
// }
