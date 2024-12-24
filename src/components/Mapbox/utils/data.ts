import Color from "color";
import { Feature, FeatureCollection } from "geojson";
import mapboxgl, { GeoJSONSource, Map } from "mapbox-gl";
import Rect from "../../../core/Rect";
import data from "../../../data";
import { svgArea } from "../../../data/svg";
import store, { uiState } from "../../../store";
import { Booth, RegularBooth, SpecialBooth } from "../../../store/BoothStore";
import { Layer } from "../../../store/LayerStore";
import RouteStore, { CurrentPosition } from "../../../store/RouteStore";
import settings from "../../../tools/settings";
import { bearing } from "../../../utils/geolib";
import { convertLocalToGps } from "../../../utils/gps";
import logosFromBooths from "../../../utils/imageloader";
import { Img } from "./../../../utils/imageloader";
import { fpGeo } from "./fpGeo";

type Polygon = GeoJSON.FeatureCollection<GeoJSON.Polygon>;

enum featureTypes {
    "booth" = "booth",
    "building" = "building",
    "other" = "other",
}

function getBearing() {
    var parts = fpGeo?.properties?.mpViewbox;
    var bear = fpGeo?.properties?.bearing;
    let b = bear != null ? bear : -1 * bearing(parts[1], parts[0], parts[3], parts[2]) - 90;
    if (Math.abs(b) >= 360) b = 180;
    return b;
}

function getViewbox(): Rect {
    var xMin = 1000;
    var yMin = 1000;

    var xMax = -1000;
    var yMax = -1000;

    var data = fpGeo as Polygon;

    var features = data.features.filter((f) => f.properties.type === featureTypes.booth);

    (Array.isArray(features) ? features : [features]).forEach((feature) => {
        var coords = feature.geometry.coordinates[0] || [];

        for (let index = 1; index < coords.length; index++) {
            const coord = coords[index];

            if (coord[0] < xMin) xMin = coord[0];
            if (coord[1] < yMin) yMin = coord[1];

            if (coord[0] > xMax) xMax = coord[0];
            if (coord[1] > yMax) yMax = coord[1];
        }
    });

    if (xMin === 1000) {
        var parts = fpGeo?.properties?.mpViewbox;
        var x = [parts[0], parts[2], parts[4]];
        var y = [parts[1], parts[3], parts[5]];

        return Rect.fromX1y1x2y2(Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y));
    }

    return Rect.fromX1y1x2y2(xMin, yMin, xMax, yMax);
}

function getStyle(): string {
    return fpGeo?.properties?.style || "light-v10";
}

export function actualBoothColor(b: Booth) {
    let defColor: string;
    if (b instanceof SpecialBooth) {
        defColor = b.color || settings.colors.booths.empty;
    } else if (b instanceof RegularBooth) {
        const settingsColors = settings.colors.booths;
        if (b.onHold) {
            defColor = b.holdColor || b.soldColor || settingsColors.default;
        } else if (b.exhibitors.length || b.reserved) {
            defColor = b.soldColor || settingsColors.default;
        } else {
            defColor = b.availColor || settingsColors.empty;
        }
    }

    if (defColor === "#666" || defColor === "#666666") defColor = "rgba(0,0,0,0.172)";

    return defColor;
}

export function getBoothlabel(booth: Booth) {
    if (booth instanceof SpecialBooth) return booth.title || booth.name;

    let exh = data.hideExhibitors
        ? []
        : !data.onlyFeaturedExhibitors
        ? booth.exhibitors
        : booth.exhibitors.filter((e) => e.featured);

    return booth.noLabels ? null : (exh || [])[0]?.name || booth.title || booth.name;
}

function decimalToHex(input: string) {
    var h = parseInt(input).toString(16);
    return h.length === 1 ? "0" + h : h;
}

export const props = {
    token: "pk.eyJ1Ijoicm9kaW9ubmlrb2xhZXYiLCJhIjoiY2wwanE5aXB4MDM2NTNibGExd3k4bHhsaiJ9.wdpy8dJ1qktQXGtZYDNH3w",
    initBearing: getBearing() + 30,
    initPitch: 30,
    bearing: getBearing(),
    viewbox: getViewbox(),
    style: getStyle(),
    edgeZoom: 19,
    extrusion: {
        building: 5,
        booths: 0.5,
        other: 0.5,
    },
};

