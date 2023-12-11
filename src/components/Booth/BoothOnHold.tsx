import { t } from "../../utils/i18n";
import React, { FC } from "react";
import { RegularBooth } from "../../store/BoothStore";
import data from "../../data";

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
            <div className="booth__infos">
                {booth.type && (
                    <div className="booth__info">
                        <i className="fas fa-cube" />
                        <div className="booth__info-title">{t("{{boothTerm}} Type", { boothTerm: data.boothTerm })}</div>
                        <div className="booth__info-val">{booth.type}</div>
                    </div>
                )}
                {booth.size && (
                    <div className="booth__info">
                        <i className="fas fa-expand-alt" />
                        <div className="booth__info-title">{t("Size")}</div>
                        <div className="booth__info-val">{booth.size}</div>
                    </div>
                )}
                {booth.price && booth.price !== "0" && (
                    <div className="booth__info">
                        <i className="fas fa-tag" />
                        <div className="booth__info-title">{t("Price")}</div>
                        <div className="booth__info-val">{booth.price}</div>
                    </div>
                )}
            </div>
            <div className="booth__content -spec">{t("On Hold")}</div>
        </div>
    );
};
