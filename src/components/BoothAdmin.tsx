import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect } from "react";
import { RegularBooth } from "../core/Booth";
import { AdminExhibitorInfo } from "../services/AdminService";
// import { RegularBooth } from "../store/BoothStore";
import { useAdminService } from "../tools/use";
import AdminBox from "./AdminBox";
import "./BoothAdmin.scss";

const BoothAdmin: React.FC<{ booth: RegularBooth }> = ({ booth }) => {
    // const exhibitorStore = useExhibitorStore();
    const adminService = useAdminService();
    // const notesTextarea = useRef<HTMLTextAreaElement>();
    // const exhibitorSelect = useRef<HTMLSelectElement>();
    // const exhibitorOptions = exhibitorStore.exhibitors.map(x => (
    //     <option value={x.id} key={x.id}>
    //         {x.name}
    //     </option>
    // ));

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

    useEffect(() => {
        console.log("zzz", booth);
        s.loading = true;
        s.exhibitors = [];
        // s.adminNotes = s.originalAdminNotes = "";
        // s.originalExhibitorId = s.exhibitorId = booth.exhibitors.map(x => x.id)[0] || null;
        let disposed = false;
        (async function init() {
            s.exhibitors = await adminService.listExhibitors();
            const b = await adminService.getBooth(booth.name);
            if (disposed) return;
            s.originalExhibitorId = s.exhibitorId = b.exhibitors[0] || null;
            s.originalAdminNotes = s.adminNotes = b.adminNotes || "";
            s.loading = false;
        })();
        return () => {
            disposed = true;
        };
    }, [booth]);

    async function handleSave() {
        s.saving = true;
        if (s.adminNotes !== s.originalAdminNotes) await adminService.updateBooth(booth.name, { adminNotes: s.adminNotes });
        if (s.exhibitorId !== s.originalExhibitorId)
            await adminService.setBoothExhibitors(booth.name, s.exhibitorId ? [s.exhibitorId] : []);
        s.originalAdminNotes = s.adminNotes;
        s.originalExhibitorId = s.exhibitorId;
        s.saving = false;
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
                    {/* className={s.dirty ? "" : "-disabled"}  */}
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
