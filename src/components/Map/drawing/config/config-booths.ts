import { easeLinear } from "d3-ease";
import { interpolateNumber } from "d3-interpolate";
import { boothStore } from "../../../../store";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import animate from "./animate";
import configBoothBg from "./config-booth-bg";
import configBoothBookmark from "./config-booth-bookmark";
import configBoothBorder from "./config-booth-border";
import configBoothLabels from "./config-booth-labels";
import configBoothLabelsSpecial from "./config-booth-labels-special";

export default function configBooths(context: DrawerContext) {
    const booths = boothStore.booths;//.filter(x => x.name === '4268');
    // booths.splice(2740);
    const configFuncs = [configBoothBg, configBoothLabels, configBoothLabelsSpecial, configBoothBookmark, configBoothBorder] as ((
        DrawerContext,
        Booth
    ) => void | { unlock: () => void })[]; //configBoothType,

    // const after = [];
    const lockedDrawers: { unlock: () => void }[] = [];
    for (const func of configFuncs) {
        //const drawer =
        const name = "config-func " + func.name;
        if (settings.debug) console.time(name);
        for (const b of booths) {
            // const afterFunc =
            const dr = func(context, b);
            if (dr) lockedDrawers.push(dr);
            // if (afterFunc) after.push(afterFunc);
        }
        if (settings.debug) console.timeEnd(name);
        // if (drawer) ar.push(drawer);
    }

    const labelsPainter = context.requirePainter("booth-label") as RectPainter;
    if (context.updatable) {
        labelsPainter.alpha = 0;
    }

    return function() {
        for (const dr of lockedDrawers) {
            dr.unlock();
        }
        animate(0, 300, easeLinear, interpolateNumber(0, 1), context.requireUpdate.bind(context), v => (labelsPainter.alpha = v));
    };
    // if (after.length) return function () { for (const f of after) { f(); } }
}
