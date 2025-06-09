import React from "react";
import QRCode from "react-qr-code";
import { t } from "../utils/i18n";
import "./RouteQR.scss";

export interface RouteQRProps {
    url?: string;
}

const RouteQR: React.FC<RouteQRProps> = ({ url }) => {
    return (
        <div className="route-qr">
            <div className="route-qr__body">
                <div className="route-qr__code" role="img" aria-label={t("QR code to open the route on your phone")}>
                    <QRCode value={url} size={80} />
                </div>
                <div className="route-qr__label">{t("Scan to see route on your phone")}</div>
            </div>
        </div>
    );
};

export default RouteQR;
