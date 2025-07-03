import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { uiState } from "../store";
import { t } from "../utils/i18n";
import { useInit } from "../utils/mobx";
import "./Demo.scss";

const key = "note-dismissed5";

export default function Demo() {
    const s = useLocalStore(() => ({
        hidden: true,
        get top() {
            return uiState.screenSize.width <= 820;
        },
        get classes() {
            return classNames({
                demo: true,
                top: this.top,
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
                <div className="demo__message">
                    <span>
                        {t("Get your free floor plan at")}&nbsp;
                        <a href="https://expofp.com/" target="_blank" rel="noopener noreferrer">
                            ExpoFP.com
                        </a>
                    </span>
                </div>
                <a href="/" onClick={dismiss} className="demo__dismiss">
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
