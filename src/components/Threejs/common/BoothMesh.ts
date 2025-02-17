import { lineAngle } from "simple-geometry";
import * as THREE from "three";
import { Material, Mesh } from "three";
import { Booth } from "../../../store/BoothStore";
import { IBooth as ThreeBooth } from "../common/dataLoader";

import settings from "../../../tools/settings";
import { getBoothlabel } from "../../Mapbox/utils/data";
import TextureMerger, { modifySphereUV } from "../utils/textureMerger";
var { Text } = require("troika-three-text");

const selectedMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide, name: "selected" });

// const dimmedMaterial = new THREE.MeshPhongMaterial({
//     color: 0x777777,
//     side: THREE.DoubleSide,
//     name: "hovered",
// });

const dimmedMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 1,
    //envMapIntensity: 0.5,
    clearcoat: 0.5,
    transparent: true,
    //transmission: 0.85,
    opacity: 0.5,
    //reflectivity: 0.2,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true,
});

const hoveredMaterial = new THREE.MeshPhongMaterial({ color: 0xff5733, side: THREE.DoubleSide, name: "hovered" });

export class BoothMesh extends THREE.Group {
    private material: Material | Material[];

    public constructor(
        public efpBooth: Booth,
        public threeBooth: ThreeBooth,
        public boothMesh: THREE.Mesh,
        public name: string,
        public threeLayer: number,
        public z: number
    ) {
        super();
        this.name = name;
        boothMesh.name = name;
        this.material = boothMesh.material;
        this.children.push(boothMesh);
        this.layers.set(threeLayer);
    }

    public setText(): Mesh {
        const label = new Text();
        label.text = getBoothlabel(this.efpBooth);
        if (!label.text) return;
        label.color = this.efpBooth.labelColor || settings.boothLabelColor;
        label.anchorX = "center";
        label.anchorY = "middle";
        label.textAlign = "center";

        // if (label.text !== "FACIL'iti") return;

        //if (label.text.indexOf("LOW O2") == -1) return;

        const words: string[] = label.text.split(" ");
        const maxWordLength = Math.max(...words.map((w) => w.length));

        const { rect } = this.threeBooth;
        let maxDimension = Math.max(rect.width, rect.height);
        let minDimension = Math.min(rect.width, rect.height);

        label.fontSize = minDimension;

        if (label.fontSize * label.text.length > maxDimension)
            label.fontSize *= (1.1 * maxDimension) / (label.fontSize * label.text.length);

        if (label.fontSize / minDimension < 0.15) {
            label.maxWidth = 0.1;
            label.fontSize *= words.length;

            if (label.fontSize * words.length > minDimension)
                label.fontSize *= (0.9 * minDimension) / (label.fontSize * words.length);

            if (label.fontSize * maxWordLength > maxDimension) label.fontSize *= maxDimension / (label.fontSize * maxWordLength);
        }

        let mesh = label as Mesh;

        var angle = lineAngle(this.threeBooth.rect.p0, this.threeBooth.rect.p1) || 0;

        if (1.5 * rect.width < rect.height) angle += 90;

        mesh.rotateZ((angle * Math.PI) / 180);

        mesh.position.x = rect.center.x;
        mesh.position.y = rect.center.y;
        mesh.position.z = this.z + 0.01;
        mesh.scale.y = -1;
        mesh.name = this.name;
        mesh.layers.set(this.threeLayer);

        return label;
    }

    public setLogo(textureMerger: TextureMerger, ratio: number, material: THREE.MeshBasicMaterial): Mesh {
        const rect = this.threeBooth.rect;

        const ratioBooth = rect.width / rect.height;

        let w = 0;
        let h = 0;

        let angle: number = 0;

        if (ratioBooth > ratio) {
            h = rect.height * 0.9;
            w = h * ratio;
        } else {
            w = rect.width * 0.9;
            h = w / ratio;
        }

        if (ratio >= 2 && !this.efpBooth.rotate && rect.height >= rect.width * 2.0) {
            let newH = rect.width * 0.9;
            let newW = newH * ratio;

            while (newW > rect.height - 0.02) {
                newH -= 0.01;
                newW = newH * ratio;
            }

            h = newH;
            w = newW;
            angle = -90;
        } else {
            angle = (-this.efpBooth.rotate * 180) / Math.PI;
        }

        const range = textureMerger.ranges.get(this.efpBooth.slug + "_logo");
        if (!range) return null;

        var plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
        plane.layers.set(this.threeLayer);

        modifySphereUV(plane, range);

        plane.rotateZ(((angle || 0) * Math.PI) / 180);

        plane.position.x = rect.center.x;
        plane.position.y = rect.center.y;
        plane.position.z = this.z + 0.01 * this.z;
        plane.scale.y = -1;

        plane.material.map = textureMerger.mergedTexture;
        plane.name = this.efpBooth.name;

        return plane;
    }

    public dimmed(value: boolean) {
        this.boothMesh.material = value ? dimmedMaterial : this.material;
        this.boothMesh.userData.dimmed = value;
    }

    public hovered(value: boolean) {
        if (value) this.boothMesh.material = hoveredMaterial;
        else if (this.boothMesh.userData.dimmed) this.boothMesh.material = dimmedMaterial;
        else if (this.boothMesh.userData.selected) this.boothMesh.material = this.material;
        else this.boothMesh.material = this.material;
    }

    // public selected(value: boolean) {
    //     this.boothMesh.material = value ? this.material : dimmedMaterial;
    //     this.boothMesh.userData.selected = value;
    // }
}
