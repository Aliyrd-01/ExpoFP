import * as THREE from "three";
import { Group, WebGLRenderer } from "three";
import { Booth, RegularBooth } from "./../../store/BoothStore";
import { RouteLine } from "./../../utils/wayfinding";
import { BoothMesh } from "./common/BoothMesh";

import RouteStore, { CurrentPosition } from "../../store/RouteStore";
import dataLoader, { ICommonData } from "./common/dataLoader";

import loadModel from "./common/modelLoader";
import Scene from "./common/Scene";
import init from "./index";
import { init as initMapbox } from "./index_mapbox";

import store, { boothStore } from "../../store";

import { splitPolyLine } from "../Map/drawing/config/config-wf";
import logosFromBooths from "../../utils/imageloader";
import TextureMerger from "./utils/textureMerger";
import initBooths from "./common/initBooths";

const selecterMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });
const dimmedMaterial = new THREE.MeshPhongMaterial({ color: 0x777777, side: THREE.DoubleSide });
const selected: THREE.Mesh[] = [];

const routeMeshes: THREE.Mesh[] = [];
const booths: BoothMesh[] = [];

const pointSize = 0.05;

let currentPositionMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2 * pointSize, 2 * pointSize, 10 * pointSize),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
);

export default class UIManager {
    expo: string;
    isMapbox: boolean;
    scene: Scene;
    data: ICommonData;
    container: HTMLElement;
    isInit: boolean = false;

    constructor(expo: string, isMapbox: boolean, container: HTMLElement) {
        this.expo = expo;
        this.isMapbox = isMapbox;
        this.container = container;
    }

