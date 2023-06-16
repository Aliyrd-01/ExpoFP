import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { Group } from "three";

export default async function loadModel(objPath: string, mtlPath: string): Promise<Group> {
    return new Promise(async (resolve, reject) => {
        var mtl = await loadMaterial(mtlPath);

        mtl.getAsArray().forEach((material) => {
            if (material.name.indexOf(".webp") > -1) {
                material.alphaTest = 0.6;
                material.transparent = true;
            }
        });

        const loader = new OBJLoader();
        loader.setMaterials(mtl);

        loader.load(
            objPath,
            async (obj) => resolve(obj),
            undefined,
            (error) => reject(error)
        );
    });
}

// Generate function metarial loader threejs
async function loadMaterial(path: string): Promise<MTLLoader.MaterialCreator> {
    return new Promise((resolve, reject) => {
        const loader = new MTLLoader();
        loader.setMaterialOptions({ side: 2 });

        loader.load(
            path,
            (material) => {
                resolve(material);
            },
            undefined,
            (error) => {
                reject(error);
            }
        );
    });
}
