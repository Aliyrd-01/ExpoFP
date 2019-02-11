import { validate } from "jsonschema";
import schema from "@/data.schema.json";

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

// some data fixed
if (!__data.homeUrl && EFP_EXPO === "jtrade19") __data.homeUrl = "https://www.jtrade.co.uk/";
if (!__data.homeUrl) __data.homeUrl = 'https://expofp.com/';

// convert obsolete fields and fix false/empty strings/arrays
for (const booth of __data.booths) {
    const b = booth as any;
    booth.onHold = b.isOnHold;
    booth.availColor = b.availableColor;
    booth.type = b.boothTypeName;

    booth.exhibitors = booth.exhibitors || [];
}

for (const exhibitor of __data.exhibitors) {
    const e = exhibitor as any;
    exhibitor.featured = e.isFeatured;
    exhibitor.email = e.publicEmail;

    exhibitor.categories = exhibitor.categories || [];
}
