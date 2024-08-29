import React from "react";
import cn from "classnames";
import "./WayfindingFloorSelector.scss";

export interface WayfindingFloorSelectorProps {
    floors: { id: number; name: string }[];
    current?: { id: number; name: string };
    onClickFloor?: ({ id: number, name: string }) => void;
}

const WayfindingFloorSelector: React.FC<WayfindingFloorSelectorProps> = ({ floors, current, onClickFloor }) => {
    return (
        <div className="efp-wayfinding-floor">
            <div className="efp-wayfinding-floor__body">
                <div className="efp-wayfinding-floor__list">
                    {floors.map((floor, index) => (
                        <button
                            type="button"
                            className={cn({
                                isCurrent: floor?.id === current?.id,
                            })}
                            onClick={() => onClickFloor({ id: floor.id, name: floor.name })}
                            key={index}
                        >
                            <span>{floor.name}</span>
                        </button>
                    ))}
                </div>
                <div className="efp-wayfinding-floor__line"></div>
            </div>
        </div>
    );
};

export default WayfindingFloorSelector;
