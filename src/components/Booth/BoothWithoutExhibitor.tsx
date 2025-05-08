import { RegularBooth } from "../../store/BoothStore";
import { t } from "../../utils/i18n";
import data from "../../data";
import Button from "../Button";
import isIframe from "../../utils/is-iframe";
import React, { FC } from "react";
import { uiState } from "../../store";

interface BoothWithoutExhibitorProps {
    booth: RegularBooth;
    description: string;
    showBuy: boolean;
    showReserve: boolean;
    isRebooking: boolean;
}

export const BoothWithoutExhibitor: FC<BoothWithoutExhibitorProps> = ({
    booth,
    description,
    showBuy,
    showReserve,
    isRebooking,
}) => {
    const makeUrl = (href) => {
        if (href) {
            const url = new URL(href);

            if (!url.searchParams.has("type") && booth.type) {
                url.searchParams.append("type", booth.type);
            }

            if (!url.searchParams.has("price") && booth.price && !uiState.previewMode) {
                url.searchParams.append("price", booth.price);
            }
            return url;
        } else {
            return null;
        }
    };

    const buyUrl = makeUrl(booth.buyUrl);
    const reserveUrl = makeUrl(booth.reserveUrl);

    return (
        <div className="booth__content -reg">
            <div className="booth__infos">
                {booth.type && (
                    <div className="booth__info">
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
                    <div className="booth__info">
                        <div className="booth__info-icon">
                            <i className="icon-size" />
                        </div>
                        <div className="booth__info-body">
                            <div className="booth__info-title">{t("Size")}</div>
                            <div className="booth__info-val">{booth.size}</div>
                        </div>
                    </div>
                )}
                {!isRebooking && booth.price && booth.price !== "0" && !uiState.previewMode && (
                    <div className="booth__info">
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
            {!isRebooking && description && (
                <span dangerouslySetInnerHTML={{ __html: description }} className="booth__reserve-instructions" />
            )}
            <div className="booth__buy">
                {!isRebooking && showBuy && (
                    <Button link={buyUrl?.href} target={isIframe ? "_blank" : "_self"}>
                        {t("Buy")}
                    </Button>
                )}
                {!isRebooking && showReserve && (
                    <Button link={reserveUrl?.href || buyUrl?.href} target={isIframe ? "_blank" : "_self"}>
                        {t("Reserve")}
                    </Button>
                )}
            </div>
        </div>
    );
};
