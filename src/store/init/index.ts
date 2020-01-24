import RootStore from "../RootStore";
import initBooths from "./init-booths";
import initCategories from "./init-categories";
import initExhibitors from "./init-exhibitors";
import initUi from "./init-ui";
// import initApi from "./init-api";

export default function initStore(store: RootStore) {
    initCategories(store);
    initExhibitors(store);
    initBooths(store);
    initUi(store);
}
