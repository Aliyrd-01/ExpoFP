import React, { useMemo } from "react";
import { uiState } from "../store";
import useHeatmapData from "./useHeatmapData";
import { Exhibitor } from "../store/ExhibitorStore";
import { BoothBase } from "../store/BoothStore";
import { HeatmapYah } from "../store/HeatmapStore";

const hexToRgb = (hex: string) => {
    if (hex.length === 4) {
        hex = hex.replace(/^#([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);
    }
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
};

const useHeatmapOverlay = (entity: Exhibitor | BoothBase | HeatmapYah) => {
    const { clicks, background } = useHeatmapData(entity);

    const heatmapBar = useMemo(() => {
        if (!uiState.heatmap) return null;

        const cleanBackground = background.trim().toLowerCase();
        let r = 255,
            g = 255,
            b = 255;

        if (cleanBackground.startsWith("#") && (cleanBackground.length === 7 || cleanBackground.length === 4)) {
            const rgb = hexToRgb(cleanBackground);
            r = rgb.r;
            g = rgb.g;
            b = rgb.b;
        }

        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const textColor = luminance < 170 ? "#fff" : "#000";
        const textShadowColor = textColor === "#fff" ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.4)";

        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    alignSelf: "flex-start",
                    gap: "0.2rem",
                    minHeight: "2rem",
                    margin: "0.75rem 0 0 0.5rem",
                    padding: "0.2rem 0.7rem",
                    borderRadius: "var(--border-radius-md)",
                    background,
                    color: textColor,
                    textShadow: `0 0 2px ${textShadowColor}`,
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--font-size-lg)",
                    textAlign: "center",
                }}
            >
                <i
                    className="icon-eye"
                    style={{
                        fontSize: "var(--icon-size-xs)",
                        textShadow: `0 0 2px ${textShadowColor}`,
                    }}
                />
                {clicks}
            </div>
        );
    }, [background, clicks]);

    return { heatmapBar };
};

export default useHeatmapOverlay;
