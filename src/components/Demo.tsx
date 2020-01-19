import classNames from "classnames";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { useUiState } from "../tools/use";
// import { uiState } from "../store";
import { useInit } from "../utils/mobx";
import "./Demo.scss";

const key = "note-dismissed5";

export default function Demo() {
    const uiState = useUiState();

    const s = useLocalStore(() => ({
        hidden: true,
        get top() {
            return uiState.screenSize.width <= 820;
        },
        get classes() {
            return classNames({
                demo: true,
                top: this.top,
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
                <div className="demo__message">
                    <span>
                        Get your free floor plan at&nbsp;
                        <a href="https://expofp.com/" target="_blank" rel="noopener noreferrer">
                            ExpoFP.com
                        </a>
                    </span>
                </div>
                <a href="/" onClick={dismiss} className="demo__dismiss">
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
