import React, { useState } from "react";
import classNames from "classnames";
import "./Autocomplete.scss";

export interface AutocompleteProps {
    placeholder: string;
    options: Array<string>;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ placeholder, options }) => {
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [activeOptionIndex, setActiveOptionIndex] = useState(0);
    const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
    const [input, setInput] = useState("");

    const onClickOption = (event) => {
        setFilteredOptions([]);
        setInput(event.target.innerText);
        setActiveOptionIndex(0);
        setShowOptionsDropdown(false);
    };

    const onFocus = () => {
        setShowOptionsDropdown(true);
    };

    const onChange = (event) => {
        const userInput = event.target.value;
        const unlinked = options.filter((option) => option.toLowerCase().indexOf(userInput.toLowerCase()) > -1);

        setInput(event.target.value);
        setFilteredOptions(unlinked);
        setActiveOptionIndex(0);
    };

    const showOptions = (optionsList) => {
        return (
            <ul>
                {optionsList.map((option, index) => {
                    return (
                        <li key={option} onClick={onClickOption}>
                            {option}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <>
            <div className={classNames("autocomplete", { "is-open": showOptionsDropdown })}>
                <input
                    className={"autocomplete__input"}
                    type="text"
                    onChange={onChange}
                    onFocus={onFocus}
                    value={input}
                    placeholder={placeholder}
                />
                <div className="autocomplete__options">
                    {filteredOptions.length ? showOptions(filteredOptions) : showOptions(options)}
                </div>
            </div>
        </>
    );
};

export default Autocomplete;
