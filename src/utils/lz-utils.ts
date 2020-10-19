import LZString from "lz-string";

function compress(s: string){
    const a: number[] = LZString.compressToUint8Array(s) as any;
    return btoa(String.fromCharCode(...a))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, ".");
}

function decompress(s: string){
    s = s
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .replace(/\./g, "=");
    return LZString.decompressFromBase64(s);
}

export default {
    compress,
    decompress
};