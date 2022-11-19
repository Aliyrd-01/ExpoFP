import classNames from "classnames";
import mapboxgl, { Map } from "mapbox-gl";
import { useLocalStore, useObserver } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { svgArea } from "../../data/svg";
import store, { uiState } from "../../store";
import { useReaction } from "../../utils/mobx";
import "./Mapbox.scss";
import * as React from "react";

import {
    props,
    setBoothsLayers,
    setDataSource,
    setMarker,
    setVenuesLayer,
    updateSelectionDataSource,
    updateRouteLines,
    updateHoverDataSource,
} from "./utils/data";

export default function Mapbox() {
    const mapContainer = useRef(null);
    let map: Map;

    useEffect(() => {
        var { cx: lng, cy: lat } = props.viewbox;

        map = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/mapbox/${props.style}`,
            center: [lng, lat],
            zoom: 16,
            bearing: 30,
            pitch: 30,
            maxPitch: 70,
            bearingSnap: 0,
            accessToken: props.token,
        });

        map.on("load", async () => {
            setTimeout(() => flyToCenter(0, 4000, 0, 50), 1000);

            setDataSource(map, store.boothStore.booths);
            setMarker(
                map,
                "yah",
                store.routeStore.defaultFrom
                    ? { x: store.routeStore.defaultFrom.rect.cx, y: store.routeStore.defaultFrom.rect.cy }
                    : null
            );

            const boothsLayers = setBoothsLayers(map, store.layerStore.layers);
            setVenuesLayer(map);

            map.on("mouseenter", boothsLayers, () => (map.getCanvas().style.cursor = "pointer"));

            map.on("mouseleave", boothsLayers, () => (map.getCanvas().style.cursor = ""));

            map.on("click", (e) => {
                const bbox = [
                    [e.point.x - 5, e.point.y - 5],
                    [e.point.x + 5, e.point.y + 5],
                ] as any;

                const selectedFeature = map.queryRenderedFeatures(bbox, {
                    layers: boothsLayers,
                })[0];

                const booth = store.boothStore.booths.find((b) => b.name === selectedFeature?.properties?.id);
                store.clickBooth(booth);
            });
        });
    });

    // ZoomBy
    useReaction(
        () => uiState.zoomBy,
        () => {
            if (!uiState.zoomBy || !store.mapboxStore.mapBoxSelected) return;
            const z = uiState.zoomBy;
            uiState.zoomBy = null;
            map.flyTo({
                zoom: map.getZoom() + (z > 1 ? 0.5 : -0.5),
                animate: true,
                duration: 500,
                essential: true,
            });
        }
    );

    //Layer visible
    useReaction(
        () => store.layerStore.visible,
        () => {
            // Update layers visibility
            store.layerStore.layers.forEach((layer) => {
                var exists = map.getLayer(layer.name);

                if (exists) {
                    if (exists && layer.visible ? "visible" : "none" !== map.getLayoutProperty(layer.name, "visibility")) {
                        map.setLayoutProperty(layer.name, "visibility", layer.visible ? "visible" : "none");
                    }
                }
            });

            // Update YAH marker visibility
            setMarker(
                map,
                "yah",
                store.routeStore.defaultFrom
                    ? { x: store.routeStore.defaultFrom.rect.cx, y: store.routeStore.defaultFrom.rect.cy }
                    : null
            );
        }
    );

    // Hover
    let hoverTimeout = null;
    useReaction(
        () => uiState.hoveredBooths,
        () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }

            hoverTimeout = setTimeout(() => {
                hoverTimeout = null;
                updateHoverDataSource(
                    map,
                    [...uiState.hoveredBooths].filter((b) => b.layer?.visible ?? true),
                    store.boothStore.booths
                );
            }, 50);
        }
    );

    // Selection
    useReaction(
        () => uiState.selectedBooths,
        () => updateSelectionDataSource(map, [...uiState.selectedBooths], store.boothStore.booths)
    );

    // View switching
    useReaction(
        () => store.mapboxStore.mapBoxSelected,
        () => {
            if (store.mapboxStore.mapBoxSelected === null) switchViewbox(true);
        }
    );

    // Routing
    useReaction(
        () => store.routeStore.routeLines,
        () => updateRouteLines(map, store.routeStore)
    );

    function flyToCenter(bearing: number, duration: number, boundsOffset: number = 0, pitch: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), duration);
            let rect = props.viewbox;

            map.fitBounds(
                [
                    [rect.x1 - boundsOffset, rect.y1 - boundsOffset],
                    [rect.x2 + boundsOffset, rect.y2 + boundsOffset],
                ],
                {
                    bearing,
                    essential: true,
                    duration,
                    pitch: pitch,
                }
            );
        });
    }

    function switchViewbox(mapBoxSelected: boolean) {
        let duration = 1200;

        store.mapboxStore.mapBoxSelected = mapBoxSelected;

        map.scrollZoom.disable();
        map.touchPitch.disable();
        map.touchZoomRotate.disable();

        setTimeout(() => {
            map.scrollZoom.enable();
            map.touchPitch.enable();
            map.touchZoomRotate.enable();
        }, duration);

        if (mapBoxSelected) {
            flyToCenter(0, duration, 0, 45).then(() => {
                uiState.moveToRect = store.layerStore.rectangle || svgArea;
            });
        } else {
            uiState.moveToRect = store.layerStore.rectangle || svgArea;
            flyToCenter(props.bearing, duration, 0, 0).then(() => {
                map.setZoom(props.edgeZoom - 0.5);
            });
        }
    }

    const s = useLocalStore(() => ({
        get style() {
            return {
                left: uiState.overlayPosition !== "left" || uiState.kiosk ? 0 : uiState.mapVisibleLeft + "px",
            };
        },
    }));

    return useObserver(() => {
        return (
            <div
                ref={mapContainer}
                style={s.style}
                className={classNames("map-container", {
                    hidden: !store.mapboxStore.showMapbox,
                })}
            />
        );
    });
}
