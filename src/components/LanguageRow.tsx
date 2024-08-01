import { Language } from "../store/LanguageStore";
import React from "react";
import store from "../store";
import { observer } from "mobx-react-lite";
import Radio from "./Radio";

const LanguageRow = observer(({ item }: { item: Language }) => {
    return (
        <Radio
            label={item.name}
            value={item.id}
            checked={item.selected}
            onChange={() => store.languageStore.changeLanguage(item.id)}
        />
    );
});

export default LanguageRow;