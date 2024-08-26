import RootStore from "../RootStore";
import { iniAllBooths } from "./init-booths";
import initCategories from "./init-categories";
import initExhibitors from "./init-exhibitors";
import initLayers from "./init-layers";
import { iniSchedule } from "./init-schedule";
import initUi from "./init-ui";
import { initHeatmap } from "./init-heatmap";
import initLanguage from "./init-language";

export default function initStore(store: RootStore) {
    initLayers(store);
    iniSchedule(store);
    initExhibitors(store);
    initCategories(store);
    iniAllBooths(store);
    initHeatmap(store);
    initUi(store);
    initLanguage(store);
}
