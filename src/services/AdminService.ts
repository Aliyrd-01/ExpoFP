import FloorPlanReady from "../floorplan.ready";

const storageKey = "apiToken";

export default function createAdminServiceIfNeeded(fp: FloorPlanReady): AdminService {
    // check the URL, if there's a token - return AdminService
    const authMatch = window.location.search.match(/ea81h(.+)97ab537/);
    const token = authMatch ? authMatch[1] : sessionStorage.getItem(storageKey);
    if (!token) return null;
    sessionStorage.setItem(storageKey, token);
    fp.store.uiState.showAdminUi = true;

    return new AdminService(fp, token);
}

export class AdminService {
    constructor(private readonly fp: FloorPlanReady, private readonly token: string) {}

    async setBoothExhibitors(id: number, ids: number[]) {
        // call api
    }

    private async callApi<T>(method: string, payload: any): Promise<T> {
        return null;
    }
}
