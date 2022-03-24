import * as d3 from "d3-selection";
import Rect from "../../core/Rect";
import data from "../../data";
import svg from "../../data/svg";
import { getNextId } from "../../tools/id";
import logger from "../../tools/logger";
import settings from "../../tools/settings";
import { generateUniqueSlug } from "../../tools/slug";
import { sortByName } from "../../utils";
import BoothStore, { Booth, RegularBooth, SpecialBooth } from "../BoothStore";
import RootStore from "../RootStore";

export default function initBooths(store: RootStore) {
    const { boothStore } = store;
    const boothsByName = new Map<string, Booth>();

    const booths: MutableRequired<Booth>[] = [];

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
        }

        booths.push(b);
    }

    // sort booths of exhibitors
    for (const e of store.exhibitorStore.exhibitors) {
        sortByName(e.booths);
    }

    for (const el of d3.select(svg).selectAll("#Booths g[id^=b], #Booths rect[id^=b]").nodes() as (
        | SVGRectElement
        | SVGPathElement
    )[]) {
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
            booths.push(booth);
        }

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
        //booth.description = boothSpec.description;// || el.getAttribute("data-description"); // || '<b>Or do this</b>';

        const transform = rect.getAttribute("transform");
        if (transform) {
            const mt = transform.match(/translate\(([-0-9.]+) ([-0-9.]+)\) rotate\(([-0-9.]+)\)/);
            if (mt) {
                // const translateX = parseFloat(mt[1]);
                // const translateY = parseFloat(mt[2]);
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
            if (pathsWithRect && settings.EXPO === "expo" && (booth.slug === "1745" || booth.slug === "1746")) {
                booth.pathsWithRect = false;
            }
            for (const kid of d3.select(el).selectAll("path, rect").nodes() as (SVGPathElement | SVGRectElement)[]) {
                if (kid.tagName === "path") {
                    const path = kid as SVGPathElement;
                    if (path.tagName !== "path") continue;
                    const color = path.style.fill;
                    const d = parseInt(path.getAttribute("data-index"));
                    //if (d !== d) continue;
                    // const triangles = getTrianglesFromFpPaths(d);
                    const pi: PathInfo = {
                        triangles: getTrianglesFromFpPaths(d),
                        color,
                    };
                    booth.paths.push(pi);
                }
            }
        }
    }

    for (const b of booths) {
        if (!b.rect) {
            logger.error("__data booth not found in SVG:", b.name, b);
        } else {
            (b["store"] as BoothStore) = boothStore;
            boothStore.booths.push(b as Booth);
        }
    }

    // dispose
    delete data.booths;
    logger.log("initBooths", boothStore.booths.length);
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

function getTrianglesFromFpPaths(index: number) {
    const mesh = window["__fpPaths"][index];
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
