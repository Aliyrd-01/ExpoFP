import RootStore from '../RootStore';
import logger from '../../tools/logger';
import data from '../../data';
import ExhibitorStore, { Exhibitor } from '../ExhibitorStore';
import { generateUniqueSlug } from '../../tools/slug';
import baseUrl from "../../tools/base-data-url";

export default function initExhibitors(store: RootStore) {

    data.exhibitors.sort(function (a: RawExhibitor, b: RawExhibitor) {
        var x = (a.featured ? "0" : "1") + a.name.toLowerCase();
        var y = (b.featured ? "0" : "1") + b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    const { exhibitorStore } = store;

    for (const raw of data.exhibitors || []) {
        const e = new Exhibitor() as MutableRequired<Exhibitor>;
        Object.assign(e, raw);

        e.slug = generateUniqueSlug(e.name);

        if (e.logo) e.logo = baseUrl + e.logo;
        e.categories = [];
        e.booths = [];
        for (const c of raw.categories || []) {
            e.categories.push(store.categoryStore.categoryById.get(c));
        }

        (e['store'] as ExhibitorStore) = exhibitorStore;
        exhibitorStore.exhibitors.push(e as Exhibitor);
    }

    // dispose
    delete data.exhibitors;
    logger.log('initExhibitors', exhibitorStore.exhibitors.length);
}

