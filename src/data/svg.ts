import * as d3 from "d3-selection";
import data from ".";
import Rect from "../core/Rect";
import logger from "../tools/logger";
import settings from "../tools/settings";
import { Layer } from "../store/LayerStore";

const _svg = new Map<string, SVGElement>();

function parseSvg(text: string, suffix: string = ""): SVGElement {
    const parser = new DOMParser();
    const element = parser.parseFromString(text, "image/svg+xml").documentElement as any as SVGElement;

    if ((element.firstChild as Element).tagName === "parsererror") logger.error("Parsed svg with error: ", svg);

    // prepare map of fill colors per class
    const classFill = new Map<string, string>();
    d3.select(element)
        .selectAll("style")
        .each(function () {
            const css = (this as any).textContent as string;
            const r = /\.([a-z0-9.]+)\s*{[^}]*fill\s*:\s*([^};]+);[^}]*}/gi;
            let m: string[];
            while ((m = r.exec(css)) !== null) {
                const cls = m[1],
                    fill = m[2];
                classFill.set(cls, fill);
            }
        });

    // set fill attrs for elements having class attrs
    d3.select(element)
        .selectAll("*[class]")
        .each(function () {
            const el = this as SVGGraphicsElement;
            el.style.fill = classFill.get(el.className.baseVal);
        });

    _svg.set(suffix, element);
    return element;
}

let svg = parseSvg(window["__fp"]);

const viewboxObj = window["__viewbox"];
const viewboxRect = d3.select(svg).select("rect#VIEWBOX").node() as SVGRectElement;
const viewBoxBaseVal = (svg as any).viewBox.baseVal;
const svgViewBox = Rect.fromXywh(viewBoxBaseVal.x, viewBoxBaseVal.y, viewBoxBaseVal.width, viewBoxBaseVal.height);

let svgArea: Rect;
if (viewboxObj) {
    svgArea = Rect.fromXywh(viewboxObj.x, viewboxObj.y, viewboxObj.width, viewboxObj.height);
    viewboxRect?.remove();
} else if (viewboxRect) {
    svgArea = Rect.fromSvgRectElement(viewboxRect);
    viewboxRect.remove();
} else {
    svgArea = svgViewBox.withPadding(-svgViewBox.w * 0.05, -svgViewBox.h * 0.05);
}
d3.select(svg).attr("width", svgViewBox.w);
d3.select(svg).attr("height", svgViewBox.h);

logger.log("svgArea", svgArea, "svgViewBox", svgViewBox);

settings.wayfinding = !data.hideDirections && window["__wfData"] ? true : false;

let floors = window["__fpLayersMode"]
    ? (d3.select(svg).selectAll("[data-floor]").nodes() as SVGRectElement[])
          .map((f) => {
              f.remove();
              return {
                  name: f.dataset.floor,
                  rect: Rect.fromSvgRectElement(f),
              };
          })
          .sort()
    : [];

export { svgArea, svgViewBox, floors };

export function getTrianglesFromFpPaths(index: number, suffix: string) {
    const mesh = gtePathByIndex(index, suffix);
    // TODO: remove in future versions
    for (const p of mesh.positions) {
        // a bug in svgMesh3d when normalize: false ?
        p[1] = Math.abs(p[1]);
        p.length = 2;
    }
    const pathTriangles = [];
    for (const c of mesh.cells) {
        pathTriangles.push([mesh.positions[c[0]], mesh.positions[c[1]], mesh.positions[c[2]]]);
    }

    return pathTriangles;
}

export let gtePathByIndex = (index: number, suffix: string = "") => {
    try {
        return window[`__fpPaths${suffix}`][index];
    } catch (e) {
        return window["__fpPaths"][index];
    }
};

export let getLayerSvg = (layer: Layer | string = ""): SVGElement => {
    if (typeof layer === "string") {
        if (_svg.has(layer)) return _svg.get(layer);
        if (window[`__fp${layer}`]) return parseSvg(window[`__fp${layer}`], layer);
        else return _svg.get("");
    }

    if (layer.rootParent) {
        if (_svg.has(layer.rootParent.name)) {
            return _svg.get(layer.rootParent.name);
        } else if (window[`__fp${layer.rootParent.name}`]) {
            return parseSvg(window[`__fp${layer.rootParent.name}`], layer.rootParent.name);
        } else {
            return _svg.get("");
        }
    } else if (window[`__fp${layer.name}`]) {
        return parseSvg(window[`__fp${layer.name}`], layer.name);
    }

    return _svg.get("");
};