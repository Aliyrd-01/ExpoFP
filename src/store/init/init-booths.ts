import Color from "color";
import * as d3 from "d3-selection";
import Rect from "../../core/Rect";
import data from "../../data";
import { RawSpecialBooth } from "../../data/Data";
import { getLayerSvg, getTrianglesFromFpPaths } from "../../data/svg";
import { getNextId } from "../../tools/id";
import logger from "../../tools/logger";
import settings from "../../tools/settings";
import { generateUniqueSlug } from "../../tools/slug";
import { sortByName } from "../../utils";
import { extractMetaFromString } from "../../utils/extractMetaFromString";
import { isYahBooth } from "../../utils/yah";
import BoothStore, { Booth, RegularBooth, SpecialBooth } from "../BoothStore";
import { Exhibitor } from "../ExhibitorStore";
import { Layer } from "../LayerStore";
import RootStore from "../RootStore";
import { uiState } from "../index";

const boothsByName = new Map<string, Booth>();
const booths: MutableRequired<Booth>[] = [];

export function iniAllBooths(store: RootStore) {
    // let baseUrl = "https://expofp.github.io/expofp-assets/icons";
    // let xhr = new XMLHttpRequest();
    // xhr.open("GET", baseUrl + "/icons.json", false); // `false` делает запрос синхронным
    // xhr.send();

    // const poiIcons = JSON.parse(xhr.responseText).icons as { id: string; name: string }[];

    // const poiTypes = store.poiTypeStore.poiTypes;

    const copyExh = parseInt(getQueryParam("copy_exh"));

    for (const raw of data.booths || []) {
        const { text, meta } = extractMetaFromString(raw.name);
        raw.meta = meta;

        const b: MutableRequired<Booth> = (raw as RawSpecialBooth).special ? new SpecialBooth() : new RegularBooth();
        Object.assign(b, raw);

        b.slug = generateUniqueSlug(b.name);
        boothsByName.set(b.name.toLowerCase(), b as Booth);
        fixCbre(b as Booth);

        const boothReg = b as MutableRequired<RegularBooth>;
        boothReg.exhibitors = [];
        for (const exhibitorId of raw.exhibitors) {
            const exhibitor = store.exhibitorStore.exhibitorById.get(exhibitorId);
            boothReg.exhibitors.push(exhibitor);
            if (copyExh) {
                dublicateExhibitorsInBooth(exhibitor, boothReg, copyExh);
            }
            exhibitor.booths.push(boothReg as RegularBooth);
        }

        // if not exhibitor and in url has ?copy_exh=number, create test exhibitor in booth
        if (!raw.exhibitors.length && copyExh) {
            dublicateExhibitorsInBooth(null, boothReg, copyExh);
        }

        b.schedule = store.scheduleStore.scheduleItems.filter((s) => s.boothId === b.id);
        // b.poiType = store.poiTypeStore.poiTypes.find((p) => p.id === raw.poiTypeId);

        // if (b.poiType) {
        //     b.poiIcon =
        //         baseUrl +
        //         "/" +
        //         poiIcons.find((p) => p.name == poiTypes.find((pt) => pt.name === b.poiType.name)?.name)?.id +
        //         ".svg";

        //     console.info("poiIcon", b.poiIcon);
        // }

        b.yah = isYahBooth(b as Booth);
        b.name = text;
        booths.push(b);
    }

    // sort booths by name
    booths.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true });
    });

    // sort booths of exhibitors
    for (const e of store.exhibitorStore.exhibitors) {
        sortByName(e.booths);
    }

    store.boothStore.booths = booths as Booth[];

    // dispose
    delete data.booths;
    logger.log("initBooths", store.boothStore.booths.length);
}

const layers = [];

