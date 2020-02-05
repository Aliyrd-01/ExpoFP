import { useObserver } from "mobx-react-lite";
import React from "react";
import { RegularBooth } from "../core/Booth";
import { Exhibitor } from "../store/ExhibitorStore";
import { useAdminService } from "../tools/use";
import AdminBox from "./AdminBox";
import "./ExhibitorAdmin.scss";

function removeElementFromArray<T>(ar: T[], element: T) {
    let index: number;
    while ((index = ar.indexOf(element)) !== -1) {
        ar.splice(index, 1);
    }
}

const ExhibitorAdmin: React.FC<{ exhibitor: Exhibitor }> = ({ exhibitor }) => {
    const adminService = useAdminService();

    async function handleRemoveClick(booth: RegularBooth) {
        const newBoothExhibitors = booth.exhibitorsObj.filter(x => x !== exhibitor).map(x => x.id);
        if (!window.confirm(`Are you sure want to remove "${exhibitor.name}" from ${booth.name}?`)) {
            return;
        }
        await adminService.setBoothExhibitors(booth.name, newBoothExhibitors);
        removeElementFromArray(booth.exhibitors, exhibitor.id);
        removeElementFromArray(exhibitor.booths, booth);
        alert(`${booth.name} removed from ${exhibitor.name}`);
    }

    return useObserver(() => {
        return (
            <AdminBox className="exhibitor-admin">
                {exhibitor.booths.map(b => (
                    <button onClick={() => handleRemoveClick(b)} key={b.id}>
                        Remove from {b.name}
                    </button>
                ))}
            </AdminBox>
        );
    });
};

export default ExhibitorAdmin;
