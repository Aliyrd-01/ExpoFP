import React, { useEffect, useState } from "react";
import Button from "./Button";
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
                <strong>Note</strong>
                {/* <span>{date && currentState !== "edit" && <span>{date}</span>}</span> */}
            </div>

            <div className="rebooking-notes__edit">
                <div className="rebooking-notes__val">
                    <textarea value={internalValue} name="rebooking-notes" id="rebooking-notes" onChange={handleChange} />
                </div>
                <div className="rebooking-notes__buttons">
                    <Button inline={true} onClick={handleSave} disabled={value === internalValue}>
                        Save note
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RebookingNotes;
