import RootStore from "../RootStore";
import initBooths from "./init-booths";
import initCategories from "./init-categories";
import initExhibitors from "./init-exhibitors";
import initLayers from "./init-layers";
import initUi from "./init-ui";

export default function initStore(store: RootStore) {
    initLayers(store);
    initExhibitors(store);
    initCategories(store);
    initBooths(store);
    initUi(store);
}
