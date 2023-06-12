import * as THREE from "three";

export default class Scene extends THREE.Scene {

    public userLayers: Map<string, number> = new Map();
    public camera: THREE.PerspectiveCamera;
    public raycaster: THREE.Raycaster;

    constructor() {
        super();        
    }
}
