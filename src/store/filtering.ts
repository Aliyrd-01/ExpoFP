
export default {
    getters: {
        filteredExhibitors(state, getters, rootState) {
            const exhibitorsArray = getters.exhibitorsArray;
            let text = rootState.searchText.trim().toLowerCase();
            if (!text) return exhibitorsArray;
            if (getters.boothNameMap.has(text)) {
                const b = getters.boothNameMap.get(text);
                return b.exhibitors.map(id => rootState.exhibitors[id]);
            }
            if (text === "my bookmarks"){
                return getters.bookmarkedArray.map(id => rootState.exhibitors[id]);
            }
            if (getters.exhibitorsByCategoryNameMap.has(text)) {
                return getters.exhibitorsByCategoryNameMap.get(text);
            }
            return exhibitorsArray.filter(e => e.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        },

        filteredBoothsIds(state, getters) {
            const arr = [] as number[];
            for (let e of getters.filteredExhibitors) {
                arr.push(...e.booths);
            }
            return arr;
        },
        highlightedBoothIds(state, getters, rootState) {
            // if (getters.selectedExhibitor) return getters.selectedExhibitor.booths;
            // if (getters.selectedBooth) return getters.selectedBooth.id;
            if (rootState.searchText.trim()) return getters.filteredBoothsIds;
            return null;
        },
        highlightedBoothIdsObj(state, getters, rootState) {
            return getters.highlightedBoothIds ? 
                getters.highlightedBoothIds.reduce((c: number, id) => (c[id] = true) && c, {} as { [id: number]: boolean })
                : {};
        },
        hoveredBooths(state, getters, rootState){
            if (rootState.hoveredBooth) return [rootState.hoveredBooth];
            if (rootState.hoveredExhibitor) return rootState.exhibitors[rootState.hoveredExhibitor].booths;
            return [];
        },
        boothNameMap(state, getters) {
            const boothKeyArray = getters.boothsArray.map(b => [b.name.toLowerCase(), b]);
            return new Map(boothKeyArray);
        },
        exhibitorsByCategoryNameMap(state, getters) {
            const array = getters.categoriesArray.map(c => [
                c.name.toLowerCase(),
                getters.exhibitorsArray.filter(e => e.categories.indexOf(c.id) !== -1)
            ]);
            return new Map(array);
        }
    }
}