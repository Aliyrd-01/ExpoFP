import React from "react";
import Button from "./Button";
import "./CookieConsent.scss";
import { t } from "../utils/i18n";

export interface CookieConsentProps {
    link?: string;
    onClickAccept?: () => void;
    onClickReject?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ link, onClickAccept, onClickReject }) => {
    return (
        <div className="cookie-consent">
            <div className="cookie-consent__title">{ t("Cookie Consent") }</div>
            <div className="cookie-consent__text">
                { t("We use cookies for analytics only") }&nbsp;
                {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        { t("Read More") }
                    </a>
                ) : null}
            </div>
            <div className="cookie-consent__bottom">
                <Button size="md" onClick={onClickAccept}>
                    { t("Accept cookies") }
                </Button>
                <Button size="md" variant="gray" onClick={onClickReject}>
                    { t("Reject") }
                </Button>
            </div>
        </div>
    );
};

export default CookieConsent;
