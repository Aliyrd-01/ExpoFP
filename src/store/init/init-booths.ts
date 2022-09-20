import * as d3 from "d3-selection";
import Rect from "../../core/Rect";
import data from "../../data";
import { getLayerSvg } from "../../data/svg";
import { getNextId } from "../../tools/id";
import logger from "../../tools/logger";
import settings from "../../tools/settings";
import { generateUniqueSlug } from "../../tools/slug";
import { sortByName } from "../../utils";
import BoothStore, { Booth, RegularBooth, SpecialBooth } from "../BoothStore";
import { Exhibitor } from "../ExhibitorStore";
import RootStore from "../RootStore";

const boothsByName = new Map<string, Booth>();
const booths: MutableRequired<Booth>[] = [];

export function iniAllBooths(store: RootStore) {
    for (const raw of data.booths || []) {
        const b: MutableRequired<Booth> = (raw as RawSpecialBooth).special ? new SpecialBooth() : new RegularBooth();
        Object.assign(b, raw);

        b.slug = generateUniqueSlug(b.name);
        boothsByName.set(b.name.toLowerCase(), b as Booth);
        fixCbre(b as Booth);

        if (b instanceof RegularBooth) {
            const boothReg = b as MutableRequired<RegularBooth>;
            boothReg.exhibitors = [];
            for (const exhibitorId of (raw as RawRegularBooth).exhibitors) {
                const exhibitor = store.exhibitorStore.exhibitorById.get(exhibitorId);
                boothReg.exhibitors.push(exhibitor);
                exhibitor.booths.push(boothReg as RegularBooth);
            }

            boothReg.exhibitors = boothReg.exhibitors.sort((a: Exhibitor, b: Exhibitor) => {
                if (a.featured !== b.featured) return a.featured ? -1 : 1;
                return a.name > b.name ? 1 : -1;
            });
        }
        booths.push(b);
    }

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

export default function initBooths(store: RootStore, layerID: string): Booth[] {
    if (layers.indexOf(layerID) > -1) return [];
    layers.push(layerID);

    const { boothStore, layerStore } = store;
    const layerBooths = [];

    const layersEnabled = !!window["__fpLayers"];

    for (const el of d3
        .select(getLayerSvg(layerID))
        .selectAll(
            `[data-layer='${layerID}'] > [data-tagname='efp-booth'], [data-layer='${layerID}'] > g[id^=b], [data-layer='${layerID}'] > rect[id^=b]`
        )
        .nodes() as (SVGRectElement | SVGPathElement)[]) {
        const layer = (el.parentNode as SVGGraphicsElement).attributes["data-layer"]?.value;

        if (!layer) continue;

        let rect: SVGRectElement;
        let pathsWithRect = false;
        if (el.tagName === "rect") {
            rect = el as SVGRectElement;
        } else {
            // find any rect
            rect = Array.from(el.children).find((x) => x.tagName === "rect") as SVGRectElement;
            pathsWithRect = rect === el.firstElementChild;
            if (!rect) continue;
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

        if (layersEnabled) booth.layer = layerStore.layers.find((l) => l.name === layer);

        booth.rect = Rect.fromSvgRectElement(rect);
        booth.noLabels = !!rect.dataset.nolabel || rect.id.startsWith("no");
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

        const transform = rect.getAttribute("transform");
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
            const maxDegree = 45.5;
            if (booth.rotate > (maxDegree / 180) * Math.PI) {
                booth.rotate = booth.rotate - (90 * Math.PI) / 180;
                // also swap width and height of rect
                booth.rect = booth.rect.getRotated90();
            }
        }

        if (!booth.rotate && booth.rect.h > booth.rect.w * 2.0 && (booth.title || booth.name).length > 5) {
            booth.rotate = (90 * Math.PI) / 180;
            booth.rect = booth.rect.getRotated90();
        }

        if (el.tagName === "g") {
            booth.paths = [];
            booth.pathsWithRect = pathsWithRect;

            for (const kid of d3.select(el).selectAll("path, rect").nodes() as (SVGPathElement | SVGRectElement)[]) {
                if (kid.tagName === "path") {
                    const path = kid as SVGPathElement;
                    if (path.tagName !== "path") continue;
                    const color = path.style.fill;
                    const d = parseInt(path.getAttribute("data-index"));
                    booth.paths.push({
                        index: d,
                        color,
                    });
                }
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

    // boothStore.booths = boothStore.booths.concat(layerBooths);

    return layerBooths;
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
