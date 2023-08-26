import { Point, Rect } from "simple-geometry";
import isDebug from "../../../utils/is-debug";

export interface IBooth {
    layer: string;
    rect: Rect;
    name: string;
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

        const baseUrl = isDebug ? `models/${expo}/` : `https://${expo}.expofp.com/data/models`;

        let response = await fetch(`${baseUrl}/model.json`);
        let data = (await response.json()) as ICommonData;
        resolve(data);
    });
}
