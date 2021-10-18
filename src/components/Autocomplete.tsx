import React from "react";
import "./Autocomplete.scss";

export interface AutocompleteProps {
    options: [string];
    onChange: (val: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({}) => {
    return (
        <>
            <input type="text" />
        </>
    );
};

export default Autocomplete;
