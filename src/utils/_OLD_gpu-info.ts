import logger from "../tools/logger";

const canvas = document.createElement("canvas");
let gl;
let debugInfo;
let vendor = "";
let renderer = "";

try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
        debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
} catch (e) {}

logger.log("GPU vendor: ", vendor);
logger.log("GPU renderer: ", renderer);

export default {
    vendor,
    renderer
};
