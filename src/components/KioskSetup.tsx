import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import store from "../store";
import { t } from "../utils/i18n";
import { reaction, runInAction, toJS } from "mobx";
import { strEqual } from "../utils/strEqual";
import { KIOSK_ID_KEY, KIOSK_SETUP_KEY, SEPARATOR } from "../constants";
import { RouteCutIn } from "../RouteCutIn";
import "./KioskSetup.scss";
import { extractRoute, Kiosk } from "../store/RouteStore";
import isMobile from "../utils/is-mobile";
import isWebview from "../utils/is-webview";
import Rect from "../core/Rect";
import debounce from "../tools/debounce";
import cn from "classnames";

const isMobileDevice = isMobile || isWebview;
const KIOSK_SLUG_PREFIX = "interactive-kiosk";
const KIOSK_SETUP_TOKEN = "expofp-kiosk-setup-token";

const KioskSetup = observer(() => {
    const [showError, setShowError] = useState(false);
    const [pending, setPending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [step, setStep] = useState<"auth" | "edit" | "copy" | "confirmDeletion" | "delete">(
        sessionStorage.getItem(KIOSK_SETUP_TOKEN) ? "edit" : "auth"
    );
    const [kioskUrl, setKioskUrl] = useState("");
    const [passcode, setPasscode] = useState("");

    const kioskSetupDivRef = useRef<HTMLDivElement>(null);

    const apiUrl = useMemo(() => {
        const url = new URL("/api/kiosks", "https://app.expofp.com/");
        url.searchParams.set("expoKey", store.fp.eventId);
        return url.toString();
    }, [store.fp.eventId]);

    const routeFromKioskMatch = useMemo(() => {
        const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));
        return [...searchParams.keys()].map((key) => key.match(new RegExp(`${KIOSK_SLUG_PREFIX}-(\\d+)`))).find((match) => match);
    }, []);

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
            }
        );

        const kioskSetupDataDisposer = reaction(
            () => [store.uiState.kioskSetupData, store.routeStore.currentPosition] as const,
            ([kioskSetupData, currentPosition]) => {
                if (!kioskSetupData) {
                    return;
                }

                const hasCurrentPosition =
                    currentPosition && (store.routeStore.defaultFrom as RouteCutIn)?.type === "route-cut-in";

                store.routeStore.defaultFrom = hasCurrentPosition
                    ? null
                    : new RouteCutIn(
                          Number.MAX_SAFE_INTEGER,
                          t("Interactive Kiosk"),
                          {
                              x: kioskSetupData.x,
                              y: kioskSetupData.y,
                              layer: kioskSetupData.z?.toString(),
                          },
                          `${KIOSK_SLUG_PREFIX}-${kioskSetupData.key}`
                      );

                if (hasCurrentPosition) {
                    store.selectNone();
                }
            }
        );

        async function requestKioskData() {
            try {
                const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));
                const isSetup = searchParams.has(KIOSK_SETUP_KEY);

                let kiosks = [];

                if (!isSetup || step !== "auth") {
                    const response = await fetch(apiUrl, { priority: "high" } as RequestInit);
                    kiosks = await response.json();
                }

                let kioskId = searchParams.get(KIOSK_ID_KEY) || "";

                if (!kioskId && routeFromKioskMatch?.[1]) {
                    kioskId = routeFromKioskMatch[1];
                }

                const kiosk = kiosks.find((k) => strEqual(k.key, kioskId));

                runInAction(() => {
                    store.uiState.kioskList = kiosks;
                    store.uiState.kioskSetup = isSetup;

                    if (kiosk) {
                        store.uiState.kioskSetupData = kiosk;
                    }

                    if (isSetup && kiosks?.length) {
                        store.uiState.moveToRect = Rect.fromMultiple(kiosks.map((k) => Rect.fromCxcywh(k.x, k.y, 100, 100)));
                    }
                });
            } catch (err) {
                console.error(err);
                return;
            }
        }
        requestKioskData();

        return () => {
            kioskSetupDisposer();
            kioskSetupDataDisposer();
            setShowError(false);
            setPending(false);
        };
    }, [apiUrl, store.fp, store.routeStore, store.uiState, step, routeFromKioskMatch]);

    const originalOnGetCoordsClick = useRef(store.fp.onGetCoordsClick?.bind(store.fp)).current;

    useEffect(() => {
        if (!store.uiState.kioskSetup || step !== "edit") {
            return;
        }

        store.fp.onGetCoordsClick = (coords) => {
            originalOnGetCoordsClick?.(coords);
            setShowError(false);
            store.uiState.kioskSetupData = { ...store.uiState.kioskSetupData, ...coords };
        };

        return () => {
            store.fp.onGetCoordsClick = originalOnGetCoordsClick;
        };
    }, [store.uiState.kioskSetup, step]);

    useEffect(() => {
        if (!showSuccess && !showError) {
            return;
        }

        const timer = setTimeout(() => {
            setShowSuccess(false);
            setShowError(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [showSuccess, showError]);

    useEffect(() => {
        if (kioskSetupDivRef.current) {
            store.uiState.kioskSetupDOMRect = kioskSetupDivRef.current.getBoundingClientRect();
        }
    }, [store.uiState.kioskSetup, step]);


    useEffect(() => {
        const routeParts = routeFromKioskMatch?.input?.split(SEPARATOR);
        if (!routeParts) {
            return;
        }

        const timer = setTimeout(() => {
            store.routeStore.selectRoute(extractRoute(routeParts[2], routeParts[1], routeParts.slice(4)));
        }, 500);

        return () => clearTimeout(timer);
    }, [routeFromKioskMatch]);

    async function save() {
        try {
            if (step === "auth") {
                return;
            }

            setShowError(false);
            setPending(true);

            const requestBody: Kiosk = toJS(store.uiState.kioskSetupData);

            const token = sessionStorage.getItem(KIOSK_SETUP_TOKEN);
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...requestBody,
                    key: requestBody.key?.toString() || undefined,
                    ...(token ? { token } : {}),
                }),
            });
            const kiosk = (await response.json()) as Kiosk;

            runInAction(() => {
                store.uiState.kioskSetupData = kiosk;
                store.uiState.kiosk = !isMobileDevice;
            });

            setKioskUrl(new URL(`?${KIOSK_ID_KEY}=${store.uiState.kioskSetupData?.key}`, window.location.href).toString());

            store.layerStore.updateVisibility(`${store.uiState.kioskSetupData.z}`, true);

            setStep("copy");
        } catch (err) {
            console.error(err);
            setShowError(true);
        } finally {
            setPending(false);
        }
    }

    function exit() {
        if (step === "auth") {
            return;
        }

        setStep("edit");
        store.uiState.kioskSetupData = null;
    }

    async function copy() {
        if (step === "auth") {
            return;
        }

        setShowError(false);
        setShowSuccess(false);
        setPending(true);

        try {
            await navigator.clipboard.writeText(kioskUrl);
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            setShowError(true);
        } finally {
            setPending(false);
        }
    }

    function rotate(angle: string) {
        if (step === "auth") {
            return;
        }

        if (!store.uiState.kioskSetupData) {
            return;
        }
        store.uiState.kioskSetupData = {
            ...store.uiState.kioskSetupData,
            heading: parseInt(angle, 10),
        };

        moveToKiosk(store.uiState.kioskSetupData);
    }

    function changeKey(key: string) {
        if (step === "auth") {
            return;
        }

        if (!key) {
            clear();
            return;
        }

        const kiosk = store.uiState.kioskList.find((k) => k.key.toString() === key);

        if (kiosk) {
            store.uiState.kioskSetupData = kiosk;
        } else if (store.uiState.kioskSetupData) {
            store.uiState.kioskSetupData = { ...store.uiState.kioskSetupData, key };
        } else {
            const newKiosk = {
                key,
                x: store.layerStore.rectangle.cx || 0,
                y: store.layerStore.rectangle.cy || 0,
                z: store.layerStore.floors.find((f) => f.active)?.name,
                heading: 0,
            };
            store.uiState.kioskSetupData = newKiosk;
        }

        moveToKiosk(store.uiState.kioskSetupData);
    }

    function moveToKiosk(kiosk: Kiosk) {
        const { x, y, z } = kiosk || {};

        if (z) {
            store.layerStore.updateVisibility(`${z}`, true);
        }

        if (x && y) {
            store.uiState.moveToRect = Rect.fromCxcywh(x, y, 100, 100);
        }   
    }

    function clear() {
        if (step === "auth") {
            return;
        }

        store.uiState.kioskSetupData = null;
    }

    const disabled = !store.uiState.kioskSetupData || pending;

    let title = "";
    if (step === "auth") {
        title = t("Passcode required");
    } else if (step === "copy") {
        title = t("Copy the kiosk URL");
    } else if (step === "confirmDeletion") {
        title = `${t("Delete kiosk")} ${store.uiState.kioskSetupData?.key}?`;
    } else {
        title = t("Add or edit a kiosk");
    }

    const auth = useCallback(
        debounce((passcode: string) => {
            const fn = async () => {
                try {
                    setShowError(false);
                    setShowSuccess(false);

                    if (!passcode) {
                        return;
                    }

                    setPending(true);
                    const response = await fetch("https://app.expofp.com/api/v1/you-are-here/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            expoKey: store.fp.eventId,
                            passcode,
                        }),
                    });

                    const respJson = await response.json();
                    if (!respJson?.token) {
                        setShowError(true);
                        return;
                    }

                    sessionStorage.setItem(KIOSK_SETUP_TOKEN, respJson.token);
                    setStep("edit");
                } catch (err) {
                    console.error(err);
                    setShowError(true);
                } finally {
                    setPending(false);
                }
            };
            fn();
        }, 250),
        [store.fp.eventId]
    );

    const isKioskExist = store.uiState.kioskList.find((k) => `${k.key}` === `${store.uiState.kioskSetupData?.key}`);

    async function deleteKiosk() {
        try {
            setPending(true);

            const url = new URL(apiUrl);
            url.searchParams.set("kioskKey", store.uiState.kioskSetupData.key);

            const token = sessionStorage.getItem(KIOSK_SETUP_TOKEN);
            await fetch(url.href, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...(token ? { token } : {}) }),
            });

            exit();
        } catch (err) {
            console.error(err);
        } finally {
            setPending(false);
        }
    }

    return (
        <Suspense fallback={null}>
            {store.uiState.kioskSetup && (
                <div
                    ref={kioskSetupDivRef}
                    className="efp-kiosk-setup"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="kiosk-setup-title"
                    aria-describedby="kiosk-setup-instructions"
                >
                    <Alert variant="blank" title={title} inline showIcon={false}>
                        {step === "auth" && (
                            <p id="kiosk-setup-instructions" className="efp-kiosk-setup-info">
                                <label className={cn({
                                    "efp-kiosk-setup-key": true,
                                    "efp-kiosk-setup-key__auth": step === "auth",
                                })}> 
                                    <input
                                        name="passcode"
                                        placeholder={t("Enter passcode")}
                                        defaultValue=""
                                        disabled={pending}
                                        onInput={(e) => setPasscode((e.target as HTMLInputElement).value)}
                                        aria-label={t("Enter passcode")}
                                    />
                                </label>
                            </p>
                        )}

                        {step === "edit" && (
                            <>
                                <p className="efp-kiosk-setup-info">
                                    {t("Click on the screen to add or type the kiosk number to edit.")}
                                </p>

                                <label className="efp-kiosk-setup-key">
                                    <span>
                                        <strong>#</strong>
                                    </span>
                                    <input
                                        name="key"
                                        type="number"
                                        min={1}
                                        max={99}
                                        placeholder={t("Enter a number from 1 to 99")}
                                        value={store.uiState.kioskSetupData?.key || ""}
                                        onChange={(e) => {
                                            const input = e.target as HTMLInputElement;
                                            input.value = input.value.replace(/\D/g, "");
                                            changeKey(input.value);
                                        }}
                                    />
                                </label>

                                <p className="efp-kiosk-setup-info">{t("Move the range slider to rotate the icon.")}</p>

                                <label className="efp-kiosk-setup-rotate">
                                    <span>
                                        <strong>{`${store.uiState.kioskSetupData?.heading || 0}`}</strong>°
                                    </span>
                                    <input
                                        name="heading"
                                        type="range"
                                        min="0"
                                        max="360"
                                        step="10"
                                        value={store.uiState.kioskSetupData?.heading || 0}
                                        disabled={disabled}
                                        onChange={(e) => rotate((e.target as HTMLInputElement).value)}
                                    />
                                </label>
                            </>
                        )}

                        {step === "copy" && (
                            <p>
                                <a href={kioskUrl} className="efp-kiosk-setup-link" target="_blank" rel="noopener noreferrer">
                                    <small className="efp-kiosk-setup-link_text">{kioskUrl}</small>
                                </a>
                            </p>
                        )}

                        <div className={cn({
                            "efp-kiosk-setup-actions": true,
                            "efp-kiosk-setup-actions__auth": step === "auth",
                        })}>
                            {step === "auth" && <Button size="md" text={t("Log in")} disabled={!passcode || pending} onClick={() => auth(passcode)} />}

                            {step === "edit" && <Button size="md" text={t("Save")} disabled={disabled} onClick={save} />}

                            {step === "copy" && <Button size="md" text={t("Copy URL")} onClick={copy} />}

                            {step === "edit" && <Button variant="gray-border" size="md" text={t("Clear")} onClick={clear} />}

                            {step === "copy" && <Button variant="gray" size="md" text={t("Exit")} onClick={exit} />}

                            {step === "edit" && isKioskExist && (
                                <Button
                                    variant="gray"
                                    size="md"
                                    text={t("Delete")}
                                    disabled={pending}
                                    onClick={() => setStep("confirmDeletion")}
                                />
                            )}

                            {step === "confirmDeletion" && (
                                <>
                                    <Button size="md" text={t("Delete")} onClick={deleteKiosk} />
                                    <Button variant="gray" size="md" text={t("Cancel")} onClick={exit} />
                                </>
                            )}
                        </div>
                    </Alert>
                </div>
            )}

            {showError && (
                <div className="efp-kiosk-setup-message">
                    <Alert variant="error" closable title={t("Error")} inline onClose={() => setShowError(false)}>
                        {t("An error occurred.\nPlease try again.")}
                    </Alert>
                </div>
            )}

            {showSuccess && (
                <div className="efp-kiosk-setup-message">
                    <Alert variant="success" closable title={t("Success")} inline onClose={() => setShowSuccess(false)} />
                </div>
            )}
        </Suspense>
    );
});

export default KioskSetup;
