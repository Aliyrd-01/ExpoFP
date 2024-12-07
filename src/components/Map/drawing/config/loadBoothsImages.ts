import store from "../../../../store";
import { DrawerContext } from "../Drawer1";
import { loadImagesInBatchesById } from "../../../../utils/loadImagesInBatches";
import { Img, loadIcons } from "../../../../utils/imageloader";
import ImagePainter, { DrawerObjectEx } from "../painters/ImagePainter";
import type { Booth } from "../../../../store/BoothStore";
import { getLayerSvg } from "../../../../data/svg";
import isMobile from "../../../../utils/is-mobile";
import { select } from "d3";
import type { Layer } from "../../../../store/LayerStore";
import isWebview from "../../../../utils/is-webview";

const CHUNK_SIZE = isMobile || isWebview ? 8 : 512;
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

    const chunks = Array.from({ length: Math.ceil(boothsLogosUrlsById.size / chunkSize) }, (_, i) =>
        new Map(Array.from(boothsLogosUrlsById).slice(i * chunkSize, (i + 1) * chunkSize))
    );

    const maxBasePriority = Math.max(...store.layerStore.layers.map((item) => item.basePriority));
    const visibleLayerNames = new Set(store.layerStore.layers.filter((layer) => layer.visible).map((layer) => layer.name));

    const painterLayers = new Map<string, DrawerObjectEx[]>();
    const painterLayersPriorities = new Map<string, number>();

    for (const [i, chunk] of chunks.entries()) {
        const loaded = await loadImagesInBatchesById(chunk, chunkSize);

        for (const [boothId, image] of loaded) {
            const booth = store.boothStore.boothById.get(boothId);
            if (!booth) continue;

            const layerName = genLayerId(booth.layer?.name, "logos", i);

            if (!painterLayers.has(layerName)) {
                painterLayers.set(layerName, []);
                painterLayersPriorities.set(
                    layerName,
                    areLayersEnabled() ? booth.layer?.basePriority + maxBasePriority : maxBasePriority,
                );
            }
            painterLayers.get(layerName).push(createObject(createImg(booth, image)));
        }

        painterLayers.forEach((objects, name) => {
            const painter = context.requirePainter(
                name,
                ImagePainter,
                painterLayersPriorities.get(name),
                areLayersEnabled() ? visibleLayerNames.has(name.split(SEPARATOR)[0]) : true,
            );

            objects.forEach((obj) => painter.addObject(obj));
        });

        context.requireUpdate(null);
    }

    await Promise.all(
        store.layerStore.layers.map(async (layer, i) => {
            const icons = getIcons(layer);
            const loadedIcons = await loadIcons(icons);

            const painter = context.requirePainter(
                genLayerId(layer.name, "icons", i),
                ImagePainter,
                layer.basePriority + maxBasePriority,
                layer.visible,
            );

            loadedIcons.filter(Boolean).forEach((img) => painter.addObject(createObject(img)));
        })
    );

    context.requireUpdate(null);
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

function createObject(img: Img): DrawerObjectEx {
    const { x, y, width, height, angle } = img.bounds;

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
    } as DrawerObjectEx;
}

function createImg(booth: Booth, htmlImage: HTMLImageElement): Img {
    const rect = booth.rect;
    const ratioBooth = rect.w / rect.h;
    const ratio = htmlImage.width / htmlImage.height;
    let w, h, angle;

    if (ratioBooth > ratio) {
        h = rect.h * 0.9;
        w = h * ratio;
    } else {
        w = rect.w * 0.9;
        h = w / ratio;
    }

    if (ratio >= 2 && !booth.rotate && rect.h >= rect.w * 2.0) {
        h = rect.w * 0.9;
        w = h * ratio;
        angle = -90;
    } else {
        angle = (-booth.rotate * 180) / Math.PI;
    }

    const x = rect.cx - w / 2;
    const y = rect.cy - h / 2;

    return {
        name: booth.slug,
        bounds: { x, y, width: w, height: h, angle },
        htmlImage,
        booth,
    };
}
