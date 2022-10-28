import { easeLinear } from "d3-ease";
import { interpolateNumber } from "d3-interpolate";
import store from "../../../../store";
import { Booth } from "../../../../store/BoothStore";
import settings from "../../../../tools/settings";
import isDebug from "../../../../utils/is-debug";
import { DrawerContext } from "../Drawer1";
import RectPainter from "../painters/RectPainter";
import animate from "./animate";
import configBoothBg from "./config-booth-bg";
import configBoothBookmark from "./config-booth-bookmark";
import configBoothBorder from "./config-booth-border";
import configBoothLabels from "./config-booth-labels";
import configBoothLabelsSpecial from "./config-booth-labels-special";
import configScaledBoot from "./config-booth-scaled";

export default function configBooths(
    context: DrawerContext,
    layerID: string,
    booths: Booth[],
    painterOrderPriority: number,
    visible: boolean
) {
    var _layerID = layerID + ":";

    const configFuncs = [configBoothBg, configBoothLabels, configBoothLabelsSpecial, configBoothBookmark] as ((
        DrawerContext,
        string,
        Booth,
        number,
        boolean
    ) => void | { unlock: () => void })[]; //configBoothType,
    if (!settings.borderless) configFuncs.push(configBoothBorder);

    // const after = [];
    const lockedDrawers: { unlock: () => void }[] = [];
    for (const func of configFuncs) {
        //const drawer =
        const name = "config-func " + func.name;
        if (isDebug) console.time(name);
        for (const b of booths) {
            if (b === store.routeStore.defaultFrom) continue;

            const dr = func(context, _layerID, b, painterOrderPriority, visible);
            if (dr) lockedDrawers.push(dr);
        }
        painterOrderPriority++;
        if (isDebug) console.timeEnd(name);
        // if (drawer) ar.push(drawer);
    }

    const labelsPainter = context.requirePainter(
        _layerID + "booth-label",
        RectPainter,
        painterOrderPriority,
        visible
    ) as RectPainter;
    if (context.updatable && labelsPainter) {
        labelsPainter.alpha = 0;
    }

    const { defaultFrom } = store.routeStore;

    if (defaultFrom?.layer === null || defaultFrom?.layer?.name === layerID) {
        configScaledBoot(context, _layerID, defaultFrom, painterOrderPriority, visible);
    }

    return function () {
        for (const dr of lockedDrawers) {
            dr.unlock();
        }
        animate(0, 300, easeLinear, interpolateNumber(0, 1), context.requireUpdate.bind(context), (v) =>
            labelsPainter ? (labelsPainter.alpha = v) : null
        );
    };
}
