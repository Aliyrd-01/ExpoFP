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
        <div
            className="cookie-consent"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-consent-title"
            aria-describedby="cookie-consent-description"
        >
            <div className="cookie-consent__title" id="cookie-consent-title">
                {t("Cookie Consent")}
            </div>
            <div className="cookie-consent__text" id="cookie-consent-description">
                {t("We use cookies for analytics only")}&nbsp;
                {link && (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("Read more about cookie usage in a new tab")}
                    >
                        {t("Read More")}
                    </a>
                )}
            </div>
            <div className="cookie-consent__bottom">
                <Button size="md" onClick={onClickAccept}>
                    {t("Accept cookies")}
                </Button>
                <Button size="md" variant="gray" onClick={onClickReject}>
                    {t("Reject")}
                </Button>
            </div>
        </div>
    );
};

export default CookieConsent;