export default function initBooths(store: RootStore, layer: Layer): Booth[] {
    const layerID = layer.name;
    if (layers.indexOf(layerID) > -1) return [];
    layers.push(layerID);

    const { boothStore, layerStore } = store;
    const layerBooths = [];

    const layersEnabled = !!window["__fpLayers"];

    const d3Nodes = d3
        .select(getLayerSvg(layer))
        .selectAll(
            `[data-layer='${layerID}'] [data-tagname='efp-booth'], [data-layer='${layerID}'] > g[id^=b], [data-layer='${layerID}'] > rect[id^=b]`
        )
        .nodes() as (SVGRectElement | SVGPathElement)[];

    for (const el of d3Nodes) {
        const layer = ((el as SVGGraphicsElement).closest("svg > [data-layer]") as SVGGraphicsElement).attributes["data-layer"]
            ?.value;

        if (!layer) continue;

        let rect: SVGRectElement;
        let pathsWithRect = false;
        if (el.tagName === "rect") {
            rect = el as SVGRectElement;
        } else {
            // find any rect
            rect = Array.from(el.children).find((x) => x.tagName === "rect") as SVGRectElement;
            pathsWithRect = rect === el.firstElementChild;
            //if (!rect) continue;
            // // expect rect to be last child
            // rect = el.lastElementChild as SVGRectElement;
            // if (!rect || rect.tagName !== 'rect') continue;
        }
        const idInSvg = (el.id || el.getAttribute("data-name")).substring(1).toLowerCase();

        let booth = boothsByName.get(idInSvg) as MutableRequired<Booth>;
        let boothReg = booth instanceof RegularBooth ? (booth as MutableRequired<RegularBooth>) : null;
        let boothSpec = booth instanceof SpecialBooth ? (booth as MutableRequired<SpecialBooth>) : null;
        if (!booth) {
            logger.error("SVG booth rect not found in __data:", idInSvg);
            // create fake booth
            booth = boothReg = new RegularBooth();
            booth.id = getNextId();
            booth.name = idInSvg.toUpperCase();

            booth.slug = generateUniqueSlug(idInSvg);
            booth.error = true;
            booth.exhibitors = [];
            boothsByName.set(idInSvg, booth as Booth);
            layerBooths.push(booth);
        } else layerBooths.push(booth);

        booth.layer = layersEnabled ? layerStore.layers.find((l) => l.name === layer) : null;
        booth.borderColor = rect?.getAttribute("stroke") || rect?.style.stroke || settings.boothBorderColor || "#FFFFFF";
        booth.borderWidth = parseFloat(rect?.getAttribute("stroke-width") || rect?.style.strokeWidth || "0");

        if (!uiState.heatmap) {
            booth.labelColor = rect?.getAttribute("data-label-color");
        } else {
            const totalClicks = store.heatmapStore.getTotalClicksByBooth(booth as Booth);
            const heatmapColor = Color(store.heatmapStore.getColorByClicks(totalClicks));
            booth.labelColor = heatmapColor.darken(0.3).isLight() ? "#555" : "#fff";
        }

        booth.rect = rect ? Rect.fromSvgRectElement(rect) : null;
        booth.noLabels = !!rect?.dataset.nolabel || rect?.id.startsWith("no");

        if (boothReg) {
            boothReg.availColor = el.getAttribute("data-avail-color") || boothReg.availColor;
            boothReg.soldColor = el.getAttribute("data-sold-color") || boothReg.soldColor;
            boothReg.holdColor = el.getAttribute("data-hold-color") || boothReg.holdColor;
            // svg size is legacy, TODO: remove data-size attribute at 01-01-2022
            boothReg.size = data.dimensionless ? null : boothReg.size || el.getAttribute("data-size");
            boothReg.type = el.getAttribute("data-type") || boothReg.type; //|| el.getAttribute("data-booth-type")
            //boothReg.price = boothReg.price; //el.getAttribute("data-price") ||

            if (boothReg.status === "reserved") {
                boothReg.reserved = true;
            } else if (boothReg.status === "onhold") {
                boothReg.onHold = true;
            }
            //if (boothReg.reserved && boothReg.onHold) boothReg.reserved = false;
        } else {
            boothSpec.color = el.getAttribute("data-color") || boothSpec.color;
        }

        const transform = rect?.getAttribute("transform");
        if (transform) {
            const mt = transform.match(/translate\(([-0-9.]+) ([-0-9.]+)\) rotate\(([-0-9.]+)\)/);
            if (mt) {
                const rotate = parseFloat(mt[3]);
                booth.rotate = (-rotate * Math.PI) / 180;
            } else {
                const mt = transform.match(/rotate\(([-0-9.]+).*\)/);
                if (mt) {
                    const rotate = parseFloat(mt[1]);
                    booth.rotate = (-rotate * Math.PI) / 180;
                } else {
                    const mm = transform.match(
                        /matrix\(\s*([-0-9.]+)\s*(?:,|\s)\s*([-0-9.]+)\s*(?:,|\s)\s*([-0-9.]+)\s*(?:,|\s)\s*([-0-9.]+)\s*(?:,|\s)\s*([-0-9.]+)\s*(?:,|\s)\s*([-0-9.]+)\s*\)/
                    );
                    if (mm) {
                        booth.rotate = Math.asin(-parseFloat(mm[2]));
                    }
                }
            }
            // ET: this is a fix for Illustrator re-save (it can have large rotates)
            const maxDegree = 180;
            if (Math.abs((booth.rotate * 180) / Math.PI) > maxDegree) {
                booth.rotate = booth.rotate - (90 * Math.PI) / 180;
                // also swap width and height of rect
                booth.rect = booth.rect.getRotated90();
            }
        }

        if (el.tagName === "g") {
            booth.paths = [];
            booth.pathsWithRect = pathsWithRect;

            var triangles: number[][][] = [];

            for (const kid of d3.select(el).selectAll("path, rect").nodes() as (SVGPathElement | SVGRectElement)[]) {
                if (kid.tagName === "path") {
                    const path = kid as SVGPathElement;
                    if (path.tagName !== "path") continue;
                    const color = booth.yah ? el.style?.fill?.replace("none", "") || path.style.fill : path.style.fill;
                    const d = parseInt(path.getAttribute("data-index"));
                    booth.paths.push({
                        index: d,
                        color,
                    });

                    if (!rect) {
                        triangles.push(...getTrianglesFromFpPaths(d, layerID));
                    }
                }
            }

            if (triangles.length) {
                let minX = Number.MAX_VALUE;
                let minY = Number.MAX_VALUE;
                let maxX = Number.MIN_VALUE;
                let maxY = Number.MIN_VALUE;
                triangles.forEach((t) => {
                    t.forEach((p) => {
                        minX = Math.min(minX, p[0]);
                        minY = Math.min(minY, p[1]);
                        maxX = Math.max(maxX, p[0]);
                        maxY = Math.max(maxY, p[1]);
                    });
                });

                booth.rect = Rect.fromXywh(minX, minY, maxX - minX, maxY - minY);
                booth.noLabels = true;
            }
        }
    }

    for (const b of layerBooths) {
        if (!b.rect) {
            logger.error("__data booth not found in SVG:", b.name, b);
            layerBooths.splice(layerBooths.indexOf(b), 1);
        } else {
            (b["store"] as BoothStore) = boothStore;
        }
    }

    layerBooths
        .filter((b) => b.yah && b !== store.routeStore.defaultFrom)
        .forEach((btr) => layerBooths.splice(layerBooths.indexOf(btr), 1));

    return layerBooths;
}