const isDark = props.style.indexOf("dark") > -1;

const lineStyle = isDark
    ? ["interpolate", ["linear"], ["line-progress"], 0, "#ff9e2c", 0.5, "lime", 1, "#30afeb"]
    : [
          "interpolate",
          ["linear"],
          ["line-progress"],
          0,
          Color("#ff9e2c").darken(0.3).hex(),
          0.5,
          Color("lime").darken(0.3).hex(),
          1,
          Color("#30afeb").darken(0.3).hex(),
      ];

let markersObject = {};

let map: Map;

const canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
function fillBg(image: HTMLImageElement) {
    const { width, height } = image;
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0);

    return context.getImageData(0, 0, width, height);
}

export async function loadLogos(booths: RegularBooth[]): Promise<Img[]> {
    const logos = (await logosFromBooths(booths)).filter((l) => !!l);

    logos.forEach((image) => map.addImage(image.name, fillBg(image.htmlImage)));
    return logos;
}

export function setMap(m: Map) {
    map = m;
}

export function convertSvgPoint(x: number, y: number) {
    return convertLocalToGps(x, y, fpGeo.properties.config);
}

export function moveToRect(
    svgRect: Rect,
    paddingPercent: number = 200,
    duration: number = 1000,
    pitch: number = props.initPitch,
    bearing: number = props.initBearing
) {
    if (!map) return;

    const padding = (paddingPercent / 100) * Math.max(Math.abs(svgRect.x2 - svgRect.x1), Math.abs(svgRect.y2 - svgRect.y1)) || 0;

    var p1 = convertSvgPoint(svgRect.x1 - padding, svgRect.y1 - padding);
    var p2 = convertSvgPoint(svgRect.x2 + padding, svgRect.y2 + padding);

    map.fitBounds([p1, p2], {
        essential: true,
        duration,
        pitch,
        bearing,
    });

    uiState.moveToRect = null;
}

export function moveToLocation(duration: number = 1000, pitch: number = props.initPitch, bearing: number = props.initBearing) {
    const currentPosition = store.routeStore.currentPosition;
    const { lng, lat, x, y } = currentPosition;

    if (!(lng && lat) && !fpGeo.properties.config) return;

    const [newLng, newLat] = lng && lat ? [lng, lat] : convertLocalToGps(x, y, fpGeo.properties.config);

    map.flyTo({
        center: [newLng, newLat],
        essential: true,
        duration,
        pitch,
        bearing,
    });

    map.once("moveend", () => {
        uiState.moveToLocation = false;
    });
}

export function zoomMap(zoomIn: boolean) {
    map.flyTo({
        zoom: map.getZoom() + (zoomIn ? 0.5 : -0.5),
        animate: true,
        duration: 500,
        essential: true,
    });
}

export function switchViewbox(showMapbox: boolean) {
    let duration = 1200;

    if (showMapbox) {
        if (uiState.selectedBooths.size) {
            moveToRect(Rect.fromMultiple([...uiState.selectedBooths].map((b) => b.rect)));
        } else {
            uiState.moveToRect = store.layerStore.rectangle || svgArea;
        }
    } else {
        uiState.moveToRect = store.layerStore.rectangle || svgArea;
        moveToRect(svgArea, 0, duration, 0, props.bearing);
    }

    store.mapboxStore.mapBoxSelected = showMapbox;
}

export function setDataSource(booths: Booth[], logos: Img[]) {
    fpGeo.features.forEach((f: Feature) => {
        f.properties.id = f.properties.id?.substring(1);

        f.properties.height = props.extrusion[f.properties.type] || props.extrusion.booths;

        if (f.properties.type === featureTypes.booth) {
            let booth = booths.filter((b) => b.name === f.properties.id)[0];
            if (booth) {
                f.properties.color = actualBoothColor(booth);
                f.properties.description = getBoothlabel(booth);

                const logo = logos.find((l) => l?.name === booth.slug);

                if (logo) {
                    var diagonale = Math.max(booth.rect.w, booth.rect.h);
                    var aRatio = diagonale / logo.htmlImage.width;
                    f.properties.scale = Math.max(0.08, aRatio / 5);
                    f.properties.scale1 = 5 * f.properties.scale;

                    var exhibitor = (booth as RegularBooth)?.exhibitors?.find((e) => !!e.logo && e.logoInBooth);
                    if (exhibitor) f.properties.logo = booth.slug;
                }
            }
        } else {
            let color = f.properties.color;
            f.properties.color = `#${decimalToHex(color.R || color.r || 0)}${decimalToHex(color.G || color.g || 0)}${decimalToHex(
                color.B || color.b || 0
            )}`;
        }
    });

    updateSelectionDataSource([...uiState.selectedBooths], store.boothStore.booths);

    return map.addSource("data", { type: "geojson", data: fpGeo });
}

