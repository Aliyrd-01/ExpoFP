import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import store from "../store";
import { t } from "../utils/i18n";
import { reaction, runInAction, toJS } from "mobx";
import { strEqual } from "../utils/strEqual";
import { KIOSK_ID_KEY, KIOSK_SETUP_KEY } from "../constants";
import { RouteCutIn } from "../RouteCutIn";
import "./KioskSetup.scss";
import { Kiosk } from "../store/RouteStore";
import isMobile from "../utils/is-mobile";
import isWebview from "../utils/is-webview";
import Rect from "../core/Rect";

const isMobileDevice = isMobile || isWebview;

const KioskSetup = observer(() => {
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [step, setStep] = useState<"edit" | "copy">("edit");
    const [kioskUrl, setKioskUrl] = useState("");

    const kioskSetupRef = useRef<HTMLDivElement>(null);

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

                const hasCurrentPosition = (
                    currentPosition
                    && (store.routeStore.defaultFrom as RouteCutIn)?.type === "route-cut-in"
                );

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
                            `interactive-kiosk-${kioskSetupData.key}`,
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
                const kioskId = searchParams.get(KIOSK_ID_KEY) || "";
                const kiosk = kiosks.find(k => strEqual(k.key, kioskId));

                runInAction(() => {
                    const isSetup = searchParams.has(KIOSK_SETUP_KEY);

                    store.uiState.kioskList = kiosks;
                    store.uiState.kioskSetup = isSetup;

                    if (kiosk) {
                        store.uiState.kioskSetupData = kiosk;
                    }

                    if (isSetup && kiosks?.length) {
                        store.uiState.moveToRect = store.layerStore.rectangle;
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
        }
    }, [
        apiUrl,
        store.fp,
        store.routeStore,
        store.uiState,
        step,
    ]);

    const originalOnGetCoordsClick = useRef(store.fp.onGetCoordsClick?.bind(store.fp)).current;

    useEffect(() => {
        if (!store.uiState.kioskSetup || step !== "edit") {
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
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    }, [showSuccess]);

    useEffect(() => {
        if (kioskSetupRef.current) {
            store.uiState.kioskSetupDOMRect = kioskSetupRef.current.getBoundingClientRect();
        }
    }, [store.uiState.kioskSetup, step]);

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
        setStep("edit");
        store.uiState.kioskSetupData = null;
    }

    async function copy() {
        setShowError(false);
        setShowSuccess(false);
        setPending(true);

        try {
            await navigator.clipboard.writeText(kioskUrl);
            setShowSuccess(true);
            store.uiState.kioskSetupData = null;
            setStep("edit");
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
        if (!key) {
            clear();
            return;
        }

        const kiosk = store.uiState.kioskList.find(k => k.key.toString() === key);

        if (kiosk) {
            store.uiState.kioskSetupData = kiosk;
        } else if (store.uiState.kioskSetupData) {
            store.uiState.kioskSetupData = { ...store.uiState.kioskSetupData, key };
        } else {
            const newKiosk = {
                key,
                x: store.layerStore.rectangle.cx || 0,
                y: store.layerStore.rectangle.cy || 0,
                z: store.layerStore.floors.find(f => f.active)?.name,
                heading: 0,
            };
            store.uiState.kioskSetupData = newKiosk;
            store.uiState.moveToRect = Rect.fromCxcywh(newKiosk.x, newKiosk.y, 1000, 1000);
        }
    }

    function clear() {
        store.uiState.kioskSetupData = null;
    }

    const disabled = !store.uiState.kioskSetupData || pending;

    return (
        <Suspense fallback={null}>
            {store.uiState.kioskSetup && (
                <div ref={kioskSetupRef} className="efp-kiosk-setup">
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
                                <p className="efp-kiosk-setup-info">
                                    {t("Click on the screen to add or type the kiosk number to edit.")}
                                </p>

                                <label className="efp-kiosk-setup-key">
                                    <span><strong>#</strong></span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={99}
                                        placeholder={t("Enter a number from 1 to 99")}
                                        value={store.uiState.kioskSetupData?.key || ""}
                                        onChange={e => {
                                            const input = e.target as HTMLInputElement;
                                            input.value = input.value.replace(/\D/g, "");
                                            changeKey(input.value);
                                        }}
                                    />
                                </label>

                                <p className="efp-kiosk-setup-info">
                                    {t("Move the range slider to rotate the icon.")}
                                </p>

                                <label className="efp-kiosk-setup-rotate">
                                    <span><strong>{`${store.uiState.kioskSetupData?.heading || 0}`}</strong>°</span>
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
                                    <small>{kioskUrl}</small>
                                </a>
                            </p>
                        )}

                        <div className="efp-kiosk-setup-actions">
                            {step === "edit" && (
                                <Button
                                    size="md"
                                    text={t("Save")}
                                    disabled={disabled}
                                    onClick={save}
                                />
                            )}

                            {step === "copy" && (
                                <Button
                                    size="md"
                                    text={t("Copy URL")}
                                    onClick={copy}
                                />
                            )}

                            {step === "edit" && (
                                <Button
                                    variant="gray-border"
                                    size="md"
                                    text={t("Clear")}
                                    onClick={clear}
                                />
                            )}

                            {step === "copy" && (
                                <Button
                                    variant="gray"
                                    size="md"
                                    text={t("Cancel")}
                                    onClick={exit}
                                />
                            )}
                        </div>
                    </Alert>
                </div>
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
