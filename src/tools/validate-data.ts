import { validate } from "jsonschema";
import schema from "@/data.schema.json";
import baseUrl from "./base-data-url";

// before data validation
if (!__data.exhibitors) __data.exhibitors = [];
if (!__data.booths) __data.booths = [];
if (!__data.categories) __data.categories = [];
if (!__data.gtag && EFP_EXPO === "jtrade19") __data.gtag = "UA-134602409-3";
if (!__data.gtag && EFP_EXPO === "expo") __data.gtag = "UA-134602409-2";

const res = validate(__data, schema);
if (res.errors.length) {
    console.error("__data jsonschema validation errors: ", res);
} else {
    console.log("__data jsonschema is valid", res);
}

if (__settings.debug) {
    for (const name of Object.keys(__data)) {
        const errors = new Set<string>();
        for (const b of __data[name]) {
            const kk = Object.keys(b);
            for (const k of kk) {
                const val = b[k];
                if (val === "") {
                    errors.add(`__data.${name}.${k} is sometimes empty string. Don't pass empty strings.`);
                } else if (val === false) {
                    errors.add(`__data.${name}.${k} is sometimes false. Don't pass false for booleans.`);
                } else if (Array.isArray(val) && val.length === 0) {
                    errors.add(`__data.${name}.${k} is sometimes empty array. Don't pass empty arrays.`);
                }
            }
        }
        errors.forEach(e => console.warn(e));
    }
}

// some data fixes (expo-specific will be removed)
if (!__data.logo && EFP_EXPO === "expo") __data.logo = "../logo.svg";
if (!__data.logo) __data.logo = "../" + EFP_EXPO + "-logo.png";
if (!__data.homeUrl && EFP_EXPO === "jtrade19") __data.homeUrl = "https://www.jtrade.co.uk/";
// this is permanent
if (!__data.homeUrl) __data.homeUrl = "https://expofp.com/";
if (!__data.boothTerm) __data.boothTerm = "Booth";
if (EFP_EXPO === "expo") {
    const expoExpoAds = [2567, 2704, 2681, 2592, 2740, 2709, 2482, 2609, 2734, 2696, 2840, 2566, 2736];
    __data.exhibitors.filter(x => x.logo && expoExpoAds.indexOf(x.id) !== -1).forEach(x => (x.advertise = true));
}

// convert obsolete fields and fix false/empty strings/arrays
for (const booth of __data.booths) {
    const b = booth as any;
    // normalize special
    booth.special = !!booth.special;
    if (booth.special === false) {
        if (typeof booth.onHold === "undefined") booth.onHold = b.isOnHold;
        if (typeof booth.availColor === "undefined") booth.availColor = b.availableColor;
        if (typeof booth.type === "undefined") booth.type = b.boothTypeName;
        booth.exhibitors = booth.exhibitors || [];
    }
}

for (const exhibitor of __data.exhibitors) {
    const e = exhibitor as any;
    if (typeof exhibitor.featured === "undefined") exhibitor.featured = e.isFeatured;
    if (typeof exhibitor.email === "undefined") exhibitor.email = e.publicEmail;

    exhibitor.categories = exhibitor.categories || [];
}
