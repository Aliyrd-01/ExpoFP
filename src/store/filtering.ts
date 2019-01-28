type SearchResultItem =
    | { type: "exhibitor"; obj: Exhibitor }
    | { type: "category"; obj: Category }
    | { type: "booth"; obj: Booth };

// interface SearchResult {
//     items: SearchResultItem[];
// }

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
        listItems(state, getters, rootState) {
            // see the current list type
            // popuplate objects from it to show
            let items: SearchResultItem[] = [];
            items.push({ type: "category", obj: getters.categoriesArray[0] });
            items.push(...getters.listExhibitors.map(x => ({ type: "exhibitor", obj: x } as SearchResultItem)));

            return items;
        },
        // this should go away
        // filteredExhibitors(state, getters, rootState) {
        //     return [];
        //     // const exhibitorsArray = getters.exhibitorsArray;
        //     // let text = rootState.searchText.trim().toLowerCase();
        //     // if (!text) return exhibitorsArray;
        //     // if (getters.boothNameMap.has(text)) {
        //     //     const b = getters.boothNameMap.get(text);
        //     //     return b.exhibitors.map(id => rootState.exhibitors[id]);
        //     // }
        //     // if (text === "my bookmarks") {
        //     //     return getters.bookmarkedArray.map(id => rootState.exhibitors[id]);
        //     // }
        //     // if (getters.exhibitorsByCategoryNameMap.has(text)) {
        //     //     return getters.exhibitorsByCategoryNameMap.get(text);
        //     // }
        //     // return exhibitorsArray.filter(e => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        // },
        listExhibitorsIds(state, getters) {
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
        // highlightedBoothIds(state, getters, rootState) {
        //     // if (getters.selectedExhibitor) return getters.selectedExhibitor.booths;
        //     // if (getters.selectedBooth) return [getters.selectedBooth.id];
        //     // if (rootState.searchText.trim()) return getters.filteredBoothsIds;
        //     return null;
        // },
        // highlightedBoothIdsObj(state, getters, rootState) {
        //     return {};
        //     // return getters.highlightedBoothIds ?
        //     //     getters.highlightedBoothIds.reduce((c: number, id) => (c[id] = true) && c, {} as { [id: number]: boolean })
        //     //     : {};
        // },
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
