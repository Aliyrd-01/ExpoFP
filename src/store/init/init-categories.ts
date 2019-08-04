import CategoryStore, { Category } from '../CategoryStore';
import RootStore from '../RootStore';
import { generateUniqueSlug } from '../../tools/slug';
import data from '../../data';
import logger from '../../tools/logger';


export default function initCategories(store: RootStore) {
    const { categoryStore } = store;

    data.categories.sort(function (a: RawCategory, b: RawCategory) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    for (const b of data.categories || []) {
        const c = new Category() as MutableRequired<Category>;
        Object.assign(c, b);

        c.slug = generateUniqueSlug(c.name);
        (c['store'] as CategoryStore) = categoryStore;
        categoryStore.categories.push(c as Category);
    }

    // (categoryStore.categoryById as Map<number, Category>) = new Map<number, Category>(categoryStore.categories.map(c => [c.id, c]));

    // dispose
    delete data.categories;
    logger.log('initCategories', categoryStore.categories.length);
}