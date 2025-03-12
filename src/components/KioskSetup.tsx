import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import store from "../store";
import { t } from "../utils/i18n";
import { reaction, set, toJS } from "mobx";
import Modal from "./Modal";
import { strEqual } from "../utils/strEqual";
import { KIOSK_ID_KEY, KIOSK_SETUP_KEY } from "../constants";
import { RouteCutIn } from "../RouteCutIn";
import "./KioskSetup.scss";

const MODAL_SHOWN_KEY = "kiosk_setup_modal_shown";

const KioskSetup = observer(() => {
    const [showGuide, setShowGuide] = useState(false);
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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

    reaction(
        () => ({
            kioskSetupData: store.uiState.kioskSetupData,
            currentPosition: store.routeStore.currentPosition,
        }),
        ({ kioskSetupData, currentPosition }) => {
            if (currentPosition && store.routeStore.defaultFrom instanceof RouteCutIn) {
                store.routeStore.defaultFrom = null;
                store.selectNone();
                return;
            }

            store.routeStore.defaultFrom = new RouteCutIn(
                Number.MAX_SAFE_INTEGER,
                t("Interactive Kiosk"),
                {
                    x: kioskSetupData.x,
                    y: kioskSetupData.y,
                    layer: kioskSetupData.z?.toString(),
                },
            );
        },
    );

    const requestUrl = useMemo(() => {
        const url = new URL("/api/kiosks", "https://app.expofp.com/");
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
            store.uiState.kioskSetupData = { ...store.uiState.kioskSetupData, ...coords };
        };

        return () => {
            store.fp.onGetCoordsClick = originalOnGetCoordsClick;
            setShowError(false);
            setPending(false);
            setSaved(false);
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
                angle: number,
                key?: string,
            } = {
                x: kioskSetupData.x,
                y: kioskSetupData.y,
                z: kioskSetupData.z?.toString(),
                angle: kioskSetupData.angle,
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

            window.history.replaceState(
                window.history.state,
                "",
                `?${params.toString()}`
            );

            store.uiState.kioskSetupData = {
                x: kiosk.x,
                y: kiosk.y,
                z: kiosk.z,
            };

            // store.uiState.kioskSetup = false;
            setSaved(true);
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
        }

        params.delete(KIOSK_SETUP_KEY);

        window.history.replaceState(
            window.history.state,
            "",
            params.toString() ? `?${params}` : window.location.pathname,
        );
    }

    function copy() {
        setShowError(false);
        setShowSuccess(false);
        setPending(true);

        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setShowSuccess(true);
                store.uiState.kioskSetup = false;
                setTimeout(() => setShowSuccess(false), 3000);
            })
            .catch(() => {
                setShowError(true);
            }).finally(() => {
                setPending(false);
            });
    }

    function rotate(angle: string) {
        if (!store.uiState.kioskSetupData) {
            return;
        }
        store.uiState.kioskSetupData = {
            ...store.uiState.kioskSetupData,
            angle: parseInt(angle, 10),
        };
    }

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
                                text={t("Ok, got it")}
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
                                title={
                                    saved
                                        ? t("Copy the kiosk URL")
                                        : t("Setting the position of a kiosk")
                                }
                                inline
                                showIcon={false}
                            >
                                {!saved && (
                                    <label className="efp-kiosk-setup-rotate">
                                        <small>{t("Rotate by")}&nbsp;<strong>{`${store.uiState.kioskSetupData?.angle || 0}`}</strong>°</small>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            value={store.uiState.kioskSetupData?.angle || 0}
                                            disabled={!store.uiState.kioskSetupData || pending}
                                            onInput={e => rotate((e.target as HTMLInputElement).value)}
                                        />
                                    </label>
                                )}

                                <div className="efp-kiosk-setup-actions">
                                    {
                                        saved
                                            ? (
                                                <Button
                                                    inline
                                                    size="sm"
                                                    text={t("Copy URL")}
                                                    onClick={copy}
                                                />

                                            ) : (
                                                <Button
                                                    inline
                                                    size="sm"
                                                    text={t("Set position")}
                                                    disabled={!store.uiState.kioskSetupData || pending}
                                                    onClick={save}
                                                />
                                            )
                                    }

                                    <Button
                                        variant={saved ? "secondary" : "gray"}
                                        size="sm"
                                        inline
                                        text={saved ? t("Skip") : t("Exit")}
                                        onClick={exit}
                                    />
                                </div>
                            </Alert>
                        </div>
                    )}
                </>
            )}

            {showError && (
                <div className="efp-kiosk-setup-message">
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

            {showSuccess && (
                <div className="efp-kiosk-setup-message">
                    <Alert
                        variant="success"
                        closable
                        title={t("Success")}
                        inline
                        onClose={() => setShowSuccess(false)}
                    />
                </div>
            )}
        </Suspense>
    );
});

export default KioskSetup;
