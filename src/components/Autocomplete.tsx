import React, { useRef, useState } from "react";
import classNames from "classnames";
import useOutsideClick from "../utils/useOutsideClick";
import "./Autocomplete.scss";

export interface AutocompleteProps {
    placeholder: string;
    options: Array<string>;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ placeholder, options }) => {
    const ref = useRef();
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [activeOptionIndex, setActiveOptionIndex] = useState(null);
    const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
    const [input, setInput] = useState("");

    useOutsideClick(ref, () => {
        if (showOptionsDropdown) setShowOptionsDropdown(false);
    });

    const getActiveOptionIndexByValue = (value) => {
        return options.findIndex((option) => option === value);
    };

    const onClickOption = (event) => {
        setFilteredOptions([]);
        setInput(event.target.innerText);
        setActiveOptionIndex(getActiveOptionIndexByValue(event.target.innerText));
        setShowOptionsDropdown(false);
    };

    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            if (filteredOptions.length) {
                const nextActiveIndex = getActiveOptionIndexByValue(filteredOptions[activeOptionIndex]);
                setActiveOptionIndex(nextActiveIndex);
                setInput(options[nextActiveIndex]);
            } else {
                setActiveOptionIndex(activeOptionIndex);
                setInput(options[activeOptionIndex]);
            }
            setShowOptionsDropdown(false);
        } else if (event.keyCode === 38) {
            if (activeOptionIndex === 0) return;
            setActiveOptionIndex(activeOptionIndex - 1);
        } else if (event.keyCode === 40) {
            activeOptionIndex !== null ? setActiveOptionIndex(activeOptionIndex + 1) : setActiveOptionIndex(0);
        }
    };

    const onFocus = () => {
        setShowOptionsDropdown(true);
    };

    const onChange = (event) => {
        const userInput = event.target.value;
        const result = options.filter((option) => option.toLowerCase().indexOf(userInput.toLowerCase()) > -1);

        setInput(event.target.value);
        setFilteredOptions(result.length ? result : options);
        setActiveOptionIndex(null);
    };

    const showOptions = () => {
        const allOptions = filteredOptions.length ? filteredOptions : options;
        return (
            <ul>
                {allOptions.map((option, index) => {
                    let activeClass;
                    if (index === activeOptionIndex) activeClass = "is-active";
                    return (
                        <li key={option} className={activeClass} onClick={onClickOption}>
                            {option}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <>
            <div ref={ref} className={classNames("autocomplete", { "is-open": showOptionsDropdown })}>
                <input
                    className={"autocomplete__input"}
                    type="text"
                    onChange={onChange}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    value={input}
                    placeholder={placeholder}
                />
                <div className="autocomplete__options">{showOptions()}</div>
            </div>
        </>
    );
};

export default Autocomplete;
