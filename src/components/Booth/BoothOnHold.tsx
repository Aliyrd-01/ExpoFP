import { t } from "../../utils/i18n";
import React, { FC } from "react";
import { RegularBooth } from "../../store/BoothStore";
import data from "../../data";
import Badge from "../Badge";
import { uiState } from "../../store";

interface BoothWithoutExhibitorProps {
    booth: RegularBooth;
    description: string;
    showBuy: boolean;
    showReserve: boolean;
    isRebooking: boolean;
}

export const BoothOnHold: FC<BoothWithoutExhibitorProps> = ({ booth }) => {
    return (
        <div className="booth__content -reg">
            <Badge variant="orange">
                <i className="icon-hand-solid"></i>
                {t("On Hold")}
            </Badge>
            <div className="booth__infos">
                {booth.type && (
                    <div className="booth__info is-onhold">
                        <div className="booth__info-icon">
                            <i className="icon-box-3d"></i>
                        </div>
                        <div className="booth__info-body">
                            <div className="booth__info-title">{t("{{boothTerm}} Type", { boothTerm: data.boothTerm })}</div>
                            <div className="booth__info-val">{booth.type}</div>
                        </div>
                    </div>
                )}
                {booth.size && (
                    <div className="booth__info is-onhold">
                        <div className="booth__info-icon">
                            <i className="icon-size" />
                        </div>
                        <div className="booth__info-body">
                            <div className="booth__info-title">{t("Size")}</div>
                            <div className="booth__info-val">{booth.size}</div>
                        </div>
                    </div>
                )}
                {booth.price && booth.price !== "0" && !uiState.previewMode && (
                    <div className="booth__info is-onhold">
                        <div className="booth__info-icon">
                            <i className="icon-tag" />
                        </div>
                        <div className="booth__info-body">
                            <div className="booth__info-title">{t("Price")}</div>
                            <div className="booth__info-val">{booth.price}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
