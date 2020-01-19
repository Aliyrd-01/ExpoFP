import React from "react";
import "./Free.scss";
import { useLocalStore, useObserver } from "mobx-react-lite";
// import { uiState } from "../store";
import { useInit } from "../utils/mobx";
import classNames from "classnames";
import { useUiState } from "../tools/use";

const key = "free-dismissed5";

export default function Free() {
    const uiState = useUiState();
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
                hidden: this.hidden
            });
        }
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
                        This is a FREE floor plan. {s.top && <br />} Create yours at &nbsp;
                        <a href="https://expofp.com/" target="_blank" rel="noopener noreferrer">
                            ExpoFP.com
                        </a>
                    </span>
                </div>
                <a href="/" onClick={dismiss} className="free__dismiss">
                    Dismiss
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
