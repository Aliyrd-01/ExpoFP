import { getAngle, lineAngle, lineCenter, lineLength, rotatePoint, shiftPoint } from "simple-geometry";
import logger from "../tools/logger";

const radius: number = 6371000.0;
const minlon: number = -180.0;
const maxlon: number = 180.0;

let toRad = (value: number) => (value * Math.PI) / 180;
let toDeg = (value: number) => (value * 180) / Math.PI;

let robustAcos = (value: number) => {
    if (value > 1) return 1;
    if (value < -1) return -1;
    return value;
};

function distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const brng = ((θ * 180) / Math.PI + 360) % 360; // in degrees
    return brng;
}

export interface GpsConfig {
    bearing?: number;
    p0: { x: number; y: number; lat: number; lng: number };
    p1?: { x: number; y: number; lat: number; lng: number };
    p2: { x: number; y: number; lat: number; lng: number };
    style?: string;
}

export function convertGpsToLocal(latitude: number, longitude: number, config: GpsConfig): Point {
    let currLat = latitude;
    let currLng = longitude;

    let { p0, p2 } = config;

    const fullGpsDistance = distance(p0.lat, p0.lng, p2.lat, p2.lng);
    const globalGpsBearing = bearing(p0.lat, p0.lng, p2.lat, p2.lng);

    const fullSvgLength = lineLength(p0, p2);
    const fullSvgAngle = lineAngle(p0, p2);

    // Distance between top left point of plan and current point
    let pointDistance = distance(p0.lat, p0.lng, currLat, currLng);

    // Angle between North and top left point of plan and current point
    let pointBearing = bearing(p0.lat, p0.lng, currLat, currLng);

    let deltaDegrees = pointBearing - globalGpsBearing;
    let deltaDistanсe = pointDistance / fullGpsDistance;

    // Current point position in SVG coordinates.
    let locationPixel = rotatePoint(deltaDegrees, shiftPoint(p0, fullSvgLength * deltaDistanсe, fullSvgAngle), p0.x, p0.y);

    let distToCenter = lineLength(locationPixel, lineCenter(config.p0, config.p2));
    let diagonale = lineLength(config.p0, config.p2);

    if (distToCenter > 5 * diagonale) logger.warn("Current position too far");

    return locationPixel;
}

export function convertLocalToGps(x: number, y: number, geoConfig: GpsConfig): [number, number] {
    var diagAngle = -getAngle(geoConfig.p0, geoConfig.p2, { x: geoConfig.p0.x + 10000, y: geoConfig.p0.y });
    var pointAngle = -getAngle(geoConfig.p0, { x, y }, { x: geoConfig.p0.x + 10000, y: geoConfig.p0.y });

    var delta = pointAngle - diagAngle;

    var diagLen = lineLength(geoConfig.p2, geoConfig.p0);
    var pointLen = lineLength(geoConfig.p0, { x, y });
    var perc = pointLen / diagLen;

    var _distance = distance(geoConfig.p0.lat, geoConfig.p0.lng, geoConfig.p2.lat, geoConfig.p2.lng);

    var pointDist = perc * _distance;

    var _bearing = bearing(geoConfig.p0.lat, geoConfig.p0.lng, geoConfig.p2.lat, geoConfig.p2.lng);

    var res = destinationPoint(geoConfig.p0.lat, geoConfig.p0.lng, pointDist, _bearing + delta);

    return res;
}

function destinationPoint(lat: number, lng: number, distance: number, bearing: number): [number, number] {
    var delta = distance / radius;
    var theta = toRad(bearing);

    var phi1 = toRad(lat);
    var lambda1 = toRad(lng);

    var phi2 = Math.asin(Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta));

    var lambda2 =
        lambda1 +
        Math.atan2(Math.sin(theta) * Math.sin(delta) * Math.cos(phi1), Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2));

    var longitude = toDeg(lambda2);
    if (longitude < minlon || longitude > maxlon) {
        // normalise to >=-180 and <=180° if value is >MAXLON or <MINLON
        lambda2 = ((lambda2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
        longitude = toDeg(lambda2);
    }

    return [longitude, toDeg(phi2)];
}
