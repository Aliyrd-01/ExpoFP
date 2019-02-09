import { validate } from "jsonschema";
import schema from "@/data.schema.json";

// const schema = {
//     type: "object",
//     properties: {
//         booths: {
//             type: "array",
//             required: true,
//             items: {
//                 type: "object",
//                 properties: {
//                     id: { type: "number", required: true },
//                     name: { type: "string", required: true },
//                     exhibitors: { type: "array", required: true, items: { type: "number" } },
//                     isOnHold1: { type: "boolean", required: true }
//                     //availableColor: { type: "string", required: true },
//                     //soldColor: { type: "string", required: true },
//                 }
//             }
//         }
//     }
// };

const res = validate(__data, schema);
if (res.errors.length) {
    console.error("__data jsonschema validation errors: ", res);
} else {
    console.log("__data jsonschema is valid", res);
}

// convert obsolete fields
for (const booth of __data.booths) {
    const b = booth as any;
    booth.onHold = booth.isOnHold;
    booth.availColor = booth.availableColor;
    booth.type = booth.boothTypeName;
}
for (const exhibitor of __data.exhibitors) {
    const e = exhibitor as any;
    exhibitor.featured = exhibitor.isFeatured;
    exhibitor.email = exhibitor.publicEmail;
}
