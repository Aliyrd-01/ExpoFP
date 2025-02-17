import data from "../../data";
import RootStore from "../RootStore";

export function initPoiTypes(store: RootStore) {
    (data.poiTypes ?? []).forEach((poiType) => {
        store.poiTypeStore.poiTypes.push(poiType);
    });
}
