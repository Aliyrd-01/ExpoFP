import { DrawerContext } from "../Drawer";
import configMatrix from './config-matrix';
import configBg from "./config-bg";
import configBooths from "./config-booths";

export default function configAll(context: DrawerContext) {
    // config booths
    const matrixAfter = configMatrix(context);
    configBg(context);
    configBooths(context);

    return function () {
        // to be running when all painters prepared
        matrixAfter();
    };
}