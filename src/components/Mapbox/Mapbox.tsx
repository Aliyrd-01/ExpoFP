import classNames from "classnames";
import mapboxgl, { Map } from "mapbox-gl";
import { useObserver } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import Rect from "../../core/Rect";
import svg, { svgArea } from "../../data/svg";
import store, { uiState } from "../../store";
import { Booth, RegularBooth, SpecialBooth } from "../../store/BoothStore";
import { loadJson } from "../../tools/loaders";
import logger from "../../tools/logger";
import settings from "../../tools/settings";
import { bearing, distance } from "../../utils/geolib";
import { useReaction } from "../../utils/mobx";
import MapboxGLButtonControl from "./Button";
import { pulsingDot } from "./Dot";
import "./Mapbox.scss";

function b() {
    var el = (svg.querySelector("[data-mb-type='viewbox']") as SVGGraphicsElement)?.getAttribute("data-mb-value") as string;
    if (!el) {
        store.mapboxStore.mapBoxEnabled = false;
        return 0;
    }
    var parts = el.split(" ").map((p) => parseFloat(p));
    if (parts.length < 6) return 0;
    return -1 * bearing(parts[1], parts[0], parts[3], parts[2]) - 90;
}

var props = {
    token: "pk.eyJ1Ijoicm9kaW9ubmlrb2xhZXYiLCJhIjoiY2wwanE5aXB4MDM2NTNibGExd3k4bHhsaiJ9.wdpy8dJ1qktQXGtZYDNH3w",
    bearing: b(),
    edgeZoom: 19,
    extrusion: {
        building: 2,
        venue: 3,
        other: 3,
    },
};

type Polygon = GeoJSON.FeatureCollection<GeoJSON.Polygon>;

