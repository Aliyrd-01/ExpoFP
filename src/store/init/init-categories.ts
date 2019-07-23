import { generateUniqueSlug } from '@/services/slug';
import CategoryStore, { Category } from '../CategoryStore';
import RootStore from '../RootStore';


export default function initCategories(store: RootStore) {
    for (const b of __data.categories || []) {
        const c = new Category();
        Object.assign(c, b);

        (c.slug as string) = generateUniqueSlug(c.name);
        (c['store'] as CategoryStore) = store.categoryStore;
        store.categoryStore.categories.push(c);
    }
    // dispose
    delete __data.categories;
    __logger.log('init store.categoryStore', store.categoryStore.categories.length);
}