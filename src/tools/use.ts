import { useContext } from "react";
import { FpContext } from "../floorplan.ready";

export function useFp() {
    return useContext(FpContext);
}

export function useData() {
    return useFp().data;
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

export function useBoothStore() {
    return useStore().boothStore;
}

export function useCategoryStore() {
    return useStore().categoryStore;
}

export function useAdminService() {
    return useFp().adminService;
}
