
import { generateUniqueSlug } from '@/services/slug';

const categories = __data.categories.reduce((a: any, c: Category) => (a[c.id] = c) && a, {} as any) as { [id: number]: Category };
// setup slugs
for (const b of Object.values(categories)) {
    b.slug = generateUniqueSlug(b.name);
}


export default {
    state: categories,
    getters: {
        categoriesArray: (state: any) => Object.values(state).sort(function (a: Category, b: Category) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }),
        seminarsCategoryId: (state: any, getters:any) => {
            const cat = getters.categoriesArray.find(c => c.slug === 'seminars');
            return cat ? cat.id : 0;
        }
    }
}