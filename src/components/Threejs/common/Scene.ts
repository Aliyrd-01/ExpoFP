import * as THREE from "three";
import { Intersection, Object3D } from "three";

export default class Scene extends THREE.Scene {
    public objLayers: Map<string, number> = new Map();
    public camera: THREE.PerspectiveCamera;
    public raycaster: THREE.Raycaster;

    public onClickCallbacks: ((intersections: Array<Intersection<Object3D>>) => void)[] = [];

    constructor() {
        super();
    }
}
