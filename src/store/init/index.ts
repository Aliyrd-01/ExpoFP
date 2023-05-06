import RootStore from "../RootStore";
import { iniAllBooths } from "./init-booths";
import initCategories from "./init-categories";
import initExhibitors from "./init-exhibitors";
import initLayers from "./init-layers";
import { iniSchedule } from "./init-schedule";
import initUi from "./init-ui";

export default function initStore(store: RootStore) {
    initLayers(store);
    iniSchedule(store);
    initExhibitors(store);
    initCategories(store);
    iniAllBooths(store);
    initUi(store);
}
