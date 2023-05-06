import { RawExhibitor } from "../data/Data";
import lzUtils from "./lz-utils";

const url = new URL(window.location.href);

var exhibitor: RawExhibitor = null;

const data = url.searchParams.get("__data");
if (data){
    exhibitor = JSON.parse(data).exhibitors[0]
}
else{
    const lzdata = url.searchParams.get("__lzdata");
    if (lzdata){
        const decompressedData = lzUtils.decompress(lzdata);
        exhibitor = JSON.parse(decompressedData).exhibitors[0]; 
    }
}

export default exhibitor;

