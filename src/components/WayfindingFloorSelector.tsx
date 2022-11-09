import React from "react";
import cn from "classnames";
import "./WayfindingFloorSelector.scss";

export interface WayfindingFloorSelectorProps {
    floors: number[];
    current?: number;
    onClickFloor?: (val: number) => void;
}

const WayfindingFloorSelector: React.FC<WayfindingFloorSelectorProps> = ({ floors, current = 1, onClickFloor }) => {
    return (
        <div className="efp-wayfinding-floor">
            <div className="efp-wayfinding-floor__title">Floor</div>
            <div className="efp-wayfinding-floor__list">
                {floors.map((floor, index) => (
                    <button
                        type="button"
                        className={cn({ isCurrent: floor === current })}
                        onClick={() => onClickFloor(floor)}
                        key={index}
                    >
                        {floor}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WayfindingFloorSelector;
