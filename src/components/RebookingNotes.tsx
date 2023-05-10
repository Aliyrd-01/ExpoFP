import React, { useState } from "react";
import "./RebookingNotes.scss";
import Button from "./Button";

export type RebookingNotesMode = "default" | "add" | "edit";
export interface RebookingNotesProps {
    state?: "default" | "edit";
    value?: string;
    date?: string;
    onClickSave?: (val: string) => void;
}

const RebookingNotes: React.FC<RebookingNotesProps> = ({ state = "default", value, date, onClickSave }) => {
    const [internalValue, setInternalValue] = useState<string>(value);
    const [currentState, setCurrentState] = useState<RebookingNotesMode>(state);
    const [bufValue, setBufValue] = useState<string>("");

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => setInternalValue(event.target.value as string);
    const handleEdit = () => {
        setBufValue(internalValue);
        setCurrentState("edit");
    };
    const handleSave = () => {
        onClickSave(internalValue);
        setCurrentState("default");
    };
    const handleCancel = () => {
        setInternalValue(bufValue);
        setCurrentState("default");
    };

    return internalValue || currentState !== "default" ? (
        <div className="rebooking-notes">
            <div className="rebooking-notes__view-header">
                <strong>Note</strong>
                <span>{date && currentState !== "edit" && <span>{date}</span>}</span>
            </div>
            {currentState === "default" ? (
                <div className="rebooking-notes__view">
                    <div className="rebooking-notes__view-text">{internalValue}</div>
                    <Button inline={true} onClick={handleEdit}>
                        Edit note
                    </Button>
                </div>
            ) : (
                <div className="rebooking-notes__edit">
                    <div className="rebooking-notes__val">
                        <textarea value={internalValue} name="rebooking-notes" id="rebooking-notes" onChange={handleChange} />
                    </div>
                    <div className="rebooking-notes__buttons">
                        <Button inline={true} variant="gray" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button inline={true} onClick={handleSave}>
                            Save note
                        </Button>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className="rebooking-notes">
            <Button inline={true} onClick={() => setCurrentState("edit")}>
                Add note
            </Button>
        </div>
    );
};

export default RebookingNotes;
