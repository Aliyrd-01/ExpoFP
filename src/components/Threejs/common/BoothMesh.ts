import * as THREE from "three";
import { Material, Mesh } from "three";
import { Booth } from "../../../store/BoothStore";
import { IBooth as ThreeBooth } from "../common/dataLoader";

import { getBoothlabel } from "../../Mapbox/utils/data";
import TextureMerger, { modifySphereUV } from "../utils/textureMerger";
var { Text } = require("troika-three-text");

const selectedMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide, name: "selected" });
const dimmedMaterial = new THREE.MeshPhongMaterial({ color: 0x777777, side: THREE.DoubleSide, name: "hovered" });
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

        label.color = 0xffffff;
        label.anchorX = "center";
        label.anchorY = "middle";
        label.textAlign = "center";

        const { rect } = this.threeBooth;
        let maxDimension = Math.max(rect.width, rect.height);
        let minDimension = Math.min(rect.width, rect.height);

        label.fontSize = (1.6 * maxDimension) / label.text.length;

        if (label.fontSize > minDimension) label.fontSize *= minDimension / label.fontSize;

        let mesh = label as Mesh;

        if (rect.width < rect.height) mesh.rotateZ(Math.PI / 2);

        mesh.position.x = rect.center.x;
        mesh.position.y = rect.center.y;
        mesh.position.z = this.z;
        mesh.scale.y = -1;
        mesh.name = this.name;
        mesh.layers.set(this.threeLayer);

        return label;
    }

    public setLogo(textureMerger: TextureMerger, material: THREE.MeshBasicMaterial): Mesh {
        var plane = new THREE.Mesh(new THREE.PlaneGeometry(this.threeBooth.rect.width, this.threeBooth.rect.height), material);
        plane.layers.set(this.threeLayer);

        modifySphereUV(plane, textureMerger.ranges.get(this.efpBooth.slug));
        plane.position.x = this.threeBooth.rect.center.x;
        plane.position.y = this.threeBooth.rect.center.y;
        plane.position.z = this.z;
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
