import { RequireDrawerFunc, RequireUpdateFunc } from "./draw";
import Drawer from "./Drawer";


// let requireDrawer: RequireDrawerFunc;
// let requireUpdate: RequireUpdateFunc;

export default function configBooths(requireDrawer: RequireDrawerFunc, requireUpdate: RequireUpdateFunc) {
    // requireDrawer = requireDrawerFunc;
    // requireUpdate = requireUpdateFunc;

    const booths = store.getters.boothsArray as Booth[];
    booths.forEach(b => new BoothDrawer(b, requireDrawer, requireUpdate));
};


class BoothDrawer {
    private requireDrawer: RequireDrawerFunc;
    private requireUpdate: RequireUpdateFunc;
    private booth: Booth;

    constructor(booth: Booth, requireDrawer: RequireDrawerFunc, requireUpdate: RequireUpdateFunc) {
        this.requireDrawer = requireDrawer;
        this.requireUpdate = requireUpdate;
        this.booth = booth;

        // add drawer objects per this booth
        // bg, borders, -> need subdrawers
    }


}

// export default config;

// export default function getBoothsDrawerConfigurers(
//     requireDrawer: (type: string, order: number) => Drawer,
//     requireUpdate: (configurer: DrawerConfigurer) => void): DrawerConfigurer[] {

//     return [];
// }

//const configure: = function()

// class BoothUpdatable implements Updatable {
//     constructor() {

//     }
// }


// export default const e: ConfigureDrawerFunc = (r, u) => {
//     return [];
// }


