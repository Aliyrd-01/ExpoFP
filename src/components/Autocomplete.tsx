import React from "react";
import "./Autocomplete.scss";

export interface AutocompleteProps {
    placeholder: string;
    options: [string];
    onChange: (val: string) => void;
}

const SuggestionsList = (list) => {
    return (
        <ul>
            <li></li>
        </ul>
    );
};

const onChange = (e) => {
    const userInput = e.target.value;
};

const Autocomplete: React.FC<AutocompleteProps> = ({ placeholder, options }) => {
    return (
        <>
            <div className="autocomplete">
                <input className="autocomplete__input" type="text" />
                <div className="autocomplete__suggestions">{SuggestionsList(options)}</div>
            </div>
        </>
    );
};

export default Autocomplete;