export function updateHoverDataSource(hoveredBooths: Booth[], allBooths: Booth[]) {
    fpGeo.features.forEach((f: Feature) => {
        if (f.properties.type === featureTypes.booth) {
            var b = allBooths.find((booth) => booth.name === f.properties.id);

            if (hoveredBooths.indexOf(b) > -1) f.properties.height = 4 * props.extrusion.booths;
            else f.properties.height = props.extrusion.booths;
        }
    });

    (map.getSource("data") as GeoJSONSource)?.setData(fpGeo);
}

export function updateSelectionDataSource(selectedBooths: Booth[], allBooths: Booth[]) {
    fpGeo.features.forEach((f: Feature) => {
        if (f.properties.type === featureTypes.booth) {
            const b = allBooths.find((booth) => booth.name === f.properties.id);
            const color = actualBoothColor(b);

            if (selectedBooths.length) {
                f.properties.color = selectedBooths.indexOf(b) === -1 ? Color(color).darken(0.7).hex() : "#f03b55";
            } else {
                f.properties.color = color;
            }
        }
    });

    (map.getSource("data") as GeoJSONSource)?.setData(fpGeo);
}

export function setLayers(layers: Layer[]): string[] {
    const layersNames: string[] = [];

    layers.forEach((layer) => {
        const images = fpGeo.images?.filter((i) => i.layer === layer.name) ?? [];

        images.forEach((image, index) => {
            const bgLayer = layer.name + "--bg_" + index;

            layersNames.push(bgLayer);
            map.addSource(bgLayer, {
                type: "image",
                url: image.data,
                coordinates: image.points,
            });

            map.addLayer({
                id: bgLayer,
                source: bgLayer,
                type: "raster",
                layout: {
                    visibility: layer.visible ? "visible" : "none",
                },
            });
        });

        layersNames.push(layer.name + "--other");
        map.addLayer({
            id: layer.name + "--other",
            type: "fill",
            source: "data",
            filter: ["all", ["in", "type", featureTypes.other], ["in", "layer", layer.name], ["!in", "value", "3D"]],
            layout: {
                visibility: layer.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": ["get", "color"],
            },
        });

        layersNames.push(layer.name + "--other-3D");

        map.addLayer({
            id: layer.name + "--other-3D",
            type: "fill-extrusion",
            source: "data",
            filter: ["all", ["in", "type", featureTypes.other], ["in", "layer", layer.name], ["in", "value", "3D"]],
            layout: {
                visibility: layer.visible ? "visible" : "none",
            },
            paint: {
                "fill-extrusion-color": ["get", "color"],
                "fill-extrusion-height": ["get", "height"],
            },
        });
    });

    layers.forEach((layer) => {
        var layerBooths = fpGeo.features.filter(
            (feature) => feature.properties.type === featureTypes.booth && feature.properties.layer === layer.name
        );

        if (layerBooths.length) {
            layersNames.push(layer.name);
            layersNames.push(layer.name + "--labels");
            layersNames.push(layer.name + "--logos");

            map.addLayer({
                id: layer.name,
                type: "fill-extrusion",
                source: "data",
                filter: ["all", ["in", "type", featureTypes.booth], ["in", "layer", layer.name]],
                layout: {
                    visibility: layer.visible ? "visible" : "none",
                },
                paint: {
                    "fill-extrusion-color": ["get", "color"],
                    "fill-extrusion-height": ["get", "height"],
                    "fill-extrusion-opacity": 1,
                },
            });

            map.addLayer({
                id: layer.name + "--labels",
                type: "symbol",
                source: "data",
                filter: ["all", ["in", "type", featureTypes.booth], ["in", "layer", layer.name], ["!has", "logo"]],
                minzoom: 18,

                layout: {
                    "text-field": ["get", "description"],
                    "text-size": ["interpolate", ["linear"], ["zoom"], 18, 8, 19.5, 10, 20, 11, 20.5, 11, 21, 16, 22, 20],
                    "text-allow-overlap": false,
                    "text-ignore-placement": false,
                    visibility: layer.visible ? "visible" : "none",
                },

                paint: {
                    "text-color": settings.boothLabelColor,
                },
            });

            map.addLayer({
                id: layer.name + "--logos",
                type: "symbol",
                source: "data",
                filter: ["all", ["in", "type", featureTypes.booth], ["in", "layer", layer.name], ["has", "logo"]],
                minzoom: 18,
                layout: {
                    "icon-size": ["interpolate", ["exponential", 2], ["zoom"], 18, ["get", "scale"], 22, ["get", "scale1"]],
                    "icon-image": ["get", "logo"],
                    "icon-anchor": "bottom",
                    //"icon-size": ["get", "scale"],
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true,
                    "icon-rotation-alignment": "viewport",
                    "icon-pitch-alignment": "viewport",
                    visibility: layer.visible ? "visible" : "none",
                },
            });
        }
    });
    return layersNames;
}

