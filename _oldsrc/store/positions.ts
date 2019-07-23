import { remsToPixels } from "@/components/Map/utils";

// TODO: create separate devicePixelRatio item

export default {
    state: {

    },
    getters: {
        // overlay
        overlayPosition: (s, g, r) => {
            const screen = r.screenSize;
            if (!screen || screen.width > 550) return "left";
            return "bottom";
        },
        overlayBottom: (s, g, r) => g.overlayPosition === "bottom",
        overlayLeft: (s, g, r) => g.overlayPosition === "left",
        overlayWidthPx: (s, g, r) => {
            return g.overlayLeft ? remsToPixels(23.5) : remsToPixels(r.screenSize.width);
        },
        // ws
        wsWidthPx: (s, g, r) => {
            return g.overlayLeft ? r.screenSize.width - g.overlayWidthPx : r.screenSize.width;
        },
        wsImageHeightPx: (s, g, r, rg) => {
            return remsToPixels(3);
        },
        wsPaddingPx: (s, g, r) => {
            return remsToPixels(0.3);
        },
        wsOccupiedHeightPx: (s, g, r) => {
            return g.wsShown ? g.wsImageHeightPx + g.wsPaddingPx * 2 : 0;
        },
        wsShown: (s, g, r, rg) => {
            return rg.advertisedExhibitors.length > 0;
        },
        wsDesktopPosition: () => EFP_EXPO === "cbresupplypartner" ? "bottom" : "top",
        wsPosition: (s, g, r) => g.overlayBottom ? "top" : g.wsDesktopPosition,
        // map
        mapVisibleTop: (s, g, r) => g.wsPosition === "top" ? g.wsOccupiedHeightPx : 0,
        mapVisibleBottom: (s, g, r) => {
            if (g.overlayLeft) {
                return g.wsPosition === "bottom" ? g.wsOccupiedHeightPx : 0;
            }
            return remsToPixels(r.overlayMediumHeightRems);
        },
        mapVisibleLeft: (s, g, r) => g.overlayLeft ? g.overlayWidthPx : 0,    }
};


