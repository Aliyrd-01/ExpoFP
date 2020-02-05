import { Booth, RegularBooth, SpecialBooth } from "../../core/Booth";
import Rect from "../../core/Rect";
import { getNextId } from "../../tools/id";
import logger from "../../tools/logger";
import { generateUniqueSlug } from "../../tools/slug";
import { sortByName } from "../../utils";
import RootStore from "../RootStore";

export default function initBooths(store: RootStore) {
    const { boothStore, uiState } = store;
    const boothsByName = new Map<string, Booth>();
    const data = store.fp.data;
    const svg = store.fp.svg;

    const booths: MutableRequired<Booth>[] = [];
    // const stateProvider: BoothStateProvider = {
    //     @observable.ref get listBooths(){

    //     return uiState.listBooths
    //     }
    // };

    for (const raw of data.booths || []) {
        if (raw.special === undefined) {
            const rawRegular = raw as RawRegularBooth;
            boothStore.boothExhibitors.set(rawRegular.name, rawRegular.exhibitors);
            delete rawRegular.exhibitors;
        }

        const Class = raw.special === true ? SpecialBooth : RegularBooth;
        const b = Object.setPrototypeOf(raw, Class.prototype) as MutableRequired<Booth>;
        b.state = uiState;
        //const b: MutableRequired<Booth> = (raw as RawSpecialBooth).special ? new SpecialBooth() : new RegularBooth();
        //Object.assign(b, raw);

        (b as MutableRequired<Booth>).slug = generateUniqueSlug(b.name);
        boothsByName.set(b.name.toLowerCase(), b as Booth);

        // if (b instanceof RegularBooth) {
        //     const boothReg = b as MutableRequired<RegularBooth>;
        //     boothReg.exhibitors = [];
        //     for (const exhibitorId of (raw as RawRegularBooth).exhibitors) {
        //         const exhibitor = store.exhibitorStore.exhibitorById.get(exhibitorId);
        //         boothReg.exhibitors.push(exhibitor);
        //         exhibitor.booths.push(boothReg as RegularBooth);
        //     }
        // }

        booths.push(b);
    }

    

    for (const sb of svg.booths) {
        let booth = boothsByName.get(sb.name) as MutableRequired<Booth>;
        let boothReg = booth instanceof RegularBooth ? (booth as MutableRequired<RegularBooth>) : null;
        let boothSpec = booth instanceof SpecialBooth ? (booth as MutableRequired<SpecialBooth>) : null;
        if (!booth) {
            logger.error("SVG booth rect not found in __data:", sb.name);
            // create fake booth
            booth = boothReg = new RegularBooth();
            booth.id = getNextId();
            booth.name = sb.name.toUpperCase();
            booth.slug = generateUniqueSlug(sb.name);
            booth.error = true;
            booth.exhibitors = [];
            boothsByName.set(sb.name, booth as Booth);
            booths.push(booth);
        }

        booth.paths = sb.paths;
        booth.rect = Rect.fromSvgJsonRect(sb.rect);
        booth.rotate = sb.rotate;
        booth.noLabels = sb.noLabels;

        if (boothReg) {
            boothReg.availColor = sb.availColor || boothReg.availColor;
            boothReg.soldColor = sb.soldColor || boothReg.soldColor;
            boothReg.holdColor = sb.holdColor || boothReg.holdColor;
            boothReg.type = sb.type || boothReg.type;

            // if (boothReg.status === "reserved") {
            //     boothReg.reserved = true;
            // } else if (boothReg.status === "onhold") {
            //     boothReg.onHold = true;
            // }
            //if (boothReg.reserved && boothReg.onHold) boothReg.reserved = false;
        } else {
            boothSpec.color = sb.color || boothSpec.color;
        }
    }

    for (const b of booths) {
        if (!b.rect) {
            logger.error("__data booth not found in SVG:", b.name, b);
        } else {
            //(b["store"] as BoothStore) = boothStore;
            boothStore.booths.push(b as Booth);
        }
    }
    
    // sort booths by name
    boothStore.booths.sort(function(a, b) {
        const x = a.slug;
        const y = b.slug;
        return x < y ? -1 : x > y ? 1 : 0;
    });

    // // sort booths of exhibitors
    // for (const e of store.exhibitorStore.exhibitors) {
    //     sortByName(e.booths);
    // }

    // dispose
    delete data.booths;
    logger.log("initBooths", boothStore.booths.length);
}

// function fixCbre(b: Booth) {
//     if (settings.EXPO === "cbresupplypartner") {
//         if (b instanceof RegularBooth && !b.availColor && b.type) {
//             if (b.type.indexOf("Premium A - 2m height restriction Passport") !== -1) (b.availColor as string) = "#939393";
//             else if (b.type.indexOf("No free-standing") !== -1) (b.availColor as string) = "#BA3DC8";
//             else if (b.type.endsWith("Passport")) (b.availColor as string) = "#939393";
//             else if (b.type.startsWith("Premium A - 2m")) (b.availColor as string) = "#FF9E4E";
//             else if (b.type.startsWith("Premium A - 4m")) (b.availColor as string) = "#EA4335";
//             else if (b.type.startsWith("Premium B - 2m")) (b.availColor as string) = "#523BC0";
//             else if (b.type.startsWith("Premium C - 2.4m")) (b.availColor as string) = "#3ECC78";
//         }
//     }
// }

// function getTrianglesFromFpPaths(svgLegacy: SvgLegacy, index: number) {
//     const mesh = svgLegacy.paths[index];
//     // TODO: remove in future versions
//     for (const p of mesh.positions) {
//         // a bug in svgMesh3d when normalize: false ?
//         p[1] = Math.abs(p[1]);
//         p.length = 2;
//     }
//     const pathTriangles = [];
//     for (const c of mesh.cells) {
//         pathTriangles.push([mesh.positions[c[0]], mesh.positions[c[1]], mesh.positions[c[2]]]);
//     }

//     return pathTriangles;
// }
