import React from "react";
import { observer } from "mobx-react-lite";

import store from "../store";
import { Language } from "../store/LanguageStore";

import { Radio } from "./";

import "./LanguageRow.scss";

const LanguageRow = observer(({ item }: { item: Language }) => {
    return (
        <Radio
            label={item.name}
            value={item.id}
            checked={item.selected}
            className="language-row"
            aria-label={`Change language to ${item.name}`}
            onChange={() => store.languageStore.changeLanguage(item.id)}
        />
    );
});

export default LanguageRow;
