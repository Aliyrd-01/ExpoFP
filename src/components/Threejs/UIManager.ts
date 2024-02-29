import * as THREE from "three";
import { Group, Intersection, Object3D, WebGLRenderer } from "three";
import { Booth, RegularBooth } from "./../../store/BoothStore";
import { RouteLine } from "./../../utils/wayfinding";
import { BoothMesh } from "./common/BoothMesh";

import RouteStore from "../../store/RouteStore";
import dataLoader, { ICommonData } from "./common/dataLoader";

import loadModel from "./common/modelLoader";
import Scene from "./common/Scene";
import init from "./index";
import { init as initMapbox } from "./mapbox/index_mapbox";

import store, { boothStore, layersStore, uiState } from "../../store";

import { getLayerSvg } from "../../data/svg";
import { LayersMode } from "../../store/LayerStore";
import logosFromBooths from "../../utils/imageloader";
import isDebug from "../../utils/is-debug";
import { splitPolyLine } from "../Map/drawing/config/config-wf";
import { SpriteMesh } from "./common/SpriteMesh";
import canvasFromText from "./utils/canvasFromText";
import TextureMerger from "./utils/textureMerger";

import { actualBoothColor } from "../Mapbox/utils/data";

import cp from "./assets/cp.png";
import fr from "./assets/from.png";
import to from "./assets/to.png";
import yah from "./assets/yah.png";

const routeMeshes: THREE.Mesh[] = [];
const defaultMaterial = new THREE.MeshPhongMaterial({ color: 0x30afeb });
const currentMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

let routeIndex = 0;

const booths: BoothMesh[] = [];

const pointSize = (data: ICommonData): number => data.objLayers[0].height / 2;

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

            const baseUrl = isDebug
                ? `https://efp-data.s3.amazonaws.com/expos/${this.expo}/data/threejs`
                : `https://${this.expo}.expofp.com/data/threejs`;

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

    public setMarker(
        type: "from" | "to" | "yah" | "cp",
        x: number,
        y: number,
        layer: string | number,
        inLocal: boolean = false,
        scale: number = 1
    ) {
        const name = `{sprite_${type}}`;
        let sprite = this.scene.children.find((c) => c.name === name);

        if (x != null && y != null) {
            const localPoint = inLocal ? { x, y } : this.convertPoint(x, y, 0);

            let objLayer =
                this.data.objLayers.find((l) => l.name === store.layerStore.findLayer(layer)?.name) || this.data.objLayers[0];

            if (!sprite) {
                if (type === "from") sprite = new SpriteMesh(fr, objLayer.height * scale * 4);
                else if (type === "to") sprite = new SpriteMesh(to, objLayer.height * scale * 4);
                else if (type === "yah") sprite = new SpriteMesh(yah, objLayer.height * scale * 4);
                else if (type === "cp") sprite = new SpriteMesh(cp, objLayer.height * scale * 4);
                sprite.name = name;
                this.scene.add(sprite);
            }
            sprite.position.set(localPoint.x, localPoint.y, objLayer.z + objLayer.height);
        } else if (sprite) {
            this.scene.remove(sprite);
        }
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
        if (!this.isInit) return;

        var routeLines = routeStore.routeLines.filter((line) => {
            let visible = store.layerStore.layers.find((l) => l.name === line.p0.layer)?.visible ?? true;
            return !line.virtual && visible;
        });

        routeMeshes.forEach((g) => this.scene.remove(g));
        routeMeshes.splice(0, routeMeshes.length);

        if (!routeLines.length) {
            this.setMarker("from", null, null, null);
            this.setMarker("to", null, null, null);
            return;
        }

        const points = this.linesToPoints(routeLines);

        const { z } = this.data.objLayers.find(
            (l) => l.name === (layersStore.mode === LayersMode.Default ? "Default" : routeLines[0].p0.layer)
        );

        []
            .concat(points)
            .reverse()
            .forEach((point, index) => {
                const geometry = new THREE.SphereGeometry(pointSize(this.data));
                const cube = new THREE.Mesh(geometry, defaultMaterial);
                cube.position.set(point.x, point.y, z + 0.02);
                routeMeshes.push(cube);
                this.scene.add(cube);
            });

        this.setMarker("to", routeLines[0].p0.x, routeLines[0].p0.y, routeLines[0].p0.layer);
        this.setMarker(
            "from",
            routeLines[routeLines.length - 1].p1.x,
            routeLines[routeLines.length - 1].p1.y,
            routeLines[routeLines.length - 1].p1.layer
        );
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

    private onClickCallback(intersections: Array<Intersection<Object3D>>): void {
        const intersection = intersections.filter((i) => i.object.name !== "building")[0];
        let name = intersection?.object?.name;
        let booth = boothStore.booths.find((b) => b.name === name);
        if (booth) store.clickBooth(booth);
        else uiState.details = null;
    }

    private async initBooths(scene: Scene, model: Group): Promise<void> {
        const logos = (await logosFromBooths(boothStore.booths as any)).filter((l) => !!l);

        var textureObj = new Map<string, THREE.Texture>();
        logos.forEach((logo) => textureObj.set(logo.name + "_logo", new THREE.Texture(logo.htmlImage)));

        store.boothStore.booths.forEach((b) => {
            textureObj.set(b.slug, new THREE.Texture(canvasFromText(b.name)));
        });

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
                (mesh as THREE.Mesh).material = new THREE.MeshPhongMaterial({
                    color: actualBoothColor(efpBooth),
                    side: THREE.DoubleSide,
                    name: mesh.name,
                });

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
                if (exhibitor) {
                    const img = logos.find((l) => l.booth.name === name.substring(1));
                    const logo = boothMesh.setLogo(textureMerger, img.htmlImage.width / img.htmlImage.height, material);
                    if (logo) scene.add(logo);
                }

                model.children[index] = boothMesh;

                booths.push(boothMesh);
            }
        });

        scene.add(model);
    }

    private convertPoint(x: number, y: number, z: number): THREE.Vector3 {
        var m = this.data.matrix;

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

        let interval = Math.round(pointSize(this.data) * (getLayerSvg().getAttribute("units") == "m" ? 300 : 900));

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

        return routePoints.map((p) => this.convertPoint(p.x, p.y, p.z));
    }
}
