import { KIOSK_SLUG_PREFIX } from "../constants";

export function saveKioskId(id: string) {
    localStorage.setItem(KIOSK_SLUG_PREFIX, id);
}

export function clearKioskId() {
    localStorage.removeItem(KIOSK_SLUG_PREFIX);
}
