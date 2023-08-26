import * as THREE from "three";
import { Intersection, Object3D } from "three";

export default class Scene extends THREE.Scene {
    public camera: THREE.PerspectiveCamera;
    public raycaster: THREE.Raycaster;

    private objLayers: Map<string, number> = new Map();
    private layerCounter = 1;

    public onClickCallbacks: ((intersections: Array<Intersection<Object3D>>) => void)[] = [];

    constructor() {
        super();
    }

    public addLayer(layerName: string) {
        if (!this.objLayers.has(layerName)) {
            this.objLayers.set(layerName, this.layerCounter);
            this.camera.layers.enable(this.layerCounter);
            this.layerCounter++;
        }

        return this.layerCounter - 1;
    }

    public getlayer(layerName: string) {
        return this.objLayers.get(layerName);
    }
}
