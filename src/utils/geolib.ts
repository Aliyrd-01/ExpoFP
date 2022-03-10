import { lineAngle, lineLength, rotatePoint, shiftPoint } from "simple-geometry";

let gpsConfig = null;
let fullGpsDistance = null;
let globalGpsBearing = null;

let fullSvgLength = null;
let fullSvgAngle = null;

export function distance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres

    return d;
}

export function bearing(lat1: number, lng1: number, lat2: number, lng2: number) {
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const brng = ((θ * 180) / Math.PI + 360) % 360; // in degrees
    return brng;
}

export type GpsConfig = {
    p0: {
        lat: number;
        lng: number;
        x: number;
        y: number;
    };
    p1: {
        lat: number;
        lng: number;
        x: number;
        y: number;
    };
};

export function gpsonfig(config: GpsConfig) {
    gpsConfig = config;

    let { p0, p1 } = config;

    fullGpsDistance = distance(p0.lat, p0.lng, p1.lat, p1.lng);
    globalGpsBearing = bearing(p0.lat, p0.lng, p1.lat, p1.lng);

    fullSvgLength = lineLength(p0, p1);
    fullSvgAngle = lineAngle(p0, p1);
}

export function convertLngLatToSvg(currLng: number, currLat: number): { x: number; y: number } {
    if (!gpsConfig) throw new Error("GPS config not found");

    let { p0 } = gpsConfig;

    // Distance between top left point of plan and current point
    let pointDistance = distance(p0.lat, p0.lng, currLat, currLng);

    // Angle between North and top left point of plan and current point
    let pointBearing = bearing(p0.lat, p0.lng, currLat, currLng);

    let deltaDegrees = pointBearing - globalGpsBearing;
    let deltaDistanсe = pointDistance / fullGpsDistance;

    let sp = shiftPoint(p0, fullSvgLength * deltaDistanсe, fullSvgAngle);

    return rotatePoint(deltaDegrees, sp, p0.x, p0.y);
}