    public async init(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let model = await loadModel(`models/${this.expo}/model.obj`, `models/${this.expo}/model.mtl`);

            this.data = await dataLoader(this.expo);

            (this.isMapbox ? initMapbox(this.container, this.data) : init(this.container, this.data)).then((scene) => {
                this.isInit = true;
                this.scene = scene;
                scene.onClickCallbacks.push(this.onClickCallback.bind(this));
                scene.onBeforeRender = this.onBeforeRender.bind(this);
                this.initBooths(scene, model);
                scene.add(currentPositionMesh);

                resolve();
            });
        });
    }

    public changeLayerVisibility(layer: string | number, isVisible: boolean): void {
        if (!this.isInit) return;

        const l = typeof layer === "string" ? this.scene.objLayers.get(layer) : layer;

        if (isVisible) {
            this.scene.camera.layers.enable(l);
            this.scene.raycaster.layers.enable(l);
        } else {
            this.scene.camera.layers.disable(l);
            this.scene.raycaster.layers.disable(l);
        }
    }

    public hoverBooths(hoveredBooths: Booth[]) {}

    public selectBooths(booths: string[]): void {}

    public setMarker(type: "from" | "to" | "yah" | "cp", point: CurrentPosition) {
        const localPoint = this.convertPoint(point);
        currentPositionMesh.position.set(localPoint.x, localPoint.y, localPoint.z);
    }

    public updateRouteLines(routeStore: RouteStore): void {
        var routeLines = routeStore.routeLines.filter((line) => {
            let visible = store.layerStore.layers.find((l) => l.name === line.p0.layer)?.visible ?? true;
            return !line.virtual && visible;
        });

        routeMeshes.forEach((g) => this.scene.remove(g));
        routeMeshes.splice(0, routeMeshes.length);

        const points = this.linesToPoints(routeLines);

        const { z } = this.data.objLayers.find((l) => l.name === routeLines[0].p0.layer);

        points.forEach((point) => {
            const geometry = new THREE.BoxGeometry(pointSize, pointSize, pointSize);
            const material = new THREE.MeshPhongMaterial({ color: 0xffa500 });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(point.x, point.y, z);
            routeMeshes.push(cube);
            this.scene.add(cube);
        });

        console.info("updateRouteLines", points);
    }

    public onBeforeRender(
        renderer: WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        geometry: THREE.BufferGeometry,
        material: THREE.Material,
        group: Group
    ): void {
        let position: THREE.Vector3 = camera.userData.position || camera.position;
    }

    private onClickCallback(intersections: Array<any>): void {
        const intersection = intersections[0];

        console.info(intersections.filter((i) => i.object.name.startsWith("b")));

        // let name = intersection?.object?.name?.substring(1);

        // selected.forEach((mesh) => (mesh.material = materals[mesh.name]));

        // if (name && boothStore.booths.find((b) => name === b.name)) {
        //     const mesh = intersection.object as THREE.Mesh;
        //     selected = [mesh];
        //     mesh.material = selecterMaterial;

        //     boothStore.booths.forEach((booth) => {
        //         var mesh = model.getObjectByName(booth.name) as THREE.Mesh;
        //         if (mesh && mesh.name !== name) mesh.material = dimmedMaterial;
        //     });
        // } else {
        //     boothStore.booths.forEach((booth) => {
        //         var mesh = model.getObjectByName(booth.name) as THREE.Mesh;
        //         if (mesh) mesh.material = materals[booth.id];
        //     });
        // }
    }

    private async initBooths(scene: Scene, model: Group): Promise<void> {
        const logos = (await logosFromBooths(boothStore.booths as any)).filter((l) => !!l);

        var textureObj = new Map<string, THREE.Texture>();
        logos.forEach((logo) => textureObj.set(logo.name, new THREE.Texture(logo.htmlImage)));

        var textureMerger = new TextureMerger(textureObj);

        var material = new THREE.MeshBasicMaterial();
        material.side = THREE.DoubleSide;
        material.transparent = true;

        let layerCounter = 1;

        model.children.forEach((mesh, idex) => {
            var [layer, name] = mesh.name.split(/ (.*)/s);

            if (!scene.objLayers.has(layer)) scene.objLayers.set(layer, layerCounter++);
            let l = scene.objLayers.get(layer);

            const booth = store.boothStore.booths.find((b) => name[0] === "b" && b.name === name.substring(1));

            if (booth) {
                let objLayer = this.data.objLayers.find((l) => l.name === booth.layer?.name);
                let z = objLayer.z + objLayer.height + (objLayer.z + objLayer.height) * 0.001;

                const boothMesh = new BoothMesh(
                    booth,
                    this.data.booths.find((b) => b.name === booth.name),
                    mesh,
                    name,
                    l,
                    z,
                    this.scene
                );

                boothMesh.setText();

                var exhibitor = (booth as RegularBooth)?.exhibitors?.find((e) => !!e.logo && e.logoInBooth);
                //if (exhibitor) boothMesh.setLogo(textureMerger, material);

                model.children[idex] = boothMesh;
                booths.push(boothMesh);
            }

            mesh.layers.set(l);
            scene.camera.layers.enable(l);
        });

        //await initBooths(scene, this.data);

        scene.add(model);
    }

    private convertPoint(point: CurrentPosition): THREE.Vector3 {
        var m = this.data.matrix;

        let { x, y } = point;

        let z = 0;
        if (point.z) {
            let layer = this.data.objLayers.find((l) => l.name === point.z);
            if (layer) z = 1.5 * layer.z;
        }

        x += m[0];
        y += m[1];

        x *= m[2];
        y *= m[3];

        x += m[4];
        y += m[5];

        return new THREE.Vector3(x, y, z);
    }

    private linesToPoints(routeLines: RouteLine[]): THREE.Vector3[] {
        let routePoints = [];

        let interval = Math.round(pointSize * 1000);

        let lines = [];
        for (let i = 0; i < routeLines.length; i++) {
            let line = routeLines[i];

            let visible = store.layerStore.layers.find((l) => l.name === line.p0.layer)?.visible ?? true;

            if (!line.virtual && visible) lines.push(line);

            if ((line.virtual || !visible || i === routeLines.length - 1) && lines.length) {
                const points = routePoints.push(...splitPolyLine(lines, interval));
                lines = [];
            }
        }

        return routePoints.map((p) => this.convertPoint(p));
    }
}
