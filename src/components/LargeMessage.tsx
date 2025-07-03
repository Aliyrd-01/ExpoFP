import { autorun, reaction } from "mobx";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { uiState } from "../store";
import logger from "../tools/logger";
import { useInit } from "../utils/mobx";
import "./LargeMessage.scss";

const timeout = 1000;

export default function LargeMessage() {
    // const [visible, setVisible] = useState(false);
    const s = useLocalStore(() => ({
        shouldShow: false,
        visible: false,
        transitioning: false,
    }));

    useInit(() => {
        let timeoutId: number;
        reaction(
            () => uiState.largeMessageLastSet,
            () => {
                if (!uiState.largeMessageLastSet) return;
                window.clearTimeout(timeoutId);
                logger.log("Showing large message");
                s.shouldShow = true;
                timeoutId = window.setTimeout(() => {
                    s.shouldShow = false;
                }, timeout);
            },
            { fireImmediately: true }
        );

        let visibleTimeoutID: number;
        autorun(() => {
            window.clearTimeout(visibleTimeoutID);
            if (s.shouldShow) {
                s.transitioning = true;
                visibleTimeoutID = window.setTimeout(() => {
                    s.visible = true;
                }, 1);
            } else {
                s.visible = false;
                visibleTimeoutID = window.setTimeout(() => {
                    s.transitioning = false;
                }, 1000);
            }
        });
    });

    return useObserver(() =>
        uiState.largeMessage && s.transitioning ? (
            <div className={"large-message" + (s.visible ? " -visible" : "")}>
                <div className="large-message__text">{uiState.largeMessage}</div>
            </div>
        ) : null
    );
}
