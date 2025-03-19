import { Point, Rect } from "simple-geometry";
import { addVersionToUrl } from "../../../tools/loaders";

export interface IBooth {
    layer: string;
    rect: Rect;
    name: string;
    zScale: number;
}

export interface IObjLayer {
    name: string;
    z: number;
    height: number;
}

export interface ConfigPoint extends Point {
    lat: number;
    lng: number;
}

export interface GeoConfig {
    center: [number, number];
    bearing: number;
    style: string;
}

export interface ICommonData {
    viewbox: Rect;
    area: Rect;
    booths: IBooth[];
    geoConfig: GeoConfig;
    objLayers: IObjLayer[];
    matrix: number[];
}

export default async function dataLoader(expo: string): Promise<ICommonData> {
    return new Promise(async (resolve, reject) => {
        const baseUrl = `https://${expo}.expofp.com/data/threejs`;
        let response = await fetch(addVersionToUrl(`${baseUrl}/model.json`));
        let data = (await response.json()) as ICommonData;
        resolve(data);
    });
}
