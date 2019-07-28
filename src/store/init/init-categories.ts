import CategoryStore, { Category } from '../CategoryStore';
import RootStore from '../RootStore';
import { generateUniqueSlug } from '../../tools/slug';
import data from '../../data';
import logger from '../../tools/logger';


export default function initCategories(store: RootStore) {
    for (const b of data.categories || []) {
        const c = new Category() as MutableRequired<Category>;
        Object.assign(c, b);

        c.slug = generateUniqueSlug(c.name);
        (c['store'] as CategoryStore) = store.categoryStore;
        store.categoryStore.categories.push(c as Category);
    }
    // dispose
    delete data.categories;
    logger.log('initCategories', store.categoryStore.categories.length);
}