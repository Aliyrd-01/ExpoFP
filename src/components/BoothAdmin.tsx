import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import { RegularBooth } from "../core/Booth";
import { AdminExhibitorInfo } from "../services/AdminService";
import logger from "../tools/logger";
// import { RegularBooth } from "../store/BoothStore";
import { useAdminService, useStore } from "../tools/use";
import { useInit } from "../utils/mobx";
import AdminBox from "./AdminBox";
import "./BoothAdmin.scss";

const BoothAdmin: React.FC<{ booth: RegularBooth }> = ({ booth }) => {
    const store = useStore();
    const adminService = useAdminService();

    const s = useLocalStore(() => ({
        loading: true,
        saving: false,
        exhibitors: [] as AdminExhibitorInfo[],
        originalAdminNotes: "" as string,
        adminNotes: "" as string,
        originalExhibitorId: null as number,
        exhibitorId: null as number,
        get dirty() {
            return this.adminNotes !== this.originalAdminNotes || this.exhibitorId !== this.originalExhibitorId;
        }
    }));

    useInit(() => {
        logger.log("Init BoothAdmin of ", booth.name);
        s.saving = false;
        s.loading = true;
        s.exhibitors = [];

        (async function init() {
            s.exhibitors = await adminService.listExhibitors();
            const b = await adminService.getBooth(booth.name);
            s.originalExhibitorId = s.exhibitorId = b.exhibitors[0] || null;
            s.originalAdminNotes = s.adminNotes = b.adminNotes || "";
            s.loading = false;
        })();
    });

    async function handleSave() {
        s.saving = true;
        if (s.adminNotes !== s.originalAdminNotes) await adminService.updateBooth(booth.name, { adminNotes: s.adminNotes });
        const exhibitorChanged = s.exhibitorId !== s.originalExhibitorId;
        const exhibitorIds = s.exhibitorId ? [s.exhibitorId] : [];
        if (exhibitorChanged) await adminService.setBoothExhibitors(booth.name, exhibitorIds);
        s.originalAdminNotes = s.adminNotes;
        s.originalExhibitorId = s.exhibitorId;
        s.saving = false;
        if (exhibitorChanged) {
            store.setBoothExhibitors(booth.name, exhibitorIds);
        }
        alert("Changes saved");
    }

    function handleAdminNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        s.adminNotes = e.target.value;
    }

    function handleExhibitorChange(e: React.ChangeEvent<HTMLSelectElement>) {
        s.exhibitorId = parseInt(e.target.value) || null;
    }

    return useObserver(() => {
        let content: JSX.Element | string;
        if (s.loading) {
            content = "Loading...";
        } else {
            const options = s.exhibitors.map(x => (
                <option value={x.id} key={x.id}>
                    {x.name}
                </option>
            ));
            content = (
                <>
                    <select onChange={handleExhibitorChange} value={s.exhibitorId || ""}>
                        <option>No exhibitor</option>
                        {options}
                    </select>
                    <textarea
                        placeholder={`Admin notes for ${booth.name}`}
                        onChange={handleAdminNotesChange}
                        value={s.adminNotes}
                    ></textarea>
                    {s.dirty ? (
                        <button onClick={handleSave} disabled={s.saving}>
                            {s.saving ? "Saving..." : `Save ${booth.name}`}
                        </button>
                    ) : null}
                </>
            );
        }
        return (
            <AdminBox className="booth-admin" title={`Rebooking - ${booth.name}`}>
                {content}
            </AdminBox>
        );
    });
};

export default BoothAdmin;
