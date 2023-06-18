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

import store, { boothStore, uiState } from "../../store";

import { splitPolyLine } from "../Map/drawing/config/config-wf";
import logosFromBooths from "../../utils/imageloader";
import TextureMerger from "./utils/textureMerger";
import { getLayerSvg } from "../../data/svg";
import isDebug from "../../utils/is-debug";

const routeMeshes: THREE.Mesh[] = [];
const defaultMaterial = new THREE.MeshPhongMaterial({ color: 0x30afeb });
const currentMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

let routeIndex = 0;

const booths: BoothMesh[] = [];

let pointSize = 0.04;

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

        setInterval(() => {
            if (!routeMeshes.length) {
                routeIndex = 0;
                return;
            }

            routeMeshes[routeIndex].material = currentMaterial;
            if (routeIndex > 0) routeMeshes[routeIndex - 1].material = defaultMaterial;

            if (routeIndex < routeMeshes.length - 1) routeIndex++;
            else {
                routeMeshes[routeIndex - 1].material = defaultMaterial;
                routeIndex = 0;
            }
        }, 50);
    }

    public async init(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this.data = await dataLoader(this.expo);

            const baseUrl = isDebug ? `models/${this.expo}/` : `https://${this.expo}.expofp.com/data/models`;

            const scene = await (this.isMapbox ? initMapbox(this.container, this.data) : init(this.container, this.data));
            const model = await loadModel(`${baseUrl}/model.obj`, `${baseUrl}/model.mtl`);

            this.isInit = true;
            this.scene = scene;
            scene.onClickCallbacks.push(this.onClickCallback.bind(this));
            scene.onBeforeRender = this.onBeforeRender.bind(this);
            await this.initBooths(scene, model);
            //scene.add(currentPositionMesh);

            resolve();
        });
    }

    public changeLayerVisibility(layer: string, isVisible: boolean): void {
        if (!this.isInit) return;
        const l = this.scene.getlayer(layer);

        if (isVisible) {
            this.scene.camera.layers.enable(l);
            this.scene.raycaster.layers.enable(l);
        } else {
            this.scene.camera.layers.disable(l);
            this.scene.raycaster.layers.disable(l);
        }
    }

    public hoverBooths(hoveredBooths: Booth[]) {
        booths.forEach((b) => b.hovered(hoveredBooths.length && !!hoveredBooths.find((hb) => hb.name === b.name)));
    }

    public selectBooths(selectedBooths: Booth[]): void {
        booths.forEach((b) => b.dimmed(selectedBooths.length && !selectedBooths.find((hb) => hb.name === b.name)));
    }

    public setMarker(type: "from" | "to" | "yah" | "cp", point: CurrentPosition) {
        const localPoint = this.convertPoint(point);
        // currentPositionMesh.position.set(localPoint.x, localPoint.y, localPoint.z);
    }

    public interpolateColors(color1: string, color2: string, steps: number): string[] {
        var stepFactor = 1 / (steps - 1),
            interpolatedColorArray = [];

        var c1 = new THREE.Color(color1);
        var c2 = new THREE.Color(color2);

        for (var i = 0; i < steps; i++) {
            interpolatedColorArray.push(
                c1
                    .clone()
                    .lerp(c2, stepFactor * i)
                    .getHex()
            );
        }

        return interpolatedColorArray;
    }

    public updateRouteLines(routeStore: RouteStore): void {
        var routeLines = routeStore.routeLines.filter((line) => {
            let visible = store.layerStore.layers.find((l) => l.name === line.p0.layer)?.visible ?? true;
            return !line.virtual && visible;
        });

        routeMeshes.forEach((g) => this.scene.remove(g));
        routeMeshes.splice(0, routeMeshes.length);

        if (!routeLines.length) return;

        const points = this.linesToPoints(routeLines);

        const { z } = this.data.objLayers.find((l) => l.name === routeLines[0].p0.layer);

        //const colors = this.interpolateColors("#F28500", "#32CD32", points.length);

        []
            .concat(points)
            .reverse()
            .forEach((point, index) => {
                const geometry = new THREE.SphereGeometry(pointSize);
                const cube = new THREE.Mesh(geometry, defaultMaterial);
                cube.position.set(point.x, point.y, z + 0.02);
                routeMeshes.push(cube);
                this.scene.add(cube);
            });
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

        // if (!routeMeshes.length) {
        //     routeIndex = 0;
        //     return;
        // }

        // routeMeshes[routeIndex].material = currentMaterial;

        // if (routeIndex > 0) routeMeshes[routeIndex - 1].material = defaultMaterial;

        // if (routeIndex < routeMeshes.length - 1) routeIndex++;
        // else routeIndex = 0;
    }

    private onClickCallback(intersections: Array<any>): void {
        const intersection = intersections[0];
        let name = intersection?.object?.name;
        let booth = boothStore.booths.find((b) => b.name === name);
        if (booth) store.selectBooth(booth);
        else uiState.details = null;
    }

    private async initBooths(scene: Scene, model: Group): Promise<void> {
        const logos = (await logosFromBooths(boothStore.booths as any)).filter((l) => !!l);

        var textureObj = new Map<string, THREE.Texture>();
        logos.forEach((logo) => textureObj.set(logo.name, new THREE.Texture(logo.htmlImage)));

        var textureMerger = new TextureMerger(textureObj);

        var material = new THREE.MeshBasicMaterial();
        material.side = THREE.DoubleSide;
        material.transparent = true;

        model.children.forEach((mesh, index) => {
            var [layer, name] = mesh.name.split(/ (.*)/s);

            const l = scene.addLayer(layer);
            mesh.layers.set(l);
            mesh.name = name;

            const efpBooth = store.boothStore.booths.find((b) => name && name[0] === "b" && b.name === name?.substring(1));

            if (efpBooth) {
                let objLayer = this.data.objLayers.find((l) => l.name === (efpBooth.layer?.name || "Default"));

                let z = objLayer.z + objLayer.height + (objLayer.z + objLayer.height) * 0.001;

                const boothMesh = new BoothMesh(
                    efpBooth,
                    this.data.booths.find((b) => b.name === efpBooth.name),
                    mesh as THREE.Mesh,
                    name.substring(1),
                    l,
                    z
                );

                let text = boothMesh.setText();
                if (text) scene.add(text);

                var exhibitor = (efpBooth as RegularBooth)?.exhibitors?.find((e) => !!e.logo && e.logoInBooth);
                if (exhibitor)
                    scene.add(
                        boothMesh.setLogo(
                            textureMerger,
                            logos.find((l) => l.booth.name === name.substring(1)),
                            material
                        )
                    );

                model.children[index] = boothMesh;

                booths.push(boothMesh);
            }
        });

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

        let interval = Math.round(pointSize * (getLayerSvg().getAttribute("units") == "m" ? 300 : 900));

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
