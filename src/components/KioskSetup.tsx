import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import store from "../store";
import { t } from "../utils/i18n";
import { reaction, toJS } from "mobx";
import Modal from "./Modal";
import { strEqual } from "../utils/strEqual";
import { KIOSK_ID_KEY, KIOSK_SETUP_KEY } from "../constants";
import { RouteCutIn } from "../RouteCutIn";
import "./KioskSetup.scss";

const MODAL_SHOWN_KEY = "kiosk_setup_modal_shown";

// TODO: Handle a click on the kiosk icon
const KioskSetup = observer(() => {
    const [showGuide, setShowGuide] = useState(false);
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);

    reaction(
        () => store.uiState.kioskSetup,
        (kioskSetup) => {
            if (kioskSetup) {
                store.uiState.kiosk = true;
            }

            store.uiState.hideOverlay = kioskSetup;
            store.uiState.hideHeaderLogo = kioskSetup;
            store.uiState.hideLogoInBooth = kioskSetup;
            store.uiState.monochrome = kioskSetup;
        },
    );

    const requestUrl = useMemo(() => {
        const url = new URL(
            "/api/kiosks",
            (
                // TODO: Remove this after testing
                store.fp.eventId === "demo-staging2"
                    ? "https://esm-web-dev-app.herokuapp.com/"
                    : "https://app.expofp.com/"
            ),
        );
        url.searchParams.set("expoKey", store.fp.eventId);
        return url.toString();
    }, [store.fp]);

    useEffect(() => {
        async function requestKioskData() {
            try {
                let kioskEncodedId;

                const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));

                if (searchParams.has(KIOSK_SETUP_KEY)) {
                    kioskEncodedId = searchParams.get(KIOSK_SETUP_KEY);
                    store.uiState.kioskSetup = true;
                } else if (searchParams.has(KIOSK_ID_KEY)) {
                    kioskEncodedId = searchParams.get(KIOSK_ID_KEY);
                }

                if (!kioskEncodedId) {
                    return;
                }

                const response = await fetch(requestUrl);

                if (!response.ok) {
                    setShowError(true);
                    return;
                }

                const kiosks = await response.json();
                const kiosk = kiosks.find(k => strEqual(k.key, kioskEncodedId));

                if (!kiosk) {
                    return;
                }

                store.uiState.kioskSetupData = {
                    x: kiosk.x,
                    y: kiosk.y,
                    z: kiosk.z,
                };

                store.uiState.kiosk = true;

                store.routeStore.defaultFrom = new RouteCutIn(
                    Number.MAX_SAFE_INTEGER,
                    t("Interactive Kiosk"),
                    {
                        x: kiosk.x,
                        y: kiosk.y,
                        layer: kiosk.z?.toString(),
                    },
                );
            } catch (error) {
                setShowError(true);
                return;
            }
        }
        requestKioskData();
    }, [requestUrl]);

    useEffect(() => {
        if (!store.uiState.kioskSetup) {
            return;
        }

        if (!sessionStorage.getItem(MODAL_SHOWN_KEY)) {
            setShowGuide(true);
        }

        const originalOnGetCoordsClick = store.fp.onGetCoordsClick;
        store.fp.onGetCoordsClick = coords => {
            originalOnGetCoordsClick?.(coords);

            setShowError(false);
            store.uiState.kioskSetupData = { ...coords };
        };

        return () => {
            store.fp.onGetCoordsClick = originalOnGetCoordsClick;
            setShowError(false);
        }
    }, [store.uiState.kioskSetup, store.fp.onGetCoordsClick]);

    async function save() {
        try {
            setShowError(false);
            setPending(true);

            const params = new URLSearchParams(decodeURIComponent(window.location.search));

            const kioskSetupData = toJS(store.uiState.kioskSetupData)
            const requestBody: {
                x: number,
                y: number,
                z: string,
                key?: string,
            } = {
                x: kioskSetupData.x,
                y: kioskSetupData.y,
                z: kioskSetupData.z?.toString(),
            };

            if (params.get(KIOSK_SETUP_KEY)) {
                requestBody.key = params.get(KIOSK_SETUP_KEY);
            }

            const response = await fetch(
                requestUrl,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                },
            );

            if (!response.ok) {
                setShowError(true);
                return;
            }

            const kiosk = await response.json();

            params.delete(KIOSK_SETUP_KEY);
            params.set(KIOSK_ID_KEY, kiosk.key);
            window.history.replaceState({}, "", `?${params.toString()}`);

            store.uiState.kioskSetup = false;
            store.uiState.kiosk = true;
        } catch (err) {
            setShowError(true);
        } finally {
            setPending(false);
        }
    }

    function exit() {
        store.uiState.kioskSetup = false;
        sessionStorage.removeItem(MODAL_SHOWN_KEY);

        const params = new URLSearchParams(decodeURIComponent(window.location.search));

        const kioskId = params.get(KIOSK_SETUP_KEY);
        if (kioskId) {
            params.set(KIOSK_ID_KEY, kioskId);
        } else {
            store.uiState.kioskSetupData = null;
        }

        params.delete(KIOSK_SETUP_KEY);
        window.history.replaceState({}, "", `?${params.toString()}`);
    };

    return (
        <Suspense fallback={null}>
            {store.uiState.kioskSetup && (
                <>
                    <Modal open={showGuide} onClickClose={() => setShowGuide(false)}>
                        <h2>{t("Setting up the kiosk")}</h2>

                        <p>{t("Click on the desired location on the map where the kiosk should be placed.")}</p>
                        <p>{t("The coordinates will be set automatically, and the kiosk will appear at the selected point.")}</p>
                        <p>{t("If needed, adjust the position by clicking on a different location on the map.")}</p>

                        <div style={{ textAlign: "right" }}>
                            <Button
                                inline
                                text={t("Ok, got it.")}
                                onClick={() => {
                                    sessionStorage.setItem(MODAL_SHOWN_KEY, "1");
                                    setShowGuide(false);
                                }}
                            />
                        </div>
                    </Modal>

                    {!showGuide && (
                        <div className="efp-kiosk-setup">
                            <Alert
                                variant="blank"
                                title={t("Setting the position of this kiosk")}
                                inline
                                showIcon={false}
                            >
                                <div
                                    style={{
                                        display: "grid",
                                        gridAutoFlow: "column",
                                        gap: "0.5rem",
                                        paddingTop: "1rem",
                                    }}
                                >
                                    <Button
                                        inline
                                        size="sm"
                                        text={t("Save")}
                                        disabled={!store.uiState.kioskSetupData || pending}
                                        onClick={save}
                                    />

                                    <Button
                                        variant="gray"
                                        size="sm"
                                        inline
                                        text={t("Exit")}
                                        onClick={exit}
                                    />
                                </div>
                            </Alert>
                        </div>
                    )}
                </>
            )}

            {showError && (
                <div className="efp-kiosk-setup__error" >
                    <Alert
                        variant="error"
                        closable
                        title={t("Error")}
                        inline
                        onClose={() => setShowError(false)}
                    >
                        {t("An error occurred.\nPlease try again.")}
                    </Alert>
                </div>
            )}
        </Suspense>
    );
});

export default KioskSetup;
