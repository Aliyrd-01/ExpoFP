import dataLoader, { ICommonData } from "./common/dataLoader";
import Scene from "./common/Scene";
import init from "./index";
import { init as initMapbox } from "./index_mapbox";

export default class UIManager {
    expo: string;
    isMapbox: boolean;
    scene: Scene;
    data: ICommonData;
    container: HTMLElement;

    constructor(expo: string, isMapbox: boolean, container: HTMLElement) {
        this.expo = expo;
        this.isMapbox = isMapbox;
        this.container = container;
    }

    public async init() {
        this.data = await dataLoader(this.expo);
        (this.isMapbox ? initMapbox(this.container, this.data, this.expo) : init(this.container, this.data, this.expo)).then(
            (scene) => (this.scene = scene)
        );
    }

    public changeLayerVisibility(layer: string | number, isVisible: boolean): void {
        const l = typeof layer === "string" ? this.scene.userLayers.get(layer) : layer;

        if (isVisible) {
            this.scene.camera.layers.enable(l);
            this.scene.raycaster.layers.enable(l);
        } else {
            this.scene.camera.layers.disable(l);
            this.scene.raycaster.layers.disable(l);
        }
    }
}
