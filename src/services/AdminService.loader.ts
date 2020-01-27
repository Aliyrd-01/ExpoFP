import FloorPlanReady from "../floorplan.ready";
import AdminServiceType from "./AdminService";

const storageKey = "apiToken";

export default async function loadAdminServiceIfNeeded(fp: FloorPlanReady): Promise<AdminServiceType> {
    // check the URL, if there's a token - return AdminService
    const authMatch = window.location.search.match(/ea81h(.+)97ab537/);
    const token = authMatch ? authMatch[1] : sessionStorage.getItem(storageKey);
    if (!token) return null;
    sessionStorage.setItem(storageKey, token);

    const AdminServiceClass = await (await import(/* webpackChunkName: "admin" */ "./AdminService")).default;
    const adminService = new AdminServiceClass(fp, token);

    fp.store.uiState.showAdminUi = true;

    return adminService;
}
