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
import { Kiosk } from "../store/RouteStore";
import isMobile from "../utils/is-mobile";
import isWebview from "../utils/is-webview";

const isMobileDevice = isMobile || isWebview;

const MODAL_SHOWN_KEY = "kiosk_setup_modal_shown";

const KioskSetup = observer(() => {
    const [showGuide, setShowGuide] = useState(false);
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const requestUrl = useMemo(() => {
        const url = new URL("/api/kiosks", "https://app.expofp.com/");
        url.searchParams.set("expoKey", store.fp.eventId);
        return url.toString();
    }, [store.fp.eventId]);

    useEffect(() => {
        const kioskSetupDisposer = reaction(
            () => store.uiState.kioskSetup,
            (kioskSetup) => {
                if (kioskSetup) {
                    store.uiState.kiosk = !isMobileDevice;
                }

                store.uiState.hideOverlay = kioskSetup;
                store.uiState.hideHeaderLogo = kioskSetup;
                store.uiState.hideLogoInBooth = kioskSetup;
                store.uiState.monochrome = kioskSetup;
            },
        );

        const kioskSetupDataDisposer = reaction(
            () => ({
                kioskSetupData: store.uiState.kioskSetupData,
                currentPosition: store.routeStore.currentPosition,
            }),
            ({ kioskSetupData, currentPosition }) => {
                const hasCurrentPosition = currentPosition && store.routeStore.defaultFrom instanceof RouteCutIn;

                store.routeStore.defaultFrom = (
                    hasCurrentPosition
                        ? null
                        : new RouteCutIn(
                            Number.MAX_SAFE_INTEGER,
                            t("Interactive Kiosk"),
                            {
                                x: kioskSetupData.x,
                                y: kioskSetupData.y,
                                layer: kioskSetupData.z?.toString(),
                            },
                        )
                );

                if (hasCurrentPosition) {
                    store.selectNone();
                }
            },
        );

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

                const response = await fetch(requestUrl);

                if (!response.ok) {
                    setShowError(true);
                    return;
                }

                const kiosks = await response.json();

                store.uiState.kioskList = kiosks.map(k => ({ ...k, key: parseInt(k.key, 10) }));

                if (!kioskEncodedId) {
                    return;
                }

                const kiosk = kiosks.find(k => strEqual(k.key, kioskEncodedId));

                if (!kiosk) {
                    return;
                }

                let heading = 0;

                // TODO: Remove this after server sends angle in response
                const rawAngle = searchParams.get("a");
                if (rawAngle) {
                    heading = parseInt(rawAngle, 10);
                }

                store.uiState.kioskSetupData = {
                    ...kiosk,
                    key: parseInt(kiosk.key, 10),
                    heading: heading || kiosk.heading || 0,
                };

                store.uiState.kiosk = !isMobileDevice;
            } catch (err) {
                console.error(err);
                setShowError(true);
                return;
            }
        }
        requestKioskData();

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
            kioskSetupDisposer();
            kioskSetupDataDisposer();
            store.fp.onGetCoordsClick = originalOnGetCoordsClick;
            setShowError(false);
            setPending(false);
            setSaved(false);
        }
    }, [
        requestUrl,
        store.fp,
        store.routeStore,
        store.uiState,
    ]);

    async function save() {
        try {
            setShowError(false);
            setPending(true);

            const params = new URLSearchParams(decodeURIComponent(window.location.search));

            const kioskSetupData = toJS(store.uiState.kioskSetupData);

            let heading = kioskSetupData?.heading || 0;

            const requestBody: Kiosk = { ...kioskSetupData, heading };

            const response = await fetch(
                requestUrl,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...requestBody,
                        key: requestBody.key?.toString() || "",
                    }),
                },
            );

            if (!response.ok) {
                setShowError(true);
                return;
            }

            const kiosk = await response.json() as Kiosk;

            params.delete(KIOSK_SETUP_KEY);
            params.set(KIOSK_ID_KEY, kiosk.key?.toString());

            if (kiosk.heading) {
                heading = kiosk.heading;
            }

            // TODO: Remove this after server sends angle in response
            params.set("a", heading.toString());

            // TODO: enable service worker
            params.set("sw", "0");

            window.history.replaceState(window.history.state, "", `?${params.toString()}`);
            store.uiState.kioskSetupData = { ...kiosk, heading };
            setSaved(true);
            store.uiState.kiosk = !isMobileDevice;
        } catch (err) {
            console.error(err);
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

        if (params.has("sw")) {
            window.location.reload();
        }
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
            .catch((err) => {
                console.error(err);
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
            heading: parseInt(angle, 10),
        };
    }

    function changeKey(key: string) {
        if (!store.uiState.kioskSetupData) {
            return;
        }

        const kiosk = store.uiState.kioskList.find(k => k.key.toString() === key);

        if (kiosk) {
            store.uiState.kioskSetupData = kiosk;
        } else {
            store.uiState.kioskSetupData = {
                ...store.uiState.kioskSetupData,
                key: parseInt(key, 10),
            };
        }

        const params = new URLSearchParams(decodeURIComponent(window.location.search));
        params.set(KIOSK_SETUP_KEY, key);
        window.history.replaceState(window.history.state, "", `?${params}`);
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
                                    <label className="efp-kiosk-setup-key">
                                        <span><strong>{t("ID")}</strong>:</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={99}
                                            placeholder={t("Enter a number from 1 to 99")}
                                            disabled={!store.uiState.kioskSetupData || pending}
                                            value={store.uiState.kioskSetupData?.key || ""}
                                            onChange={e => changeKey((e.target as HTMLInputElement).value)}
                                        />
                                    </label>
                                )}

                                {!saved && (
                                    <label className="efp-kiosk-setup-rotate">
                                        <span>{t("Rotate by")}&nbsp;<strong>{`${store.uiState.kioskSetupData?.heading || 0}`}</strong>°</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            step="10"
                                            value={store.uiState.kioskSetupData?.heading || 0}
                                            disabled={!store.uiState.kioskSetupData || pending}
                                            onChange={e => rotate((e.target as HTMLInputElement).value)}
                                        />
                                    </label>
                                )}

                                <div className="efp-kiosk-setup-actions">
                                    {
                                        saved
                                            ? (
                                                <Button
                                                    inline
                                                    size="md"
                                                    text={t("Copy URL")}
                                                    onClick={copy}
                                                />

                                            ) : (
                                                <Button
                                                    inline
                                                    size="md"
                                                    text={t("Set")}
                                                    disabled={!store.uiState.kioskSetupData || pending}
                                                    onClick={save}
                                                />
                                            )
                                    }

                                    <Button
                                        variant={saved ? "secondary" : "gray"}
                                        size="md"
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
