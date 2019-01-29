import searchItems from './search-items';
export type SearchResultItem =
    | { type: "exhibitor"; obj: Exhibitor }
    | { type: "category"; obj: Category }
    | { type: "booth"; obj: Booth };


export function exhibitorsToItems(list: Exhibitor[]): SearchResultItem[] {
    return list.map(x => ({ type: "exhibitor", obj: x } as SearchResultItem));
}
export function categoriesToItems(list: Category[]): SearchResultItem[] {
    return list.map(x => ({ type: "category", obj: x } as SearchResultItem));
}
export function boothsToItems(list: Booth[]): SearchResultItem[] {
    return list.map(x => ({ type: "booth", obj: x } as SearchResultItem));
}

export default {
    getters: {
        dimmed(state, getters, rootState) {
            return getters.listExhibitors.length !== getters.exhibitorsArray.length;
        },
        searchedExhibitors(state, getters, rootState) {
            if (rootState.list.type !== "search") return [];
            const exhibitorsArray = getters.exhibitorsArray;
            let text = rootState.list.text.trim().toLowerCase();
            if (!text) return exhibitorsArray;
            return exhibitorsArray.filter(e => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        },
        categoryExhibitors(state, getters, rootState) {
            if (rootState.list.type !== "category") return [];
            return getters.exhibitorsByCategoryId.get(rootState.list.id) || [];
        },
        // TODO: remove this
        listExhibitors(state, getters, rootState) {
            switch (rootState.list.type) {
                case "search":
                    return getters.searchedExhibitors;
                case "bookmarks":
                    return getters.bookmarkedArray.map(id => rootState.exhibitors[id]);
                case "category":
                    return getters.categoryExhibitors;
            }
            throw new Error("Unknown list.type");
        },
        searchItems,
        listItems(state, getters, rootState) {
            switch (rootState.list.type) {
                case "search":
                    return getters.searchItems;
                case "bookmarks":
                    return exhibitorsToItems(getters.bookmarkedArray.map(id => rootState.exhibitors[id]));
                case "category":
                    return exhibitorsToItems(getters.categoryExhibitors);
            }
            throw new Error("Unknown list.type");
        },
        listExhibitorsIds(state, getters) {
            // TODO: replace this with listItems?
            return getters.listExhibitors.map(e => e.id);
        },

        listBoothsIds(state, getters) {
            const arr = [] as number[];
            for (let e of getters.listExhibitors) {
                arr.push(...e.booths);
            }
            return arr;
        },
        listBoothsIdsSet(state, getters, rootState) {
            return new Set(getters.listBoothsIds);
        },
        selectedBoothIds(state, getters, rootState) {
            if (getters.selectedExhibitor) return getters.selectedExhibitor.booths;
            if (getters.selectedBooth) return [getters.selectedBooth.id];
            return [];
        },
        selectedBoothIdsSet(state, getters, rootState) {
            return new Set(getters.selectedBoothIds);
        },
        hoveredBoothIds(state, getters, rootState) {
            if (rootState.hoveredBooth) return [rootState.hoveredBooth];
            if (rootState.hoveredExhibitor) return rootState.exhibitors[rootState.hoveredExhibitor].booths;
            return [];
        },
        // boothNameMap(state, getters) {
        //     const boothKeyArray = getters.boothsArray.map(b => [b.name.toLowerCase(), b]);
        //     return new Map(boothKeyArray);
        // },
        exhibitorsByCategoryId(state, getters) {
            const array = getters.categoriesArray.map(c => [
                c.id,
                getters.exhibitorsArray.filter(e => e.categories.indexOf(c.id) !== -1)
            ]);
            return new Map(array);
        }
    }
};
