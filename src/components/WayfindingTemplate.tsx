import React from "react";
import { t } from "../utils/i18n";
import Autocomplete, { OptionObject } from "./Autocomplete";
import ToggleSwitch from "./ToggleSwitch";
import WayfindingFloorSelector from "./WayfindingFloorSelector";
import "./WayfindingTemplate.scss";
import WayInformation, { WayInformationItem } from "./WayInformation";

export interface WayfindingTemplateProps {
    options: string[] | (OptionObject | any)[];
    fromValue?: string;
    toValue?: string;
    showForm?: boolean;
    showInfo?: boolean;
    showAccessible?: boolean;
    onlyAccessible?: boolean;
    routeFound?: boolean;
    infoItems?: WayInformationItem[];
    infoAccessible?: boolean;
    floors?: { id: number, name: string }[];
    currentFloor?: { id: number, name: string };
    onChangeFrom?: (val: string) => void;
    onChangeTo?: (val: string) => void;
    onSwitch?: () => void;
    onClickInfo?: () => void;
    onClickFloor?: ({ id: number, name: string }) => void;
    onAccessibleCheck: (checked: boolean) => void;
}

const WayfindingTemplate: React.FC<WayfindingTemplateProps> = ({
    options = [],
    fromValue = "",
    toValue = "",
    showForm = true,
    showAccessible = false,
    showInfo = false,
    routeFound = false,
    infoItems = [],
    infoAccessible,
    floors,
    currentFloor,
    onChangeFrom,
    onChangeTo,
    onSwitch,
    onClickInfo,
    onClickFloor,
    onAccessibleCheck,
}) => {
    return (
        <div className="efp-wayfinding">
            {showForm && (
                <div className="efp-wayfinding__top">
                    <div className="efp-wayfindingForm">
                        <div className="efp-wayfindingForm__icons">
                            <div className="efp-wayfindingForm__icons-item is-from"></div>
                            <div className="efp-wayfindingForm__icons-item is-to"></div>
                        </div>
                        <div className="efp-wayfindingForm__controls">
                            <div style={{ marginBottom: 10 }}>
                                <Autocomplete
                                    placeholder={t("Choose starting point")}
                                    options={options}
                                    value={fromValue}
                                    onChange={onChangeFrom}
                                />
                            </div>
                            <div>
                                <Autocomplete
                                    placeholder={t("Choose destination point")}
                                    options={options}
                                    value={toValue}
                                    onChange={onChangeTo}
                                />
                            </div>
                        </div>
                        <button type="button" className="efp-wayfindingForm__switch" onClick={onSwitch}></button>
                    </div>
                    {showAccessible && (
                        <div className="formGroup" style={{ marginInlineStart: 20, marginBottom: 20 }}>
                            <ToggleSwitch
                                name="onlyAccessible"
                                label="Accessible"
                                value={infoAccessible}
                                onChange={(value) => onAccessibleCheck(value)}
                            />
                        </div>
                    )}
                    {floors.length > 1 && (
                        <WayfindingFloorSelector floors={floors} current={currentFloor} onClickFloor={onClickFloor} />
                    )}
                </div>
            )}
            {showInfo && (
                <div className="efp-wayfindingInfo">
                    {routeFound ? (
                        <WayInformation items={infoItems} accessible={infoAccessible} onClick={onClickInfo} />
                    ) : (
                        <div className="efp-wayfindingError">Route not found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WayfindingTemplate;
