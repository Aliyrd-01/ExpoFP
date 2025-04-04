import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { uiState } from "../store";
import { t } from "../utils/i18n";
import { useInit } from "../utils/mobx";
import "./Free.scss";

const key = "free-dismissed5";

export type FreeProps = {
    trial?: boolean;
};

export default function Free(props: FreeProps) {
    const s = useLocalStore(() => ({
        hidden: true,
        get top() {
            return uiState.screenSize.width <= 820;
        },
        get classes() {
            return classNames({
                free: true,
                top: this.top,
                bottom: !this.top,
                hidden: this.hidden,
            });
        },
    }));

    useInit(() => {
        if (sessionStorage.getItem(key)) return;
        window.setTimeout(() => {
            s.hidden = false;
        }, 2000);
    });

    return useObserver(() => (
        <div className={s.classes}>
            <section>
                <div className="free__message">
                    <span>
                        {props.trial ? t("Create a trial floor plan at") : t("Create a free floor plan at")}&nbsp;
                        <a href="https://expofp.com/" target="_blank" rel="noopener noreferrer">
                            ExpoFP.com
                        </a>
                    </span>
                </div>
                <a href="/" onClick={dismiss} className="free__dismiss">
                    {t("Dismiss")}
                </a>
            </section>
        </div>
    ));

    function dismiss(e: React.MouseEvent) {
        e.preventDefault();
        s.hidden = true;
        sessionStorage.setItem(key, "1");
    }
}
