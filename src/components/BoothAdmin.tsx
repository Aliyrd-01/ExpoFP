import { useLocalStore, useObserver } from "mobx-react-lite";
import React from "react";
import "./BoothAdmin.scss";
import { Booth, RegularBooth } from "../store/BoothStore";

const BoothAdmin: React.FC<{ booth: RegularBooth }> = ({ booth }) => {
    return useObserver(() => {
        return (
            <div className="booth-admin">
                <div className="booth-admin__title">Re-booking</div>
                <label>Set exhibitor:</label>

                <select>
                    <option></option>
                    <option>Exhibitor 1231231212312123121231212312123121231212312</option>
                </select>
            </div>
        );
    });
};

export default BoothAdmin;
