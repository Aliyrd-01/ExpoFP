import { uiState } from "../store";
import { useMemo } from "react";
import { getRenderTargetFromRoot } from "./getRenderTargetFromRoot";

export function useRenderTarget(): HTMLElement | null {
    return useMemo(() => {
        if (typeof window === "undefined") return null;
        return getRenderTargetFromRoot(uiState.rootElement);
    }, [uiState.rootElement]);
}
