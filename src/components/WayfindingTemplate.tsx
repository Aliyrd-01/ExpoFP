import React from "react";
import classNames from "classnames";
import { t } from "../utils/i18n";
import Autocomplete, { OptionObject } from "./Autocomplete";
import ToggleSwitch from "./ToggleSwitch";
import WayfindingFloorSelector from "./WayfindingFloorSelector";
import "./WayfindingTemplate.scss";
import WayInformation, { WayInformationItem } from "./WayInformation";
import RouteQR from "./RouteQR";

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
    floors?: { id: number; name: string }[];
    currentFloor?: { id: number; name: string };
    routeUrl?: string;
    isKiosk?: boolean;
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
    routeUrl,
    isKiosk,
    onChangeFrom,
    onChangeTo,
    onSwitch,
    onClickInfo,
    onClickFloor,
    onAccessibleCheck,
}) => {
    return (
        <div className={classNames("efp-wayfinding", { isCollapsed: !showForm })}>
            {showForm && (
                <div className="efp-wayfinding__top">
                    <div className="efp-wayfindingForm">
                        <div className="efp-wayfindingForm__icons">
                            <div className="efp-wayfindingForm__from">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9Z"
                                        fill="white"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M9 13.375C11.4162 13.375 13.375 11.4162 13.375 9C13.375 6.58375 11.4162 4.625 9 4.625C6.58375 4.625 4.625 6.58375 4.625 9C4.625 11.4162 6.58375 13.375 9 13.375ZM9 16C12.866 16 16 12.866 16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16Z"
                                        fill="#30AFEB"
                                    />
                                </svg>
                            </div>
                            <div className="efp-wayfindingForm__to">
                                <svg width="18" height="25" viewBox="0 0 18 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M9 24.1571L10.5475 22.267C11.0023 21.7114 11.4571 21.1656 11.9041 20.6291C13.2939 18.9611 14.6088 17.3829 15.6182 15.8814C16.988 13.8436 18 11.668 18 9.125C18 4.09562 14.0267 0 9 0C3.97332 0 0 4.09562 0 9.125C0 11.668 1.01202 13.8436 2.38182 15.8814C3.39116 17.3829 4.70613 18.9611 6.09588 20.6291C6.54291 21.1656 6.99767 21.7114 7.45249 22.267L9 24.1571Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M9 2C5.11111 2 2 5.16667 2 9.125C2 13.0833 5.11111 16.25 9 21C12.8889 16.25 16 13.0833 16 9.125C16 5.16667 12.8889 2 9 2ZM9 6.75C10.2911 6.75 11.3333 7.81083 11.3333 9.125C11.3333 10.4392 10.2911 11.5 9 11.5C7.70889 11.5 6.66667 10.4392 6.66667 9.125C6.66667 7.81083 7.70889 6.75 9 6.75Z"
                                        fill="#FF9E2C"
                                    />
                                </svg>
                            </div>
                            <div className="efp-wayfindingForm__dots">
                                <svg width="4" height="18" viewBox="0 0 4 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="2" cy="2" r="2" fill="#DCDFE9" />
                                    <circle cx="2" cy="16" r="2" fill="#DCDFE9" />
                                </svg>
                            </div>
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
                </div>
            )}
            {floors.length > 1 && <WayfindingFloorSelector floors={floors} current={currentFloor} onClickFloor={onClickFloor} />}
            {showInfo && (
                <div className="efp-wayfindingInfo">
                    {routeFound ? (
                        <>
                            <WayInformation items={infoItems} accessible={infoAccessible} onClick={onClickInfo} />
                            {isKiosk && <RouteQR url={routeUrl} />}
                        </>
                    ) : (
                        <div className="efp-wayfindingError">{t("Route not found")}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WayfindingTemplate;
