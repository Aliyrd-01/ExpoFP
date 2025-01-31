import { MESSAGE_CACHE, MESSAGE_REFRESH } from "./constants";

export class OfflineManager {
    private message = async (msg: { type: string, payload?: string[] }) => {
        if (!("serviceWorker" in navigator)) return;

        const send = () => {
            navigator.serviceWorker.controller?.postMessage(msg);
        };

        send();

        if (!navigator.serviceWorker.controller) {
            navigator.serviceWorker.addEventListener("controllerchange", send, { once: true });
        }
    }

    private register = async (swUrl: string, scope: string) => {
        if (!("serviceWorker" in navigator)) return;

        await navigator.serviceWorker.register(swUrl, { scope });
        await navigator.serviceWorker.ready;
    }

    private unregister = async (scope: string) => {
        if (!("serviceWorker" in navigator)) return;

        const registration = await navigator.serviceWorker.getRegistration(scope);
        await registration?.unregister();
    }

    public init = async (currentScriptSrc: string) => {
        const swUrl = currentScriptSrc ? new URL("sw.js", currentScriptSrc).href : "sw.js";
        const command = new URLSearchParams(window.location.search).get("__sw");
        const scope = "/";

        if (command === "1") {
            await this.register(swUrl, scope);
        } else if (command === "0") {
            await this.unregister(scope);
        }
    }

    public cache = (payload: string[]) => {
        this.message({ type: MESSAGE_CACHE, payload });
    };

    public refreshCache = () => {
        this.message({ type: MESSAGE_REFRESH });
    };
}
