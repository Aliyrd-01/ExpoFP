import classNames from "classnames";
import React, { useRef, useState } from "react";
import useOnClickOutside from "../utils/useOnClickOutside";
import "./Autocomplete.scss";

export interface OptionObject {
    value: string; // must be unique
    label: string;
}
export interface AutocompleteProps {
    placeholder: string;
    options: string[] | (OptionObject | any)[];
    value?: string;
    showClear?: boolean;
    onChange: (value: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ placeholder, options, value, showClear = false, onChange }) => {
    const isArrayOfObjects = (array) => {
        return Array.isArray(array) && array.some((el) => typeof el === "object") ? true : false;
    };

    const getActiveOptionIndexByValue = (value, isObject = false) => {
        return isObject ? options.findIndex((option) => option.value === value) : options.findIndex((option) => option === value);
    };

    const refAutocomplete = useRef(null);
    const refSearchInput = useRef(null);
    const [objectsMode] = useState(isArrayOfObjects(options));
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [input, setInput] = useState(
        objectsMode && value ? options[getActiveOptionIndexByValue(value, true)]?.label : value || ""
    );
    const [activeOptionIndex, setActiveOptionIndex] = useState(
        objectsMode ? getActiveOptionIndexByValue(value, true) : getActiveOptionIndexByValue(value) || null
    );
    const [focusOptionIndex, setFocusOptionIndex] = useState(activeOptionIndex);
    const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    useOnClickOutside(refAutocomplete, () => setShowOptionsDropdown(false));

    const changeValue = (value = "") => {
        if (objectsMode && value) {
            const activeOption = options[getActiveOptionIndexByValue(value, true)];
            setInput(activeOption.label);
        } else setInput(value);
        setSearchValue("");
        setFilteredOptions([]);
        onChange(value);
    };

    const onClickOption = (event) => {
        setFilteredOptions([]);
        if (objectsMode) {
            const dataValue = event.target.getAttribute("data-value");
            const activeIndex = getActiveOptionIndexByValue(dataValue, true);
            changeValue(dataValue);
            setActiveOptionIndex(activeIndex);
            setFocusOptionIndex(activeIndex);
        } else {
            const activeIndex = getActiveOptionIndexByValue(event.target.innerText);
            changeValue(event.target.innerText);
            setActiveOptionIndex(activeIndex);
            setFocusOptionIndex(activeIndex);
        }
        setSearchValue("");
        setShowOptionsDropdown(false);
    };

    const clear = (setFocus = false) => {
        changeValue("");
        setActiveOptionIndex(null);
        setFocusOptionIndex(null);
        if (setFocus) refSearchInput.current.focus();
    };

    const onFocus = () => {
        setShowOptionsDropdown(true);
    };

    const onBlur = () => {
        if (!input && value) changeValue(value);
    };

    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            if ((!input && focusOptionIndex === null) || (searchValue && focusOptionIndex === null)) return;
            if (filteredOptions.length) {
                const nextActiveIndex = getActiveOptionIndexByValue(
                    objectsMode ? filteredOptions[focusOptionIndex]["value"] : filteredOptions[focusOptionIndex],
                    objectsMode ? true : false
                );
                if (objectsMode) changeValue(options[nextActiveIndex]["value"]);
                else changeValue(options[nextActiveIndex]);
                setActiveOptionIndex(nextActiveIndex);
                setFocusOptionIndex(nextActiveIndex);
            } else {
                if (objectsMode) changeValue(options[focusOptionIndex]["value"]);
                else changeValue(options[focusOptionIndex]);
                setActiveOptionIndex(focusOptionIndex);
            }
            setShowOptionsDropdown(false);
        } else if (event.keyCode === 38) {
            if (!showOptionsDropdown || focusOptionIndex === 0) return;
            setFocusOptionIndex(focusOptionIndex - 1);
        } else if (event.keyCode === 40) {
            if (!showOptionsDropdown) setShowOptionsDropdown(true);
            else {
                const nextFocus = focusOptionIndex + 1;
                if (
                    (options.length && nextFocus >= options.length) ||
                    (filteredOptions.length && nextFocus >= filteredOptions.length)
                )
                    return false;
                else focusOptionIndex !== null ? setFocusOptionIndex(nextFocus) : setFocusOptionIndex(0);
            }
        } else if (event.keyCode === 46) clear(true);
        else if (event.keyCode === 27 && !searchValue) {
            event.preventDefault();
            setShowOptionsDropdown(false);
            refSearchInput.current.blur();
        }
    };

    const onInputChange = (event) => {
        setShowOptionsDropdown(true);
        const searchText = event.target.value;
        let result = [];
        if (objectsMode) result = options.filter((option) => option.label.toLowerCase().indexOf(searchText.toLowerCase()) > -1);
        else result = options.filter((option) => option.toLowerCase().indexOf(searchText.toLowerCase()) > -1);

        setInput(event.target.value);
        setSearchValue(event.target.value);
        setFocusOptionIndex(null);
        setFilteredOptions(searchValue && result.length ? result : []);
    };

    const showOptions = () => {
        const allOptions = filteredOptions.length ? filteredOptions : options;
        if (searchValue && !filteredOptions.length) return <div className="autocomplete__empty">No options</div>;
        else
            return (
                <ul>
                    {allOptions.map((option, index) => {
                        let currentClass;
                        if (index === focusOptionIndex) currentClass = "is-focus";
                        if (!filteredOptions.length && index === activeOptionIndex) currentClass = "is-active";
                        if (objectsMode)
                            return (
                                <li key={index} className={currentClass} data-value={option.value} onClick={onClickOption}>
                                    {option.label}
                                </li>
                            );
                        else
                            return (
                                <li key={index} className={currentClass} onClick={onClickOption}>
                                    {option}
                                </li>
                            );
                    })}
                </ul>
            );
    };
    return (
        <>
            <div
                ref={refAutocomplete}
                className={classNames("autocomplete", {
                    "is-open": showOptionsDropdown,
                    "with-clear": showOptionsDropdown && showClear,
                })}
            >
                <div className={"autocomplete__inner"}>
                    <input
                        type="search"
                        className="autocomplete__input"
                        onChange={onInputChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                        value={input}
                        placeholder={placeholder}
                        ref={refSearchInput}
                    />
                    {showClear && showOptionsDropdown && input ? (
                        <div className="autocomplete__clear" onClick={() => clear(true)}></div>
                    ) : null}
                    {showOptionsDropdown ? <div className="autocomplete__options">{showOptions()}</div> : null}
                </div>
            </div>
        </>
    );
};

export default Autocomplete;
