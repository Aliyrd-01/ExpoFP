// import __efpDebug from "../../../utils/is-debug";
import DrawerImpl from "../DrawerImpl";
// import animate from "./animate";
import configBoothBg from "./config-booth-bg";
import configBoothBookmark from "./config-booth-bookmark";
import configBoothBorder from "./config-booth-border";
import configBoothLabels from "./config-booth-labels";
import configBoothLabelsSpecial from "./config-booth-labels-special";
import logger from "../../../tools/logger";

export default function configBooths(context: DrawerImpl) {
    const booths = context.config.booths; //.filter(x => x.name === '4268');

    const configFuncs = [
        configBoothBg, 
        // configBoothLabels, 
        // configBoothLabelsSpecial, 
        // configBoothBookmark
    ] as ((
        DrawerContext,
        Booth
    ) => () => void)[]; //configBoothType,

    if (context.config.borderWidth > 0) configFuncs.push(configBoothBorder);

    // const after = [];
    // const lockedDrawers: { unlock: () => void }[] = [];
    const disposers: (() => void)[] = [];
    for (const func of configFuncs) {
        //const drawer =
        const name = "config-func " + func.name;
        if (__efpDebug) console.time(name);
        for (const b of booths) {
            // const afterFunc =
            //const dr =
            const disposer = func(context, b);
            if (!disposer) logger.warn("Null disposer:", name);
            disposers.push(disposer);
            // if (dr) lockedDrawers.push(dr);
            // if (afterFunc) after.push(afterFunc);
        }
        if (__efpDebug) console.timeEnd(name);
        // if (drawer) ar.push(drawer);
    }

    return () => {
        disposers.forEach(d => d());
    };

    // for (const dr of lockedDrawers) {
    //     dr.unlock();
    // }

    // const labelsPainter = context.requirePainter("booth-label") as RectPainter;
    // if (context.updatable && labelsPainter) {
    //     labelsPainter.alpha = 0;
    // }

    // return function() {
    //     for (const dr of lockedDrawers) {
    //         dr.unlock();
    //     }
    //     animate(0, 300, easeLinear, interpolateNumber(0, 1), context.requireUpdate.bind(context), v =>
    //         labelsPainter ? (labelsPainter.alpha = v) : null
    //     );
    // };
    //// if (after.length) return function () { for (const f of after) { f(); } }
}
