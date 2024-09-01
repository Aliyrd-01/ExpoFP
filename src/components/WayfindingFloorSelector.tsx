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
                            {floor?.id === current?.id && (
                                <div className="item-walk">
                                    <svg width="9" height="14" viewBox="0 0 9 14" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.12892 9.36073L4.2433 10.4751L3.28025 13.0753C3.17019 13.3642 2.89504 13.5431 2.60612 13.5431C2.52358 13.5431 2.44103 13.5293 2.35848 13.5018C1.98702 13.3642 1.79441 12.9515 1.93199 12.5801L3.12892 9.36073Z" />
                                        <path d="M1.05149 6.51287L1.71187 5.24715C1.89072 4.91697 2.15212 4.64181 2.46855 4.4492C3.99566 3.54119 4.18827 3.55494 4.38088 3.5687L5.41272 3.63749C5.72914 3.65125 5.94927 3.7338 7.00862 5.28843C7.04989 5.34346 7.10492 5.38473 7.18747 5.39849L8.45319 5.5911C8.79713 5.64613 9.03102 5.96256 8.97599 6.3065C8.92095 6.65045 8.60453 6.88433 8.26058 6.8293L6.99486 6.63669C6.58213 6.5679 6.21067 6.34778 5.97679 6.00383C5.92175 5.92129 5.88048 5.8525 5.82545 5.78371L5.01374 8.35642L6.14188 9.48456C6.30697 9.64965 6.44455 9.86977 6.5271 10.0899L7.39384 12.6213C7.53142 12.9928 7.32505 13.4055 6.95359 13.5293C6.87104 13.5569 6.80225 13.5706 6.71971 13.5706C6.41703 13.5706 6.14188 13.378 6.03182 13.0891L5.16507 10.5577C5.15132 10.5301 5.13756 10.5164 5.1238 10.4889L3.11516 8.46648C2.82625 8.17757 2.71619 7.77859 2.79873 7.39337L3.23898 5.43976C3.19771 5.46728 3.15644 5.49479 3.1014 5.52231C2.97758 5.5911 2.88128 5.70116 2.81249 5.82498L2.15212 7.0907C2.04205 7.29707 1.82193 7.42089 1.6018 7.42089C1.5055 7.42089 1.4092 7.39337 1.31289 7.3521C1.01022 7.187 0.900156 6.81554 1.05149 6.51287Z" />
                                        <path d="M6.48998 2.02013C6.57301 1.25723 6.02188 0.571475 5.25898 0.48844C4.49609 0.405405 3.81033 0.956539 3.7273 1.71943C3.64426 2.48232 4.19539 3.16808 4.95829 3.25112C5.72118 3.33415 6.40694 2.78302 6.48998 2.02013Z" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="efp-wayfinding-floor__line"></div>
            </div>
        </div>
    );
};

export default WayfindingFloorSelector;
