import { DrawerContext } from "../Drawer";
import configMatrix from './config-matrix';
import configDim from './config-dim';
import configBg from "./config-bg";
import configBooths from "./config-booths";

export default function configAll(context: DrawerContext) {
    // config booths
    const matrixAfter = configMatrix(context);
    configDim(context);
    configBg(context);
    configBooths(context);

    return function () {
        // to be running when all painters prepared
        matrixAfter();
    };
}