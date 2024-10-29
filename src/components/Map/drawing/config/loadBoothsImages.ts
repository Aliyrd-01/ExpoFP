import store from "../../../../store";
import { DrawerContext } from "../Drawer1";
import { loadImagesInBatchesById } from "../../../../utils/loadImagesInBatches";
import { Img, loadIcons } from "../../../../utils/imageloader";
import ImagePainter, { DrawerObjectEx as DrawerObject } from "../painters/ImagePainter";
import type { Booth } from "../../../../store/BoothStore";
import { getLayerSvg } from "../../../../data/svg";
import isMobile from "../../../../utils/is-mobile";
import { select } from "d3";
import type { Layer } from "../../../../store/LayerStore";
import isWebview from "../../../../utils/is-webview";

const CHUNK_SIZE = isMobile || isWebview ? 8 : 128;
const DELAY = isMobile || isWebview ? 8 : 4;
const SEPARATOR = ":";

export async function loadBoothsImages(context: DrawerContext, chunkSize = CHUNK_SIZE): Promise<void> {
    if (store.uiState.hideLogoInBooth) return;

    const boothsLogosUrlsById = new Map(
        store.boothStore.booths
            .map((b) => {
                const exhibitor = b.rect && b.exhibitors.find((e) => e.logoInBooth && e.logo);
                return exhibitor ? [b.id, exhibitor.logo] : null;
            })
            .filter(Boolean) as [number, string][],
    );

    const keys = Array.from(boothsLogosUrlsById.keys());
    const values = Array.from(boothsLogosUrlsById.values());
    const totalChunks = Math.ceil(boothsLogosUrlsById.size / chunkSize);

    let chunks = [];
    for (let i = 0; i < totalChunks; i++) {
        const chunk = new Map();
        for (let j = i * chunkSize; j < Math.min((i + 1) * chunkSize, keys.length); j++) {
            chunk.set(keys[j], values[j]);
        }
        chunks[i] = chunk;
    }

    const maxBasePriority = Math.max(...store.layerStore.layers.map((item) => item.basePriority));

    const visibleLayerNames = new Set(store.layerStore.layers.filter((layer) => layer.visible).map((layer) => layer.name));

    const painterLayers = new Map<string, DrawerObject[]>();
    const painterLayersPriorities = new Map<string, number>();

    const chunksEntries = chunks.entries();
    for (const [i, chunk] of chunksEntries) {
        const loaded = await loadImagesInBatchesById(chunk, chunkSize, DELAY);

        for (const [boothId, image] of loaded) {
            const booth = store.boothStore.boothById.get(boothId);
            if (!booth) continue;

            const layerName = genLayerId(booth.layer?.name, "logos", i);

            if (!painterLayers.has(layerName)) {
                painterLayers.set(layerName, []);
            }
            painterLayers.get(layerName).push(createObject(createImg(booth, image)));

            if (!painterLayersPriorities.has(layerName)) {
                painterLayersPriorities.set(
                    layerName,
                    areLayersEnabled() ? booth.layer?.basePriority + maxBasePriority : maxBasePriority,
                );
            }
        }

        painterLayers.forEach((objects, name) => {
            const end = name.indexOf(SEPARATOR);
            const layerName = name.slice(0, end);

            const painter = context.requirePainter(
                name,
                ImagePainter,
                painterLayersPriorities.get(name),
                areLayersEnabled() ? visibleLayerNames.has(layerName) : true,
            );

            objects.forEach((obj) => painter.addObject(obj));
        });

        context.requireUpdate(null);
    }

    const layersEntries = store.layerStore.layers.entries();
    for (const [i, layer] of layersEntries) {
        const icons = getIcons(layer);
        const loadedIcons = await loadIcons(icons);

        const painter = context.requirePainter(
            genLayerId(layer.name, "icons", i),
            ImagePainter,
            layer.basePriority + maxBasePriority,
            layer.visible,
        );

        loadedIcons.filter(Boolean).forEach((img) => painter.addObject(createObject(img)));

        context.requireUpdate(null);
    }
}

function genLayerId(baseLayerName: string, suffix: string, i: number): string {
    const defaultLayerName = "default";
    return `${areLayersEnabled() ? baseLayerName : defaultLayerName}${SEPARATOR}${suffix}${SEPARATOR}${i}`;
}

function areLayersEnabled() {
    return !!window["__fpLayers"];
}

function getIcons(layer: Layer): SVGImageElement[] {
    const selected = select(getLayerSvg(layer)).select(`[data-layer="${layer.name}"]`);
    return (
        window["__fpVersion"] > 5
            ? selected.selectAll(":scope > image, :scope > g:not([data-layer]) image").nodes()
            : selected.selectAll(":scope > g[data-is-editable='false'] image").nodes()
    ).filter(Boolean) as SVGImageElement[];
}

function createObject(img: Img): DrawerObject {
    const x = img.bounds.x;
    const y = img.bounds.y;
    const width = img.bounds.width;
    const height = img.bounds.height;
    const angle = img.bounds.angle;

    return {
        id: `${x}${y}${width}${height}`,
        center: [x + width / 2, y + height / 2],
        deltas: [-width / 2, -height / 2, width / 2, height / 2],
        deltaPts: [0, 0, 0, 0],
        img: img.htmlImage,
        imgWidth: width,
        imgHeight: height,
        texPosition: "center",
        stretch: true,
        rotateRadians: angle ? (-angle * Math.PI) / 180.0 : null,
    } as DrawerObject;
}

function createImg(booth: Booth, htmlImage: HTMLImageElement): Img {
    const rect = booth.rect;
    const ratioBooth = rect.w / rect.h;
    const ratio = htmlImage.width / htmlImage.height;
    let w = 0;
    let h = 0;
    let angle: number;

    if (ratioBooth > ratio) {
        h = rect.h * 0.9;
        w = h * ratio;
    } else {
        w = rect.w * 0.9;
        h = w / ratio;
    }

    if (ratio >= 2 && !booth.rotate && booth.rect.h >= booth.rect.w * 2.0) {
        let newH = rect.w * 0.9;
        let newW = newH * ratio;

        while (newW > rect.h - 2) {
            newH--;
            newW = newH * ratio;
        }

        h = newH;
        w = newW;
        angle = -90;
    } else {
        angle = (-booth.rotate * 180) / Math.PI;
    }

    const x = rect.cx - w / 2;
    const y = rect.cy - h / 2;

    return {
        name: booth.slug,
        bounds: { x, y, width: w, height: h, angle: angle },
        htmlImage,
        booth,
    };
}
