import boothsState from "./booths";
import { generateUniqueSlug } from "@/services/slug";
import previewExhibitor from "@/utils/preview-exhibitor";
import baseUrl from "@/tools/base-data-url";

if (previewExhibitor) {
    const i = __data.exhibitors.findIndex(e => e.id === previewExhibitor.id);
    if (i !== -1) __data.exhibitors.splice(i, 1, previewExhibitor);
    else __data.exhibitors.push(previewExhibitor);
}

const exhibitors = __data.exhibitors.reduce((a: any, c: Exhibitor) => (c.booths = []) && (a[c.id] = c) && a, {} as any) as {
    [id: number]: Exhibitor;
};
// setup slugs
for (const b of Object.values(exhibitors)) {
    b.slug = generateUniqueSlug(b.name);
    if (b.logo) b.logo = baseUrl + b.logo;
    if (!b.categories) b.categories = [];
}

for (const booth of Object.values(boothsState.state)) {
    if (booth.special === false) {
        for (const exhibitorId of booth.exhibitors) {
            exhibitors[exhibitorId].booths.push(booth.id);
        }
    }
}

export default {
    state: exhibitors,
    getters: {
        exhibitorsArray: (state: any) =>
            Object.values(state).sort(function (a: Exhibitor, b: Exhibitor) {
                var x = (a.featured ? "0" : "1") + a.name.toLowerCase();
                var y = (b.featured ? "0" : "1") + b.name.toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
            }),
        advertisedExhibitors: (state: any, getters: any) => getters.exhibitorsArray.filter(e => e.advertise && e.logo)
    }
};
