import boothsState from './booths';
import { generateUniqueSlug } from '@/services/slug';
import previewExhibitor from '@/utils/preview-exhibitor';

const baseUrl = Array.from(document.getElementsByTagName('script')).filter(x => x.src.endsWith('data.js'))[0].src.replace(/data.js$/, '');
if (previewExhibitor) {
    const i = __data.exhibitors.findIndex(e => e.id === previewExhibitor.id);
    __data.exhibitors.splice(i, 1, previewExhibitor);
}

const exhibitors = __data.exhibitors.reduce((a: any, c: Exhibitor) => (c.booths = []) && (a[c.id] = c) && a, {} as any) as { [id: number]: Exhibitor };
// setup slugs
for (const b of Object.values(exhibitors)) {
    b.slug = generateUniqueSlug(b.name);
    if (b.logo) b.logo = baseUrl + b.logo;
}

for (const booth of Object.values(boothsState.state)) {
    for (const exhibitorId of booth.exhibitors) {
        exhibitors[exhibitorId].booths.push(booth.id);
    }
}

export default {
    state: exhibitors,
    getters: {
        exhibitorsArray: (state: any) => Object.values(state).sort(function (a: Exhibitor, b: Exhibitor) {
            var x = (a.isFeatured ? '0' : '1') + a.name.toLowerCase();
            var y = (b.isFeatured ? '0' : '1') + b.name.toLowerCase();
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        })
    }
}