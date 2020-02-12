import FloorPlanReady from "../floorplan.ready";
import logger from "../tools/logger";
import { sortByName } from "../utils";

export interface AdminExhibitorInfo {
    id: number;
    name: string;
}

export interface AdminBoothFields {
    adminNotes: string;
}

export interface AdminBooth extends AdminBoothFields {
    name: string;
    exhibitors: number[];
}

export default class AdminService {
    private eventId: number;
    constructor(private readonly fp: FloorPlanReady, private readonly token: string) {}

    async listExhibitors() {
        await this.ensureEventId();
        const ar = await this.callApi<AdminExhibitorInfo[]>("list-exhibitors", {
            eventId: this.eventId
        });
        sortByName(ar);
        return ar;
    }

    async getBooth(name: string) {
        await this.ensureEventId();
        return await this.callApi<AdminBooth>("get-booth", {
            eventId: this.eventId,
            name
        });
    }

    async updateBooth(name: string, fields: AdminBoothFields) {
        await this.ensureEventId();
        await this.callApi<void>("update-booth", {
            eventId: this.eventId,
            name,
            ...fields
        });
    }

    private async ensureEventId() {
        if (this.eventId) return;
        type Res = [{ id: number; key: string }];
        const events = await this.callApi<Res>("list-events");
        this.eventId = events.find(x => x.key === this.fp.eventId)?.id;
        logger.log("Server event id:", this.eventId);
    }

    async setBoothExhibitors(name: string, exhibitors: number[]): Promise<void> {
        await this.ensureEventId();
        await this.callApi<void>("set-booth-exhibitors", {
            eventId: this.eventId,
            name,
            exhibitors
        });
    }

    private async callApi<T>(method: string, payload: any = {}): Promise<T> {
        const realToken = this.token
            .split("")
            .reverse()
            .join("");

        payload.token = realToken;

        const res = await fetch(`https://expofp.com/api/v1/${method}`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify(payload)
        });

        const text = await res.text();
        if (!text) return null;
        let result = JSON.parse(text);

        logger.log("API call", res, method, result);
        return result;
    }
}

// interface
