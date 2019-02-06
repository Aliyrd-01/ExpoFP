import { validate } from 'jsonschema'

const schema = {
    type: "object",
    properties: {
        booths: {
            type: "array", required: true,
            items: {
                type: "object",
                properties: {
                    id: { type: "number", required: true },
                    name: { type: "string", required: true },
                    exhibitors: { type: "array", required: true, items: { type: "number" } },
                    isOnHold: { type: "boolean" }
                    //availableColor: { type: "string", required: true },
                    //soldColor: { type: "string", required: true },

                }
            }
        }
    }
};


const res = validate(__data, schema);
if (res.errors.length) {
    console.error('__data jsonschema validation errors: ', res);
} else {
    console.log("__data jsonschema is valid", res);
}


