import { lineAngle, lineCenter, lineLength, rotatePoint, shiftPoint } from "simple-geometry";
import logger from "../tools/logger";

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
    p0: { x: number; y: number; lat: number; lng: number };
    p1: { x: number; y: number; lat: number; lng: number };
    p2: { x: number; y: number; lat: number; lng: number };
}

export function convertGpsToLocal(latitude: number, longitude: number, config: GpsConfig): Point {
    let currLat = latitude;
    let currLng = longitude;

    let { p0, p1 } = config;

    const fullGpsDistance = distance(p0.lat, p0.lng, p1.lat, p1.lng);
    const globalGpsBearing = bearing(p0.lat, p0.lng, p1.lat, p1.lng);

    const fullSvgLength = lineLength(p0, p1);
    const fullSvgAngle = lineAngle(p0, p1);

    // Distance between top left point of plan and current point
    let pointDistance = distance(p0.lat, p0.lng, currLat, currLng);

    // Angle between North and top left point of plan and current point
    let pointBearing = bearing(p0.lat, p0.lng, currLat, currLng);

    let deltaDegrees = pointBearing - globalGpsBearing;
    let deltaDistanсe = pointDistance / fullGpsDistance;

    // Current point position in SVG coordinates.
    let locationPixel = rotatePoint(deltaDegrees, shiftPoint(p0, fullSvgLength * deltaDistanсe, fullSvgAngle), p0.x, p0.y);

    let distToCenter = lineLength(locationPixel, lineCenter(config.p0, config.p1));
    let diagonale = lineLength(config.p0, config.p1);

    if (distToCenter > 5 * diagonale) logger.warn("Current position too far");

    return locationPixel;
}
