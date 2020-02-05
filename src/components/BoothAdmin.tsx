import { useObserver } from "mobx-react-lite";
import React, { ChangeEvent } from "react";
import { RegularBooth } from "../core/Booth";
// import { RegularBooth } from "../store/BoothStore";
import { useAdminService, useExhibitorStore } from "../tools/use";
import AdminBox from "./AdminBox";
import "./BoothAdmin.scss";

const BoothAdmin: React.FC<{ booth: RegularBooth }> = ({ booth }) => {
    const exhibitorStore = useExhibitorStore();
    const adminService = useAdminService();
    const exhibitorOptions = exhibitorStore.exhibitors.map(x => (
        <option value={x.id} key={x.id}>
            {x.name}
        </option>
    ));

    async function handleExhibitorChange(e: ChangeEvent<HTMLSelectElement>) {
        const exhibitorId = e.target.value ? parseInt(e.target.value) : null;
        const exhibitor = exhibitorId ? exhibitorStore.exhibitorById.get(exhibitorId) : null;
        await adminService.setBoothExhibitors(booth.name, [exhibitorId]);
        alert(`Exhibitor set for booth ${booth.name}:  ${exhibitor?.name || "Empty"}`);
    }

    return useObserver(() => {
        return (
            <AdminBox className="booth-admin">
                <select onChange={handleExhibitorChange}>
                    <option>Select exhibitor</option>
                    {exhibitorOptions}
                </select>
            </AdminBox>
        );
    });
};

export default BoothAdmin;