export default function Mapbox() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    let s: Polygon;

    useReaction(
        () => uiState.zoomAfTransformK,
        () => {
            if (uiState.zoomAfTransformK < 0.6) {
                store.selectNone();
                switchViewbox(true);
            }
        }
    );

    useReaction(
        () => store.mapboxStore.mapBoxSelected,
        () => {
            if (store.mapboxStore.mapBoxSelected === null) switchViewbox(true);
        }
    );

    function getViewbox(): Rect {
        var xMin = 1000;
        var yMin = 1000;

        var xMax = -1000;
        var yMax = -1000;

        var features =
            s.features.filter((f) => f.properties.type === "viewbox")[0] ||
            s.features.filter((f) => f.properties.type === "venue")[0] ||
            s.features.filter((f) => f.properties.type === "booth");

        (Array.isArray(features) ? features : [features]).forEach((feature) => {
            var coords = feature.geometry.coordinates[0];

            for (let index = 1; index < coords.length; index++) {
                const coord = coords[index];

                if (coord[0] < xMin) xMin = coord[0];
                if (coord[1] < yMin) yMin = coord[1];

                if (coord[0] > xMax) xMax = coord[0];
                if (coord[1] > yMax) yMax = coord[1];
            }
        });

        return Rect.fromX1y1x2y2(xMin, yMin, xMax, yMax);
    }

    function flyToCenter(bearing: number, duration: number, boundsOffset: number = 0): Promise<void> {
        return new Promise((resolve) => {
            let current: Map = map.current;

            setTimeout(() => resolve(), duration);
            let rect = getViewbox();

            current.fitBounds(
                [
                    [rect.x1 - boundsOffset, rect.y1 - boundsOffset],
                    [rect.x2 + boundsOffset, rect.y2 + boundsOffset],
                ],
                {
                    bearing,
                    essential: true,
                    duration,
                    pitch: 0,
                }
            );
        });
    }

    function switchViewbox(mapBoxSelected: boolean) {
        let current: Map = map.current;
        let duration = 1200;

        store.mapboxStore.mapBoxSelected = mapBoxSelected;

        current.scrollZoom.disable();
        current.touchPitch.disable();
        current.touchZoomRotate.disable();

        setTimeout(() => {
            current.scrollZoom.enable();
            current.touchPitch.enable();
            current.touchZoomRotate.enable();
        }, duration);

        if (mapBoxSelected) {
            flyToCenter(0, duration).then(() => {
                uiState.moveToRect = svgArea;
            });
        } else {
            uiState.moveToRect = svgArea;
            flyToCenter(props.bearing, duration).then(() => {
                current.setZoom(props.edgeZoom - 0.5);
            });
        }
    }

    function polyIntersected(bounds: mapboxgl.LngLatBounds, rect: Rect): boolean {
        function contains(a, b) {
            return !(b.x1 < a.x1 || b.y1 < a.y1 || b.x2 > a.x2 || b.y2 > a.y2);
        }

        function overlaps(a, b) {
            // no horizontal overlap
            if (a.x1 >= b.x2 || b.x1 >= a.x2) return false;

            // no vertical overlap
            if (a.y1 >= b.y2 || b.y1 >= a.y2) return false;

            return true;
        }

        function touches(a, b) {
            // has horizontal gap
            if (a.x1 > b.x2 || b.x1 > a.x2) return false;

            // has vertical gap
            if (a.y1 > b.y2 || b.y1 > a.y2) return false;

            return true;
        }

        let arr = bounds.toArray();
        let rect1 = { x1: arr[0][0], y1: arr[0][1], x2: arr[1][0], y2: arr[1][1] };

        let l1 = distance(rect.x1, rect.y1, rect.x2, rect.y2);
        let l2 = distance(rect1.x1, rect1.y1, rect1.x2, rect1.y2);

        return l1 > 1.2 * l2 && (touches(rect1, rect) || overlaps(rect1, rect) || contains(rect1, rect));
    }

    function defaultColor(b: Booth) {
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

    useEffect(() => {
        if (map.current) return;

        loadJson<Polygon>(`https://${settings.EXPO}.expofp.com/data/geo.data.json?t=${new Date().getMilliseconds()}`)
            .then((data) => {
                s = data;

                if (!data.features.length) store.mapboxStore.mapBoxEnabled = false;

                var { cx: lng, cy: lat } = getViewbox();

                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: "mapbox://styles/mapbox/light-v9",
                    center: [lng, lat],
                    zoom: 12,
                    bearing: 30,
                    pitch: 30,
                    maxPitch: 45,
                    accessToken: props.token,
                });

                let current: Map = map.current;

                current.addControl(new MapboxGLButtonControl(() => switchViewbox(false), "fa fa-home"), "top-left");

                current.addControl(
                    new mapboxgl.GeolocateControl({
                        positionOptions: {
                            enableHighAccuracy: true,
                        },
                        trackUserLocation: true,
                        showUserHeading: true,
                    }),
                    "top-left"
                );

                current.addControl(
                    new mapboxgl.NavigationControl({
                        showCompass: false,
                    }),
                    "top-left"
                );

                current.addControl(new MapboxGLButtonControl(() => flyToCenter(0, 1000), "fa fa-expand-arrows-alt"), "top-left");

                current.on("load", async () => {
                    setTimeout(() => flyToCenter(0, 4000, 0.001), 1000);

                    data.features.forEach((f) => {
                        f.properties.id = f.properties.id?.substring(1);

                        f.properties.height = props.extrusion[f.properties.type] || props.extrusion.other;

                        if (f.properties.type === "booth") {
                            let booth = store.boothStore.booths.filter((b) => b.name === f.properties.id)[0];
                            if (booth) f.properties.color = defaultColor(booth);
                        } else if (f.properties.color) {
                            f.properties.color = `#${parseInt(f.properties.color.R).toString(16)}${parseInt(
                                f.properties.color.G
                            ).toString(16)}${parseInt(f.properties.color.B).toString(16)}`;
                        }
                    });

                    current.addSource("booths", {
                        type: "geojson",
                        data,
                    });

                    current.addLayer({
                        id: "venue",
                        type: "fill-extrusion",
                        source: "booths",
                        filter: ["!in", "type", "booth", "viewbox"],
                        paint: {
                            "fill-extrusion-color": ["get", "color"],
                            "fill-extrusion-height": ["get", "height"],
                            "fill-extrusion-base": 0,
                            "fill-extrusion-opacity": 0.8,
                        },
                    });

                    current.addLayer({
                        id: "booths",
                        type: "fill",
                        source: "booths",
                        filter: ["==", "type", "booth"],
                        paint: {
                            "fill-color": ["get", "color"],
                            "fill-outline-color": "#FFFFFF",
                        },
                    });

                    let b = getViewbox();

                    current.addImage("pulsing-dot", pulsingDot(200, current), { pixelRatio: 2 });

                    current.addSource("dot-point", {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: [
                                {
                                    properties: {},
                                    type: "Feature",
                                    geometry: {
                                        type: "Point",
                                        coordinates: [b.cx, b.cy], // icon position [lng, lat]
                                    },
                                },
                            ],
                        },
                    });

                    current.addLayer({
                        id: "layer-with-pulsing-dot",
                        type: "symbol",
                        source: "dot-point",
                        minzoom: 16,
                        layout: {
                            "icon-image": "pulsing-dot",
                        },
                    });

                    current.on("mouseenter", ["booths"], () => {
                        current.getCanvas().style.cursor = "pointer";
                    });

                    current.on("mouseleave", ["booths"], () => {
                        current.getCanvas().style.cursor = "";
                    });

                    let prevZoom = 0;
                    current.on("zoom", (e) => {
                        let zoom = current.getZoom();

                        if (zoom > prevZoom && zoom > props.edgeZoom && polyIntersected(current.getBounds(), getViewbox()))
                            switchViewbox(false);

                        prevZoom = zoom;
                    });

                    current.on("click", (e) => {
                        const bbox = [
                            [e.point.x - 5, e.point.y - 5],
                            [e.point.x + 5, e.point.y + 5],
                        ] as any;

                        var props = current.queryRenderedFeatures(bbox, { layers: ["booths", "venue"] })[0]?.properties;
                        if (!props) return;

                        switchViewbox(false);
                    });
                });
            })
            .catch((e) => {
                logger.info(`GeoJSON file not found for "${settings.EXPO}"`);
                store.mapboxStore.mapBoxEnabled = false;
            });
    });

    return useObserver(() => {
        return (
            <div>
                <div
                    ref={mapContainer}
                    className={classNames("map-container", {
                        hidden: !store.mapboxStore.showMapbox,
                    })}
                />
            </div>
        );
    });
}
