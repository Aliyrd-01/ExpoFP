import data from "../../data";
import logger from "../../tools/logger";
import { generateUniqueSlug } from "../../tools/slug";
import { sortByName } from "../../utils";
import CategoryStore, { Category } from "../CategoryStore";
import RootStore from "../RootStore";

export default function initCategories(store: RootStore) {
    const { categoryStore, exhibitorStore } = store;

    sortByName(data.categories);

    for (const b of data.categories || []) {
        const c = new Category() as MutableRequired<Category>;
        Object.assign(c, b);
        c.exhibitors = [];
        c.slug = generateUniqueSlug(c.name);
        for (const e of data.exhibitors || []) {
            if (e.categories.filter((ec) => ec === b.id)[0]) {
                const ex = exhibitorStore.exhibitorById.get(e.id);
                ex.categories.push(c as Category);
                c.exhibitors.push(ex);
            }
        }
        (c["store"] as CategoryStore) = categoryStore;
        categoryStore.categories.push(c as Category);
    }

    // (categoryStore.categoryById as Map<number, Category>) = new Map<number, Category>(categoryStore.categories.map(c => [c.id, c]));

    // dispose
    delete data.categories;
    delete data.exhibitors;
    logger.log("initCategories", categoryStore.categories.length);
}
