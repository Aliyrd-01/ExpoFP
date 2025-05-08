import React, { useEffect, useState } from "react";
import Button from "./Button";
import { t } from "../utils/i18n";
import "./RebookingNotes.scss";

export type RebookingNotesMode = "default" | "add" | "edit";
export interface RebookingNotesProps {
    state?: "default" | "edit";
    value?: string;
    date?: string;
    onClickSave?: (val: string) => void;
}

const RebookingNotes: React.FC<RebookingNotesProps> = ({ state = "default", value, date, onClickSave }) => {
    const [internalValue, setInternalValue] = useState<string>(value);
    //const [currentState, setCurrentState] = useState<RebookingNotesMode>(state);
    //const [bufValue, setBufValue] = useState<string>("");

    useEffect(() => {
        //setCurrentState("edit");
        setInternalValue(value);
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => setInternalValue(event.target.value as string);
    const handleEdit = () => {
        setInternalValue(value);
        // setBufValue(internalValue);
        // setCurrentState("edit");
    };
    const handleSave = () => {
        const val = internalValue;
        onClickSave(val);
        setInternalValue(val);
        //setCurrentState("default");
    };
    // const handleCancel = () => {
    //     setInternalValue(bufValue);
    //     setCurrentState("default");
    // };

    return (
        <div className="rebooking-notes">
            <div className="rebooking-notes__view-header">
                <strong id="note-label">{t("Note")}</strong>
            </div>

            <div className="rebooking-notes__edit">
                <div className="rebooking-notes__val">
                    <textarea
                        id="rebooking-notes"
                        name="rebooking-notes"
                        value={internalValue}
                        onChange={handleChange}
                        aria-labelledby="note-label"
                    />
                </div>
                <div className="rebooking-notes__buttons">
                    <Button inline onClick={handleSave} disabled={value === internalValue} aria-label={t("Save rebooking note")}>
                        {t("Save note")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RebookingNotes;
