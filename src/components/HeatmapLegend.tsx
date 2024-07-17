import React, { useMemo } from "react";
import "./HeatmapLegend.scss";
import { getColorFromGradient } from "../tools/Color";
import classNames from "classnames";

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
};

const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ colors, min, max, className, style }) => {
    const numValues = 5;

    const values = useMemo(() => {
        return Array.from({ length: numValues }, (_, index) => {
            const normalizedValue = index / (numValues - 1);
            const scaledValue = Math.pow(normalizedValue, 2);
            const value = min + (max - min) * scaledValue;
            return round(value);
        });
    }, [min, max, numValues]);

    const interpolatedColors = useMemo(() => {
        return values.map(value => getColorFromGradient(value, min, max));
    }, [values, min, max]);

    return (
        <div className={classNames("heatmap-legend", className)} style={style}>
            <div className="heatmap-legend__colors" style={{
                background: `linear-gradient(to right, ${interpolatedColors.join(", ")})`
            }} />
            <div className="heatmap-legend__values">
                {values.map((value, index) => (
                    <div key={index} className="heatmap-legend__value">{value}</div>
                ))}
            </div>
        </div>
    );
};

export default HeatmapLegend;