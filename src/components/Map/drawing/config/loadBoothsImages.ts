import store from "../../../../store";
import { DrawerContext } from "../Drawer1";
import { ImageUrls, loadImagesInBatchesById } from "../../../../utils/loadImagesInBatches";
import { Img, loadIcons } from "../../../../utils/imageloader";
import ImagePainter, { DrawerObjectEx } from "../painters/ImagePainter";
import type { Booth } from "../../../../store/BoothStore";
import { getLayerSvg } from "../../../../data/svg";
import isMobile from "../../../../utils/is-mobile";
import { select } from "d3";
import type { Layer } from "../../../../store/LayerStore";
import isWebview from "../../../../utils/is-webview";
import { getLogoUrl } from "../../../../utils/getLogoUrl";
import { BOOKMARK_PAINTER_MARKER, BOOTHS_PAINTER_MARKER, LAYER_ICONS_MARKER, LAYER_LOGOS_MARKER, SEPARATOR } from "../../../../constants";
import { areLayersEnabled } from "../../../../utils/areLayersEnabled";

const CHUNK_SIZE = isMobile || isWebview ? 8 : 512;
const magicNum = 8;

export async function loadBoothsImages(context: DrawerContext, chunkSize = CHUNK_SIZE): Promise<void> {
    await Promise.all(
        store.layerStore.layers.map(async (layer, i) => {
            const icons = getIcons(layer);
            const loadedIcons = await loadIcons(icons);

            const priority = calculateHighestPriority(
                layer.childLayers || [],
                (child) => child.basePriority,
                layer.basePriority
            ) + magicNum;

            const painter = context.requirePainter(
                genImageLayerId(layer.name, LAYER_ICONS_MARKER, i),
                ImagePainter,
                priority,
                layer.visible,
            );
            painter.dim = Number(store.uiState.dimmed);
            loadedIcons.filter(Boolean).forEach((img) => painter.addObject(createObject(img)));
        })
    );

    context.requireUpdate(null);

    if (store.uiState.hideLogoInBooth) return;

    const boothsLogosUrlsById = new Map(
        store.boothStore.booths
            .map((b) => {
                const exhibitor = b.rect && b.exhibitors.find((e) => e.logoInBooth && e.logo);
                return exhibitor ? [b.id, { preferred: getLogoUrl(exhibitor.logo), fallback: exhibitor.logo }] : null;
            })
            .filter(Boolean) as [number, ImageUrls][],
    );

    const chunks = Array.from({ length: Math.ceil(boothsLogosUrlsById.size / chunkSize) }, (_, i) =>
        new Map(Array.from(boothsLogosUrlsById).slice(i * chunkSize, (i + 1) * chunkSize))
    );

    const painterLayers = new Map<string, DrawerObjectEx[]>();
    const painterLayersPriorities = new Map<string, number>();

    const boothsPaintersById = new Map(
        context.allPainters
            .filter(p => p.id.includes(BOOTHS_PAINTER_MARKER) && !p.id.includes(BOOKMARK_PAINTER_MARKER))
            .map(p => [
                p.id.includes(SEPARATOR) ? p.id.split(SEPARATOR)[0] : p.id,
                p,
            ])
    );

    const highestPriority = Math.max(
        ...Array.from(
            boothsPaintersById.values(),
        ).map(x => x?.orderPriority),
    );

    for (const [i, chunk] of chunks.entries()) {
        const loaded = await loadImagesInBatchesById(chunk, chunkSize);

        for (const [boothId, image] of loaded) {
            const booth = store.boothStore.boothById.get(boothId);
            if (!booth) continue;

            const boothLayerName = booth.layer?.name;
            const layerName = genImageLayerId(boothLayerName, LAYER_LOGOS_MARKER, i);

            const priority = booth.layer?.childLayers
                ? calculateHighestPriority(
                    booth.layer.childLayers,
                    (layer) => boothsPaintersById.get(layer.name)?.orderPriority || 0,
                    boothsPaintersById.get(boothLayerName)?.orderPriority || 0
                )
                : boothsPaintersById.get(boothLayerName)?.orderPriority || 0;

            const orderPriority = (areLayersEnabled() ? priority : highestPriority) + magicNum;

            if (!painterLayers.has(layerName)) {
                painterLayers.set(layerName, []);
                painterLayersPriorities.set(layerName, orderPriority);
            }
            painterLayers.get(layerName).push(createObject(createImg(booth, image)));
        }

        const visibleLayerNames = new Set(store.layerStore.layers.filter((layer) => layer.visible).map((layer) => layer.name));
        painterLayers.forEach((objects, name) => {
            const painter = context.requirePainter(
                name,
                ImagePainter,
                painterLayersPriorities.get(name),
                areLayersEnabled() ? visibleLayerNames.has(name.split(SEPARATOR)[0]) : true,
            );
            painter.dim = Number(store.uiState.dimmed);
            objects.forEach((obj) => painter.addObject(obj));
        });

        context.requireUpdate(null);
    }
}

function genImageLayerId(baseLayerName: string, suffix: string, i: number): string {
    return `${areLayersEnabled() ? baseLayerName : BOOTHS_PAINTER_MARKER}${SEPARATOR}${suffix}${SEPARATOR}${i}`;
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
    const id = img.booth?.id?.toString() ?? `${x}${y}${width}${height}`;
    return {
        id,
        center: [x + width / 2, y + height / 2],
        deltas: [-width / 2, -height / 2, width / 2, height / 2],
        deltaPts: [0, 0, 0, 0],
        img: img.htmlImage,
        imgWidth: width,
        imgHeight: height,
        texPosition: "center",
        stretch: true,
        rotateRadians: angle ? (-angle * Math.PI) / 180.0 : null,
        skipdim: store.uiState.highlightedBooths.has(id),
    } as DrawerObjectEx;
}

function createImg(booth: Booth, htmlImage: HTMLImageElement): Img {
    const rect = booth.rect;
    const ratioBooth = rect.h ? rect.w / rect.h : 1;
    const ratio = htmlImage.height ? htmlImage.width / htmlImage.height : 1;
    let w, h, angle;

    const SCALE_FACTOR = 0.9;

    if (ratioBooth > ratio) {
        h = rect.h * SCALE_FACTOR;
        w = h * ratio;
    } else {
        w = rect.w * SCALE_FACTOR;
        h = w / ratio;
    }

    const rotate = booth.rotate || 0;
    if (ratio >= 2 && !rotate && rect.h >= rect.w * 2.0) {
        h = rect.w * SCALE_FACTOR;
        w = h * ratio;
        angle = -90;
    } else {
        angle = (-rotate * 180) / Math.PI;
    }

    // Width and height should not exceed the booth's width and height
    if (w > rect.w) {
        w = rect.w;
        h = w / ratio;
    }
    if (h > rect.h) {
        h = rect.h;
        w = h * ratio;
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

function calculateHighestPriority<T>(
    layers: T[],
    getPriority: (layer: T) => number,
    initialPriority: number = 0
): number {
    return layers.reduce((maxPriority, layer) => {
        const priority = getPriority(layer);
        return Math.max(maxPriority, priority);
    }, initialPriority);
}
