// import { requireUpdate } from "./draw";
import configBoothBg from './config-booth-bg';
// import configBoothBookmark from './config-booth-bookmark';
import configBoothLabels from './config-booth-labels';
// import configBoothLabelsSpecial from './config-booth-labels-special';
// import configBoothBorder from './config-booth-border';
// import BoothDrawerBase from "./BoothDrawerBase";
import { DrawerContext } from '../drawer';
// import { isWebGlSupported } from "./utils";
// const boothDrawers = new Map<number, BoothDrawerBase<any>[]>();
// const boothStateCache = new Map<number, BoothState>();

export default function config(context: DrawerContext) {
    const booths = store.getters.boothsArray as Booth[];
    // , , configBoothLabelsSpecial, configBoothBookmark, configBoothBorder
    const configFuncs = [configBoothBg, configBoothLabels] as ((DrawerContext, Booth) => void)[];//configBoothType,

    for (const func of configFuncs) {
        //const drawer = 
        const name = "config-func " + func.name;
        if (__settings.debug) console.time(name);
        for (const b of booths) {
            func(context, b);
        }
        if (__settings.debug) console.timeEnd(name);
        // if (drawer) ar.push(drawer);
    }
}
