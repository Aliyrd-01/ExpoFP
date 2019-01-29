import { SearchResultItem, exhibitorsToItems, categoriesToItems, boothsToItems } from "./filtering";

export default function searchItems(state, getters, rootState) {
    if (rootState.list.type !== "search") return [];

    const exhibitorsArray = getters.exhibitorsArray as Exhibitor[];
    const categoriesArray = getters.categoriesArray as Category[];
    const boothsArray = getters.boothsArray as Booth[];
    let text = rootState.list.text.trim().toLowerCase() as string;
    let words = text.split(/\s+/).filter(x => x);
    if (!text) return exhibitorsToItems(exhibitorsArray);

    let items: SearchResultItem[] = [];

    // rulles here
    const matchingExhibitors = exhibitorsArray.filter(
        e =>
            e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1 ||
            e.booths.find(id => rootState.booths[id].name.toLowerCase() === text)
    );
    const matchingCategories = categoriesArray.filter(e => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    const matchingBooths = boothsArray.filter(
        e =>
            !matchingExhibitors.find(x => x.booths.indexOf(e.id) !== -1) &&
            e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
    );

    items.push(...exhibitorsToItems(matchingExhibitors));
    items.push(...categoriesToItems(matchingCategories));
    items.push(...boothsToItems(matchingBooths));

    return items;
}

// function exhibitorsToItems(list: Exhibitor[]): SearchResultItem[] {
//     return list.map(x => ({ type: "exhibitor", obj: x } as SearchResultItem));
// }
