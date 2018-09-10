export {}

namespace local {
    export function extendGlobal(obj: any) {
        for (let k of Object.keys(obj)) {
            (<any>window)[k] = (<any>obj)[k];
        }
    }
}

declare global {
    function extendGlobal(obj:any):void;
}

local.extendGlobal({ extendGlobal: local.extendGlobal })