function getQueryParam(name: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function dublicateExhibitorsInBooth(exhibitor: Exhibitor | null, booth: MutableRequired<RegularBooth>, times: number) {
    let exh = new Exhibitor() as MutableRequired<Exhibitor>;
    exh.name = "EXHIBITOR NAME";
    exh.slug = "exhibitor-name";
    exh.booths = [];

    exh = exhibitor || exh;

    for (let i = 0; i < times; i++) {
        const copyExhibitor: MutableRequired<Exhibitor> = { ...exh, id: Date.now() };
        booth.exhibitors.push(copyExhibitor as Exhibitor);
    }
}

function fixCbre(b: Booth) {
    if (settings.EXPO === "cbresupplypartner") {
        if (b instanceof RegularBooth && !b.availColor && b.type) {
            if (b.type.indexOf("Premium A - 2m height restriction Passport") !== -1) (b.availColor as string) = "#939393";
            else if (b.type.indexOf("No free-standing") !== -1) (b.availColor as string) = "#BA3DC8";
            else if (b.type.endsWith("Passport")) (b.availColor as string) = "#939393";
            else if (b.type.startsWith("Premium A - 2m")) (b.availColor as string) = "#FF9E4E";
            else if (b.type.startsWith("Premium A - 4m")) (b.availColor as string) = "#EA4335";
            else if (b.type.startsWith("Premium B - 2m")) (b.availColor as string) = "#523BC0";
            else if (b.type.startsWith("Premium C - 2.4m")) (b.availColor as string) = "#3ECC78";
        }
    }
}
