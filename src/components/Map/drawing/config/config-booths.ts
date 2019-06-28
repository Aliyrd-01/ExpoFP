import configBoothBg from './config-booth-bg';
import configBoothLabels from './config-booth-labels';
import configBoothLabelsSpecial from './config-booth-labels-special';
import configBoothBookmark from './config-booth-bookmark';
import configBoothBorder from './config-booth-border';
import { DrawerContext } from '../drawer';

export default function config(context: DrawerContext) {
    const booths = store.getters.boothsArray as Booth[];
    const configFuncs = [configBoothBg, configBoothLabels, configBoothLabelsSpecial, configBoothBookmark, configBoothBorder] as ((DrawerContext, Booth) => void)[];//configBoothType,

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
