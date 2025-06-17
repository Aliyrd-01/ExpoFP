import RootStore from "../RootStore";
import { iniAllBooths } from "./init-booths";
import initCategories from "./init-categories";
import initExhibitors from "./init-exhibitors";
import { initHeatmap } from "./init-heatmap";
import initLanguage from "./init-language";
import initLayers from "./init-layers";
import { initPoiTypes } from "./init-poiTypes";
import InitEvents from "./init-events";
import initUi from "./init-ui";

export default function initStore(store: RootStore) {
    initLayers(store);
    InitEvents(store);
    initExhibitors(store);
    initCategories(store);
    initPoiTypes(store);
    iniAllBooths(store);
    initHeatmap(store);
    initUi(store);
    initLanguage(store);
}
