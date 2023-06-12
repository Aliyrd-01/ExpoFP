import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import Rect from "../../core/Rect";
import store, { boothStore, uiState } from "../../store";
import { CurrentPosition } from "../../store/RouteStore";
import { useReaction } from "../../utils/mobx";
import "../Mapbox/Mapbox.scss";
import { switchViewbox } from "../Mapbox/utils/data";

import UIManager from "./uimanager";

export default function ThreeComponent({ isMapbox, expo }: { isMapbox: boolean; expo: string }) {
    const mapContainer = useRef(null);

    useEffect(() => {
        let manager = new UIManager(expo, isMapbox, mapContainer.current);
        manager.init();
    }, []);

    const ls = useLocalStore(() => ({
        get initselected() {
            return ![...uiState.selectedBooths].filter((b) => b.rect);
        },

        get actualCurrentPosition(): CurrentPosition {
            const cp = store.routeStore.currentPosition;

            return !cp?.z || store.layerStore.visible.indexOf(store.layerStore.layers.find((l) => l.name === cp.z)) > -1
                ? cp
                : null;
        },

        get style() {
            return {
                left: uiState.overlayPosition !== "left" || uiState.kiosk ? 0 : uiState.mapVisibleLeft + "px",
            };
        },
    }));

    // ZoomBy
    useReaction(
        () => uiState.zoomBy,
        () => {
            if (!uiState.zoomBy || !store.mapboxStore.showMapbox) return;
            const z = uiState.zoomBy;
            uiState.zoomBy = null;
            map.current.flyTo({
                zoom: map.current.getZoom() + (z > 1 ? 0.5 : -0.5),
                animate: true,
                duration: 500,
                essential: true,
            });
        }
    );

    // Update layers visibility, loading, selected route
    useReaction(
        () => [store.layerStore.loaded, store.layerStore.visible, uiState.selectedRoute],
        () => {
            activeLayers.forEach((l: string) => {
                const layerName = l.split("-")[0];
                const layer = store.layerStore.layers.find((l) => l.name === layerName);

                if (layer.visible ? "visible" : "none" !== map.current.getLayoutProperty(l, "visibility"))
                    map.current.setLayoutProperty(l, "visibility", layer.visible ? "visible" : "none");
            });

            updateSelectionDataSource([...uiState.selectedBooths], store.boothStore.booths);

            // Update YAH marker visibility
            setMarker(
                "yah",
                store.routeStore.defaultFrom?.rect && store.routeStore.defaultFrom?.layer?.visible
                    ? { x: store.routeStore.defaultFrom.rect.cx, y: store.routeStore.defaultFrom.rect.cy }
                    : null
            );

            setMarker("cp", ls.actualCurrentPosition);
        }
    );

    // Hover booths
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
                    [...uiState.hoveredBooths].filter((b) => b.layer?.visible ?? true),
                    store.boothStore.booths
                );
            }, 50);
        }
    );

    // Selection & listed
    useReaction(
        () => [uiState.selectedBooths, uiState.listBooths],
        () => {
            var selected = [];
            if (uiState.selectedBooths.size) selected = [...uiState.selectedBooths];
            else if (
                uiState.listBooths.size &&
                (uiState.activeListIndex === 0 || uiState.list.type === "bookmarks" || uiState.list.type === "category")
            ) {
                selected = [...uiState.listBooths];
            }

            updateSelectionDataSource(selected, store.boothStore.booths);
        }
    );

    // View switching
    useReaction(
        () => store.mapboxStore.showMapbox,
        () => {
            switchViewbox(store.mapboxStore.showMapbox);
        }
    );

    // Move to booths
    useReaction(
        () => uiState.moveToBooths,
        () => {
            if (!uiState.moveToBooths || !store.mapboxStore.showMapbox) return;

            const rects = uiState.moveToBooths.filter((b) => b.rect).map((b) => b.rect);
            const rect = Rect.fromMultiple(rects);
            if (rects.length) moveToRect(rect);
            uiState.moveToBooths = null;
        }
    );

    // Move to rect
    useReaction(
        () => uiState.moveToRect,
        () => {
            if (!uiState.moveToRect || !store.mapboxStore.showMapbox) return;
            moveToRect(uiState.moveToRect, 15);
            uiState.moveToRect = null;
        }
    );

    // Move to Location
    useReaction(
        () => uiState.moveToLocation,
        () => {
            if (!uiState.moveToLocation || !store.mapboxStore.showMapbox) return;
            moveToLocation();
        }
    );

    // Move to center
    useReaction(
        () => uiState.centerMap,
        () => {
            if (!uiState.centerMap || !store.mapboxStore.showMapbox) return;
            moveToRect(Rect.fromMultiple(boothStore.booths.map((b) => b.rect)), 15);
            uiState.centerMap = false;
        }
    );

    // Route lines
    useReaction(
        () => store.routeStore.routeLines,
        () => updateRouteLines(store.routeStore)
    );

    // Current position
    useReaction(
        () => ls.actualCurrentPosition,
        () => setMarker("cp", ls.actualCurrentPosition)
    );

    return useObserver(() => {
        return (
            <div
                style={ls.style}
                className={classNames("map-container", {
                    hidden: !store.mapboxStore.showMapbox,
                })}
            >
                <div ref={mapContainer} className={classNames("map-wrapper", "mapboxgl-map")} />
            </div>
        );
    });
}
