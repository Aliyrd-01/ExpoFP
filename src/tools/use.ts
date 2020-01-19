import { useContext } from "react";
import { FpContext } from "../floorplan.ready";

export function useFp() {
    return useContext(FpContext);
}

export function useStore() {
    return useFp().store;
}

export function useUiState() {
    return useStore().uiState;
}

export function useExhibitorStore() {
    return useStore().exhibitorStore;
}

export function useCategoryStore() {
    return useStore().categoryStore;
}
