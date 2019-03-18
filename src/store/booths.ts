import svg from "@/tools/svg";
import { generateUniqueSlug } from "@/services/slug";
import { getNextId } from "@/services/id";
// import {replaceLetter} from '@/tools/demo-replace'

//__data.booths.splice(3);

const booths = __data.booths.reduce((a, c) => (a[c.id] = c) && a, {} as { [id: number]: Booth });
//const boothsBySlug = new Map<string, Booth>();
const boothsByName = new Map<string, Booth>();

// setup slugs
for (const b of Object.values(booths)) {
    // if (EFP_EXPO === "demo"){
    //     // debugger;
    //     b.name = b.name.replace(/^(A|B|C|D|E)(\d+)$/, (m, p1, p2) => replaceLetter(p1) + p2);
    // }

    b.slug = generateUniqueSlug(b.name);
    b.hideName = b.name.startsWith("_");
    //boothsBySlug.set(b.slug, b);
    boothsByName.set(b.name.toLowerCase(), b);
}

for (const r of d3
    .select(svg)
    .select("#Booths")
    .selectAll("rect")
    .nodes() as SVGRectElement[]) {
    const idInSvg = (r.getAttribute("data-name") || r.id).substring(1).toLowerCase();
    let booth = boothsByName.get(idInSvg);
    if (!booth) {
        console.error("SVG booth not found in __data: ", idInSvg);
        // create fake booth
        booth = {
            id: getNextId(),
            name: idInSvg.toUpperCase(),
            slug: generateUniqueSlug(idInSvg),
            exhibitors: [],
            error: true
        } as any;
        booths[booth.id] = booth;
    } //else

    const transform = r.getAttribute("transform");
    if (transform) {
        const mt = transform.match(/translate\(([\-0-9\.]+) ([\-0-9\.]+)\) rotate\(([\-0-9\.]+)\)/);
        if (mt) {
            const translateX = parseFloat(mt[1]);
            const translateY = parseFloat(mt[2]);
            const rotate = parseFloat(mt[3]);
            booth.rotate = (-rotate * Math.PI) / 180;
        } else {
            const mm = transform.match(/matrix\(\s*([\-0-9\.]+)\s*,\s*([\-0-9\.]+)\s*,\s*([\-0-9\.]+)\s*,\s*([\-0-9\.]+)\s*,\s*([\-0-9\.]+)\s*,\s*([\-0-9\.]+)\s*\)/);
            if (mm) {
                booth.rotate = Math.asin(-parseFloat(mm[2]));
            }
        }
    }

    booth.rect = Rect.fromSvgRectElement(r);
}

for (const b of Object.values(booths)) {
    if (!b.rect) {
        console.error("__data booth not found in SVG:", b.name, b);
        delete booths[b.id];
    }
}

export default {
    state: booths,
    getters: {
        boothsArray: (state: any) => Object.values(state)
    }
};
