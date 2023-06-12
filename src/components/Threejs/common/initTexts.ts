import * as THREE from "three";
import { Mesh } from "three";
import store from "../../../store";
import { RegularBooth } from "../../../store/BoothStore";
import { loadLogos } from "../../Mapbox/utils/data";
import TextureMerger, { modifySphereUV } from "../utils/textureMerger";
import { ICommonData } from "./dataLoader";
var { Text } = require("troika-three-text");

export default async function initTexts(threeLayers: Map<string, number>, scene: THREE.Scene, data: ICommonData) {
    var loader = new THREE.TextureLoader();
    var obj = new Map<string, THREE.Texture>();

    const logos = await loadLogos(store.boothStore.booths as RegularBooth[]);

  

    var textureMerger = new TextureMerger(obj);

    var material = new THREE.MeshBasicMaterial();
    material.side = THREE.DoubleSide;
    material.transparent = true;

    data.booths.forEach(async (booth) => {
        let layer = data.objLayers.find((l) => l.name === booth.layer);

        if (booth.logo) {
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(booth.rect.width, booth.rect.height), material);
            scene.add(plane);

            plane.layers.set(threeLayers.get(booth.layer));
            modifySphereUV(plane, textureMerger.ranges.get(booth.logo));
            plane.position.z = layer.z + layer.height + (layer.z + layer.height) * 0.01;
            plane.position.x = booth.rect.center.x;
            plane.position.y = booth.rect.center.y;
            plane.scale.y = -1;

            plane.material.map = textureMerger.mergedTexture;
        } else {
            const myText = new Text();
            scene.add(myText);

            myText.text = booth.id.substring(1);

            myText.fontSize = (1.7 * booth.rect.width) / myText.text.length;

            if (myText.fontSize > booth.rect.height) myText.fontSize *= booth.rect.height / myText.fontSize;

            myText.position.z = layer.z + layer.height + (layer.z + layer.height) * 0.01;
            myText.position.x = booth.rect.p0.x;
            myText.position.y = booth.rect.p0.y;
            myText.color = 0xffffff;
            myText.anchorX = "left";
            myText.anchorY = "top";
            myText.textAlign = "left";
            myText.scale.y = -1;

            let mesh = myText as Mesh;
            mesh.layers.set(threeLayers.get(booth.layer));
            myText.sync();
        }
    });
}