export function setBuildingsLayer(): void {
    map.addLayer({
        id: "buildings",
        type: "fill-extrusion",
        source: "data",
        filter: ["in", "type", featureTypes.building],
        paint: {
            "fill-extrusion-vertical-gradient": true,
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-opacity": ["interpolate", ["linear", 0.5], ["zoom"], 16, 0.9, 19, 0.1],
        },
    });
}

export function setMarker(type: "from" | "to" | "yah" | "cp", point: CurrentPosition) {
    var marker = markersObject[type];

    if (!point) {
        marker?.remove();
        markersObject[type] = null;
        return;
    }

    const { x, y } = point;
    const lngLat: [number, number] =
        point.lat && point.lng ? [point.lng, point.lat] : convertLocalToGps(x, y, fpGeo.properties.config);

    if (!marker) {
        var htmlElement = document.createElement("div");
        htmlElement.className = `marker ${type}`;
        marker = new mapboxgl.Marker(htmlElement, {
            rotationAlignment: type !== "to" && type !== "yah" ? "map" : "auto",
        }).setLngLat(lngLat);

        marker.addTo(map);
        markersObject[type] = marker;
    }

    marker.setLngLat(lngLat);
}

export function setWayfindingLayer() {
    map.addSource("wfData", {
        type: "geojson",
        lineMetrics: true,
        data: null,
    });

    map.addLayer({
        id: "wf",
        type: "line",
        source: "wfData",
        minzoom: 2,
        paint: {
            "line-color": "#30afeb",
            "line-width": 3,
            "line-gradient": lineStyle as any,
            "line-gap-width": 2,
        },
        layout: {
            "line-cap": "round",
            "line-join": "round",
        },
    });
}

export function updateRouteLines(routeStore: RouteStore) {
    var wayfindingData = map.getSource("wfData") as GeoJSONSource;
    if (!wayfindingData) {
        setWayfindingLayer();
        wayfindingData = map.getSource("wfData") as GeoJSONSource;
    }

    var routeLines = routeStore.routeLines.filter((line) => {
        let visible = store.layerStore.layers.find((l) => l.name === line.p0.layer)?.visible ?? true;
        return !line.virtual && visible;
    });

    var firstPoint = routeLines[0]?.p0;
    var lastPoint = routeLines[routeLines.length - 1]?.p1;

    var points = [];
    if (lastPoint) {
        points = routeLines.map((rl) => convertLocalToGps(rl.p0.x, rl.p0.y, fpGeo.properties.config));
        points.push(convertLocalToGps(lastPoint.x, lastPoint.y, fpGeo.properties.config));
    }

    var fc: FeatureCollection = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},

                geometry: {
                    type: "LineString",
                    coordinates: points,
                },
            },
        ],
    };

    wayfindingData.setData(fc);
    setMarker("from", lastPoint);
    setMarker("to", firstPoint);
}
