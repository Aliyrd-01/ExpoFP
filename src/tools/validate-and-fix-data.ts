import { validate } from "jsonschema"; // TODO: import and validate conditionally
import schema from "../data.schema.json";
// import isDebug from "../utils/is-debug";
import logger from "./logger";
// import baseUrl from "./base-data-url";

export default function validateData(data: Data, eventId: string) {
    // before data validation
    if (!data.exhibitors) data.exhibitors = [];
    if (!data.booths) data.booths = [];
    if (!data.categories) data.categories = [];
    if (!data.gtag && eventId === "jtrade19") data.gtag = "UA-134602409-3";
    if (!data.gtag && eventId === "expo") data.gtag = "UA-134602409-2";

    // temporary workaround for invalid data.js
    if (data.exhibitors.length > 0) {
        for (const booth of data.booths) {
            delete booth["reserved"];
        }
    }

    // if (eventId === "miblive2020") {
    //     data.booths
    //         .filter((b: any) => b.special !== true)
    //         .forEach((b: any) => {
    //             b.reserved = true;
    //             delete b.exhibitors;
    //         });
    //     data.exhibitors = [];
    // }
    //  if (eventId === "ktrade20") data.hideCompanies = true;
    // if (eventId === "sbexpo") data.hideCompanies = true;
    // if (eventId === "miblive2020") data.hideCompanies = true;
    // if (localStorage.getItem("hideCompanies")) data.hideCompanies = true;
    // data.hideCompanies = !!data.hideCompanies;
    //if (isDebug) data.registerUrl = "http://google.com";

    if (data["free"]) {
        data.noAds = true;
        data.noFeatured = true;
        data.expoFpAd = true;
    }

    // if (isDebug && eventId === "sydneybuildexpo") data.free = true;

    const validationEnabled = __efpDebug || localStorage.getItem("validate") === "1";

    if (validationEnabled) {
        const res = validate(data, schema);
        if (res.errors.length) {
            console.error("data jsonschema validation errors: ", res);
        } else {
            console.log("data jsonschema is valid", res);
        }
    } else {
        console.log(
            "data JSON Schema validation disabled. Run `localStorage.setItem('validate', 1)` in Console to enable validation.`"
        );
    }

    // validation is a heavy process (using Url.parse) - so let's disable by default for all
    if (validationEnabled) {
        for (const name of Object.keys(data)) {
            if (data[name][Symbol.iterator] !== "function") continue;
            const errors = new Set<string>();
            for (const b of data[name]) {
                const kk = Object.keys(b);
                for (const k of kk) {
                    const val = b[k];
                    if (val === "") {
                        errors.add(`data.${name}.${k} is sometimes empty string. Don't pass empty strings.`);
                    } else if (val === false) {
                        errors.add(`data.${name}.${k} is sometimes false. Don't pass false for booleans.`);
                    } else if (Array.isArray(val) && val.length === 0) {
                        errors.add(`data.${name}.${k} is sometimes empty array. Don't pass empty arrays.`);
                    }
                }
            }
            errors.forEach(e => logger.warn(e));
        }
    }

    // some data fixes (expo-specific will be removed)
    if (!data.logo && eventId === "expo") data.logo = "../logo.svg";
    if (!data.logo) data.logo = "../" + eventId + "-logo.png";
    if (!data.homeUrl && eventId === "jtrade19") data.homeUrl = "https://www.jtrade.co.uk/";
    // this is permanent
    if (!data.homeUrl) data.homeUrl = "https://expofp.com/";
    if (!data.boothTerm) data.boothTerm = "Booth";
    if (eventId === "expo") {
        const expoExpoAds = [2567, 2704, 2681, 2592, 2740, 2709, 2482, 2609, 2734, 2696, 2840, 2566, 2736];
        data.exhibitors.filter(x => x.logo && expoExpoAds.indexOf(x.id) !== -1).forEach(x => (x.advertise = true));
    }

    // convert obsolete fields and fix false/empty strings/arrays
    for (const booth of data.booths) {
        const b = booth as any;
        // normalize special
        // booth.special = !!booth.special;
        if (!(booth as RawSpecialBooth).special) {
            const regBooth = booth as RawRegularBooth;
            if (typeof regBooth["onHold"] === "undefined") regBooth["onHold"] = b.isOnHold;
            if (typeof regBooth.availColor === "undefined") regBooth.availColor = b.availableColor;
            if (typeof regBooth.type === "undefined") regBooth.type = b.boothTypeName;
            regBooth.exhibitors = regBooth.exhibitors || [];
        }
    }

    for (const exhibitor of data.exhibitors) {
        const e = exhibitor as any;
        if (typeof exhibitor.featured === "undefined") exhibitor.featured = e.isFeatured;
        if (typeof exhibitor.email === "undefined") exhibitor.email = e.publicEmail;

        exhibitor.categories = exhibitor.categories || [];
    }

    // disable ads and featured for free plans
    if (data.noFeatured) {
        data.exhibitors.forEach(e => (e.featured = false));
    }
    if (data.noAds) {
        data.exhibitors.forEach(e => (e.advertise = false));
    }
}
