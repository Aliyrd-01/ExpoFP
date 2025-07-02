import React, { useMemo } from "react";
import classNames from "classnames";

import { getColorFromGradient } from "../tools/Color";

import "./HeatmapLegend.scss";

interface HeatmapLegendProps {
    colors: string[];
    min: number;
    max: number;
    className?: string;
    style?: React.CSSProperties;
}

function round(value: number) {
    if (value < 10) {
        return Math.round(value);
    } else if (value < 100) {
        return Math.round(value / 10) * 10;
    } else if (value < 1000) {
        return Math.round(value / 50) * 50;
    } else {
        return Math.round(value / 100) * 100;
    }
}

const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ colors, min, max, className, style }) => {
    const numValues = useMemo(() => {
        const range = max - min;
        // Always show at least two values
        if (range <= 0) return 2;
        return Math.min(range + 1, 5);
    }, [min, max]);

    const values = useMemo(() => {
        return Array.from({ length: numValues }, (_, index) => {
            const normalizedValue = index / (numValues - 1);
            const value = Math.round(min + (max - min) * normalizedValue);
            return value;
        });
    }, [min, max, numValues]);

    const interpolatedColors = useMemo(() => {
        return values.map((value) => getColorFromGradient(value, min, max));
    }, [values, min, max]);

    return (
        <div className={classNames("heatmap-legend", className)} style={style} role="img" aria-label="Heatmap intensity scale">
            <div
                className="heatmap-legend__colors"
                style={{
                    background: `linear-gradient(to right, ${interpolatedColors.join(", ")})`,
                }}
                aria-hidden="true"
            />
            <div className="heatmap-legend__values">
                {values.map((value, index) => (
                    <span key={index} className="heatmap-legend__value" aria-hidden="true">
                        {value}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default HeatmapLegend;
