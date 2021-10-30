import classNames from "classnames";
import React, { useRef, useState } from "react";
import useOnClickOutside from "../utils/useOnClickOutside";
import "./Autocomplete.scss";

export interface OptionObject {
    value: string;
    label: string;
}
export interface AutocompleteProps {
    placeholder: string;
    options: string[] | (OptionObject | any)[];
    value?: string;
    onChange: (value: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ placeholder, options, value, onChange }) => {
    const isArrayOfObjects = (array) => {
        return Array.isArray(array) && array.some((el) => typeof el === "object") ? true : false;
    };

    const getActiveOptionIndexByValue = (value, isObject = false) => {
        return isObject ? options.findIndex((option) => option.value === value) : options.findIndex((option) => option === value);
    };

    const refAutocomplete = useRef(null);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [input, setInput] = useState(value || "");
    const [objectsMode, setObjectsMode] = useState(isArrayOfObjects(options));
    const [activeOptionIndex, setActiveOptionIndex] = useState(
        objectsMode ? getActiveOptionIndexByValue(value, true) : getActiveOptionIndexByValue(value) || null
    );
    const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

    useOnClickOutside(refAutocomplete, () => setShowOptionsDropdown(false));

    const changeValue = (value = "") => {
        setInput(value);
        onChange(value);
    };

    const onClickOption = (event) => {
        setFilteredOptions([]);
        if (objectsMode) {
            const dataValue = event.target.getAttribute("data-value");
            changeValue(dataValue);
            setActiveOptionIndex(getActiveOptionIndexByValue(dataValue, true));
        } else {
            changeValue(event.target.innerText);
            setActiveOptionIndex(getActiveOptionIndexByValue(event.target.innerText));
        }
        setShowOptionsDropdown(false);
    };

    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            if (!input) return;
            if (filteredOptions.length) {
                const nextActiveIndex = getActiveOptionIndexByValue(
                    filteredOptions[activeOptionIndex],
                    objectsMode ? true : false
                );
                changeValue(objectsMode ? options[nextActiveIndex]["value"] : options[nextActiveIndex]);
                setActiveOptionIndex(nextActiveIndex);
            } else {
                changeValue(objectsMode ? options[activeOptionIndex]["value"] : options[activeOptionIndex]);
                setActiveOptionIndex(activeOptionIndex);
            }
            setShowOptionsDropdown(false);
        } else if (event.keyCode === 38) {
            if (!showOptionsDropdown || activeOptionIndex === 0) return;
            setActiveOptionIndex(activeOptionIndex - 1);
        } else if (event.keyCode === 40) {
            if (!showOptionsDropdown) setShowOptionsDropdown(true);
            else activeOptionIndex !== null ? setActiveOptionIndex(activeOptionIndex + 1) : setActiveOptionIndex(0);
        }
    };

    const onFocus = () => {
        setShowOptionsDropdown(true);
    };

    const onInputChange = (event) => {
        const userInput = event.target.value;
        let result = [];
        if (objectsMode) result = options.filter((option) => option.label.toLowerCase().indexOf(userInput.toLowerCase()) > -1);
        else result = options.filter((option) => option.toLowerCase().indexOf(userInput.toLowerCase()) > -1);

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
                    if (objectsMode)
                        return (
                            <li key={index} className={activeClass} data-value={option.value} onClick={onClickOption}>
                                {option.label}
                            </li>
                        );
                    else
                        return (
                            <li key={index} className={activeClass} onClick={onClickOption}>
                                {option}
                            </li>
                        );
                })}
            </ul>
        );
    };

    return (
        <>
            <div ref={refAutocomplete} className={classNames("autocomplete", { "is-open": showOptionsDropdown })}>
                <div className={"autocomplete__inner"}>
                    <input
                        className="autocomplete__input"
                        type="text"
                        onChange={onInputChange}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        value={input}
                        placeholder={placeholder}
                    />
                    <div className="autocomplete__options">{showOptions()}</div>
                </div>
            </div>
        </>
    );
};

export default Autocomplete;
