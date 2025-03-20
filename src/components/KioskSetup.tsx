import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import store from "../store";
import { t } from "../utils/i18n";
import { reaction, runInAction, set, toJS } from "mobx";
import Modal from "./Modal";
import { strEqual } from "../utils/strEqual";
import { KIOSK_ID_KEY, KIOSK_SETUP_KEY } from "../constants";
import { RouteCutIn } from "../RouteCutIn";
import "./KioskSetup.scss";
import { Kiosk } from "../store/RouteStore";
import isMobile from "../utils/is-mobile";
import isWebview from "../utils/is-webview";
import Rect from "../core/Rect";

const isMobileDevice = isMobile || isWebview;
const MODAL_SHOWN_KEY = "kiosk_setup_modal_shown";
const SUCCESS_SHOWN_KEY = "kiosk_setup_success_shown";

const KioskSetup = observer(() => {
    const [showGuide, setShowGuide] = useState(!sessionStorage.getItem(MODAL_SHOWN_KEY));
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(!!sessionStorage.getItem(SUCCESS_SHOWN_KEY));
    const [step, setStep] = useState<"start" | "edit" | "copy">("start");
    const [kioskUrl, setKioskUrl] = useState("");

    const apiUrl = useMemo(() => {
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
            () => [
                store.uiState.kioskSetupData,
                store.routeStore.currentPosition,
            ] as const,
            ([kioskSetupData, currentPosition]) => {
                if (!kioskSetupData) {
                    return;
                }

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
                            `k-${kioskSetupData.key}`,
                        )
                );

                if (hasCurrentPosition) {
                    store.selectNone();
                }
            },
        );

        async function requestKioskData() {
            try {
                const response = await fetch(apiUrl);
                const kiosks = await response.json();

                const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));
                const kioskId = searchParams.get(KIOSK_SETUP_KEY) || searchParams.get(KIOSK_ID_KEY) || "";
                const kiosk = kiosks.find(k => strEqual(k.key, kioskId));

                runInAction(() => {
                    store.uiState.kioskList = kiosks;
                    store.uiState.kioskSetup = searchParams.has(KIOSK_SETUP_KEY);
                    store.uiState.kiosk = kioskId && !isMobileDevice;

                    if (kiosk) {
                        store.uiState.kioskSetupData = kiosk;
                    }

                    if ((searchParams.has(KIOSK_SETUP_KEY) && kiosks?.length)) {
                        store.uiState.moveToRect = Rect.fromMultiple(
                            kiosks.map(k => Rect.fromCxcywh(k.x, k.y, 1000, 1000)),
                        );
                    }
                });

            } catch (err) {
                console.error(err);
                setShowError(true);
                return;
            }
        }
        requestKioskData();

        return () => {
            kioskSetupDisposer();
            kioskSetupDataDisposer();
            setShowError(false);
            setPending(false);
            setStep("start");
        }
    }, [
        apiUrl,
        store.fp,
        store.routeStore,
        store.uiState,
    ]);

    const originalOnGetCoordsClick = useRef(store.fp.onGetCoordsClick?.bind(store.fp)).current;

    useEffect(() => {
        if (step !== "edit") {
            return;
        }

        store.fp.onGetCoordsClick = coords => {
            originalOnGetCoordsClick?.(coords);
            setShowError(false);
            store.uiState.kioskSetupData = { ...store.uiState.kioskSetupData, ...coords };
        };

        return () => {
            store.fp.onGetCoordsClick = originalOnGetCoordsClick;
        };
    }, [store.uiState.kioskSetup, step]);

    useEffect(() => {
        sessionStorage.removeItem(SUCCESS_SHOWN_KEY);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    }, [showSuccess]);

    async function save() {
        try {
            setShowError(false);
            setPending(true);

            const requestBody: Kiosk = toJS(store.uiState.kioskSetupData);

            const response = await fetch(
                apiUrl,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...requestBody,
                        key: requestBody.key?.toString() || undefined,
                    }),
                },
            );
            const kiosk = await response.json() as Kiosk;

            runInAction(() => {
                store.uiState.kioskSetupData = kiosk;
                store.uiState.kiosk = !isMobileDevice;
            });

            setKioskUrl(
                new URL(
                    `?${KIOSK_ID_KEY}=${store.uiState.kioskSetupData?.key}`,
                    window.location.href
                ).toString(),
            );
            setStep("copy");
        } catch (err) {
            console.error(err);
            setShowError(true);
        } finally {
            setPending(false);
        }
    }

    function exit() {
        setStep("start");
        store.uiState.kioskSetupData = null;
    }

    async function copy() {
        setShowError(false);
        setShowSuccess(false);
        setPending(true);

        try {
            await navigator.clipboard.writeText(kioskUrl);
            sessionStorage.setItem(SUCCESS_SHOWN_KEY, "1");
            window.location.reload();
        } catch (err) {
            console.error(err);
            setShowError(true);
        } finally {
            setPending(false);
        }
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
        const kiosk = store.uiState.kioskList.find(k => k.key.toString() === key);

        if (kiosk) {
            store.uiState.kioskSetupData = kiosk;
        } else if (store.uiState.kioskSetupData) {
            store.uiState.kioskSetupData = { ...store.uiState.kioskSetupData, key };
        }
    }

    function closeGuide() {
        sessionStorage.setItem(MODAL_SHOWN_KEY, "1");
        setShowGuide(false);
    }

    const disabled = !store.uiState.kioskSetupData || pending;

    return (
        <Suspense fallback={null}>
            {store.uiState.kioskSetup && (
                <>
                    <Modal open={showGuide} onClickClose={closeGuide}>
                        <h2>{t("Setting up the kiosk")}</h2>

                        <p>{t("Click on the desired location on the map where the kiosk should be placed.")}</p>
                        <p>{t("The coordinates will be set automatically, and the kiosk will appear at the selected point.")}</p>
                        <p>{t("If needed, adjust the position by clicking on a different location on the map.")}</p>

                        <div style={{ textAlign: "right" }}>
                            <Button
                                inline
                                text={t("Ok, got it")}
                                onClick={closeGuide}
                            />
                        </div>
                    </Modal>

                    {!showGuide && (
                        <div className="efp-kiosk-setup">
                            <Alert
                                variant="blank"
                                title={(
                                    step === "copy"
                                        ? t("Copy the kiosk URL")
                                        : t("Add or edit a kiosk")
                                )}
                                inline
                                showIcon={false}
                            >
                                {step === "edit" && (
                                    <>
                                        <label className="efp-kiosk-setup-key">
                                            <input
                                                type="number"
                                                min={1}
                                                max={99}
                                                placeholder={t("Enter a number from 1 to 99")}
                                                defaultValue={store.uiState.kioskSetupData?.key || ""}
                                                disabled={!store.uiState.kioskSetupData}
                                                onInput={e => {
                                                    const input = e.target as HTMLInputElement;
                                                    input.value = input.value.replace(/\D/g, "");
                                                    changeKey(input.value);
                                                }}
                                            />
                                        </label>

                                        <label className="efp-kiosk-setup-rotate">
                                            <span>{t("Rotate by")}&nbsp;<strong>{`${store.uiState.kioskSetupData?.heading || 0}`}</strong>°</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="360"
                                                step="10"
                                                value={store.uiState.kioskSetupData?.heading || 0}
                                                disabled={disabled}
                                                onChange={e => rotate((e.target as HTMLInputElement).value)}
                                            />
                                        </label>
                                    </>
                                )}

                                {step === "copy" && (
                                    <p>
                                        <a href={kioskUrl} target="_blank" rel="noopener noreferrer">
                                            {kioskUrl}
                                        </a>
                                    </p>
                                )}

                                <div className="efp-kiosk-setup-actions">
                                    {step === "start" && (
                                        <>
                                            <Button
                                                inline
                                                size="md"
                                                text={t("Start")}
                                                onClick={() => setStep("edit")}
                                            />
                                        </>
                                    )}

                                    {step === "edit" && (
                                        <Button
                                            inline
                                            size="md"
                                            text={t("Save")}
                                            disabled={disabled}
                                            onClick={save}
                                        />
                                    )}

                                    {step === "copy" && (
                                        <Button
                                            inline
                                            size="md"
                                            text={t("Copy URL")}
                                            onClick={copy}
                                        />
                                    )}

                                    {step !== "start" && (
                                        <Button
                                            variant="gray"
                                            inline
                                            size="md"
                                            text={t("Cancel")}
                                            onClick={exit}
                                        />
                                    )}
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
