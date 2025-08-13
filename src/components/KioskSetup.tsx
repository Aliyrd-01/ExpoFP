import { observer } from "mobx-react-lite";
import Alert from "./Alert";
import Button from "./Button";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import store from "../store";
import { runInAction, toJS } from "mobx";
import { strEqual } from "../utils/strEqual";
import { KIOSK_ID_KEY, KIOSK_SETUP_KEY, KIOSK_SLUG_PREFIX, SEPARATOR } from "../constants";
import { RouteCutIn } from "../RouteCutIn";
import "./KioskSetup.scss";
import { extractRoute, Kiosk } from "../store/RouteStore";
import Rect from "../core/Rect";
import debounce from "../tools/debounce";
import cn from "classnames";
import { svgArea } from "../data/svg";
import { areLayersEnabled } from "../utils/areLayersEnabled";
import { useReaction } from "../utils/mobx";

const KIOSK_SETUP_TOKEN = "expofp-kiosk-setup-token";

const KioskSetup = observer(() => {
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState("");
    const [pending, setPending] = useState<boolean>(false);
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

    useReaction(
        () => [
            store.uiState.kioskSetupData,
            store.routeStore.currentPosition,
            store.routeStore.routeFromKioskMatch,
        ] as const,
        ([kioskSetupData, currentPosition, routeFromKioskMatch]) => {
            if (!kioskSetupData) {
                return;
            }

            const hasCurrentPosition =
                currentPosition && (store.routeStore.defaultFrom as RouteCutIn)?.entity.type === "route-cut-in";

            store.routeStore.defaultFrom = hasCurrentPosition
                ? null
                : new RouteCutIn(
                    Number.MAX_SAFE_INTEGER,
                    "Interactive Kiosk",
                    {
                        x: kioskSetupData.x,
                        y: kioskSetupData.y,
                        layer: areLayersEnabled() ? kioskSetupData.z?.toString() : null,
                    },
                    `${KIOSK_SLUG_PREFIX}-${kioskSetupData.key}`
                );

            if (hasCurrentPosition) {
                store.selectNone();
            } else {
                const routeParts = routeFromKioskMatch?.input?.split(SEPARATOR);
                if (routeParts) {
                    store.routeStore.selectRoute(
                        extractRoute(routeParts[2], routeParts[1], routeParts.slice(4)),
                    );
                }
            }
        }
    );

    useEffect(() => {
        async function requestKioskData() {
            try {
                const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));
                const isSetup = searchParams.has(KIOSK_SETUP_KEY);

                let kiosks = [];

                if (!isSetup || step !== "auth") {
                    const response = await fetch(apiUrl, { priority: "high" } as RequestInit);
                    kiosks = await response.json();
                }

                let kioskId = localStorage.getItem(KIOSK_SLUG_PREFIX) || "";

                if (!kioskId && store.routeStore.routeFromKioskMatch?.kioskId) {
                    kioskId = store.routeStore.routeFromKioskMatch.kioskId;
                }

                let kiosk;
                const k = kiosks.find((k) => strEqual(k.key, kioskId));
                if (k) {
                    kiosk = {
                        ...k,
                        // Warning!!!
                        // Remove store.uiState.mapSettings.bearing when map can rotate.
                        heading: store.uiState.mapSettings.bearing || k?.heading,
                    };
                }

                runInAction(() => {
                    store.uiState.kioskList = kiosks;
                    store.uiState.kioskSetup = isSetup;

                    if (kiosk) {
                        store.uiState.kioskSetupData = kiosk;

                        if (areLayersEnabled()) {
                            store.layerStore.updateVisibility(`${kiosk.z}`, true);
                        }
                    }

                    if (isSetup && kiosks?.length) {
                        store.uiState.moveToRect = Rect.fromMultiple(kiosks.map((k) => Rect.fromCxcywh(k.x, k.y, 100, 100)));
                    }
                });
            } catch (err) {
                console.error(err);
                setErrorMsg("Error loading data")
                return;
            }
        }
        requestKioskData();
    }, [
        apiUrl,
        step,
        store.uiState.mapSettings,
        store.routeStore.routeFromKioskMatch,
    ]);

    const originalOnGetCoordsClick = useRef(store.fp.onGetCoordsClick?.bind(store.fp)).current;

    const newKioskKey = useMemo(() => {
        const maxKey = store.uiState.kioskList.reduce((max, { key }) => {
            if (/^\d+$/.test(key)) {
                const num = Number(key);
                return num > max ? num : max;
            }
            return max;
        }, 0);

        return String(maxKey + 1);
    }, [store.uiState.kioskList]);

    useEffect(() => {
        if (!store.uiState.kioskSetup || step !== "edit") {
            return;
        }

        store.fp.onGetCoordsClick = (coords) => {
            originalOnGetCoordsClick?.(coords);
            setErrorMsg("");
            store.uiState.kioskSetupData = {
                ...store.uiState.kioskSetupData,
                ...coords,
                key: store.uiState.kioskSetupData?.key ?? newKioskKey,
                z: areLayersEnabled() ? store.layerStore.floors.find((f) => f.active)?.name : null,
            };
        };

        return () => {
            store.fp.onGetCoordsClick = originalOnGetCoordsClick;
        };
    }, [store.uiState.kioskSetup, step, newKioskKey, store.layerStore.floors]);

    useEffect(() => {
        if (!successMsg && !errorMsg) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccessMsg("");
            setErrorMsg("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMsg, errorMsg]);

    useEffect(() => {
        if (kioskSetupDivRef.current) {
            store.uiState.kioskSetupDOMRect = kioskSetupDivRef.current.getBoundingClientRect();
        }
    }, [store.uiState.kioskSetup, step]);

    async function save() {
        try {
            if (step === "auth") {
                return;
            }

            setErrorMsg("");
            setPending(true);

            await copy();

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
            });

            const kioskUrl = new URL(`?${KIOSK_ID_KEY}=${store.uiState.kioskSetupData?.key}`, window.location.href);
            kioskUrl.searchParams.set("centerxy", `${kiosk.x},${kiosk.y}`);
            kioskUrl.searchParams.set("z", `${kiosk.z || ""}`);
            kioskUrl.searchParams.set("bearing", `${kiosk.heading || ""}`);
            kioskUrl.searchParams.set("zoom", `${store.uiState.zoomAfTransformK || ""}`);
            setKioskUrl(kioskUrl.toString());

            if (areLayersEnabled()) {
                store.layerStore.updateVisibility(`${store.uiState.kioskSetupData.z}`, true);
            }

            setSuccessMsg("Saved");
            setStep("copy");
        } catch (err) {
            console.error(err);
            setErrorMsg("Saving failed");
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

        setErrorMsg("");
        setSuccessMsg("");
        setPending(true);

        try {
            await navigator.clipboard.writeText(kioskUrl);
            setSuccessMsg("Copied to clipboard");
        } catch (err) {
            console.error(err);
            setErrorMsg("Could not copy to clipboard");
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
            const rect = store.layerStore.rectangle || svgArea;
            const newKiosk = {
                key,
                x: rect?.cx || 0,
                y: rect?.cy || 0,
                z: areLayersEnabled() ? store.layerStore.floors.find((f) => f.active)?.name : null,
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

    const title = useMemo(() => {
        switch (step) {
            case "auth":
                return "Passcode required";

            case "copy":
                return "Kiosk URL";

            case "confirmDeletion":
                return `${"Delete kiosk"} ${store.uiState.kioskSetupData?.key}?`;

            default:
                return "Add or Edit a kiosk";
        }
    }, [step, store.uiState.kioskSetupData]);

    const auth = useCallback(
        debounce((passcode: string) => {
            const fn = async () => {
                try {
                    setErrorMsg("");
                    setSuccessMsg("");

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
                        setErrorMsg("Login failed");
                        return;
                    }

                    sessionStorage.setItem(KIOSK_SETUP_TOKEN, respJson.token);
                    setStep("edit");
                } catch (err) {
                    console.error(err);
                    setErrorMsg("Login failed");
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

            setSuccessMsg("Kiosk deleted");
            exit();
        } catch (err) {
            console.error(err);
            setErrorMsg("Deletion failed");
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
                                <label
                                    className={cn({
                                        "efp-kiosk-setup-key": true,
                                        "efp-kiosk-setup-key__one-column": step === "auth" || step === "copy",
                                    })}
                                >
                                    <input
                                        name="passcode"
                                        placeholder="Enter passcode"
                                        defaultValue=""
                                        disabled={pending}
                                        onInput={(e) => setPasscode((e.target as HTMLInputElement).value?.trim())}
                                        aria-label="Enter passcode"
                                    />
                                </label>
                            </p>
                        )}

                        {step === "edit" && (
                            <>
                                <p className="efp-kiosk-setup-info">
                                    Click to <strong>set/move</strong> kiosk, enter kiosk number to edit.
                                    <br />
                                    <strong>Zoom and center</strong> the map before saving.
                                </p>

                                <label className="efp-kiosk-setup-key">
                                    <strong>Kiosk number:</strong>
                                    <input
                                        name="key"
                                        type="number"
                                        min={1}
                                        max={99}
                                        placeholder="From 1 to 99"
                                        value={store.uiState.kioskSetupData?.key || ""}
                                        onChange={(e) => {
                                            const input = e.target as HTMLInputElement;
                                            input.value = input.value.replace(/\D/g, "");
                                            changeKey(input.value);
                                        }}
                                    />
                                </label>

                                <label className="efp-kiosk-setup-rotate">
                                    <strong>Rotate Icon:</strong>
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

                                <p className="efp-kiosk-setup-info">Use the slider to adjust the icon's angle.</p>
                            </>
                        )}

                        {step === "copy" && (
                            <p>
                                <a href={kioskUrl} className="efp-kiosk-setup-link" target="_blank" rel="noopener noreferrer">
                                    {kioskUrl}
                                </a>
                            </p>
                        )}

                        <div
                            className={cn({
                                "efp-kiosk-setup-actions": true,
                                "efp-kiosk-setup-actions__one-column": step === "auth" || step === "copy",
                            })}
                        >
                            {step === "auth" && (
                                <Button
                                    size="md"
                                    text="Log in"
                                    disabled={!passcode || pending}
                                    onClick={() => auth(passcode)}
                                />
                            )}

                            {step === "edit" && (
                                <Button
                                    size="md"
                                    text="Save & Copy URL"
                                    disabled={disabled}
                                    onClick={e => {
                                        e.preventDefault();
                                        save();
                                    }}
                                />
                            )}

                            {step === "edit" && <Button variant="gray-border" size="md" text="Clear" onClick={clear} />}

                            {step === "copy" && <Button variant="gray" size="md" text="Close" onClick={exit} />}

                            {step === "edit" && isKioskExist && (
                                <Button
                                    variant="gray"
                                    size="md"
                                    text="Delete"
                                    disabled={pending}
                                    onClick={() => setStep("confirmDeletion")}
                                />
                            )}

                            {step === "confirmDeletion" && (
                                <>
                                    <Button size="md" text="Delete" onClick={deleteKiosk} />
                                    <Button variant="gray" size="md" text="Cancel" onClick={exit} />
                                </>
                            )}
                        </div>
                    </Alert>
                </div>
            )}

            {errorMsg && (
                <div className="efp-kiosk-setup-message">
                    <Alert variant="error" closable title={errorMsg} inline onClose={() => setErrorMsg("")}>
                        An error occurred. Please try again.
                    </Alert>
                </div>
            )}

            {successMsg && (
                <div className="efp-kiosk-setup-message">
                    <Alert variant="success" closable title={successMsg} inline onClose={() => setSuccessMsg("")} />
                </div>
            )}
        </Suspense>
    );
});

export default KioskSetup;
