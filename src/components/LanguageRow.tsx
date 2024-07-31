import { Language } from "../store/LanguageStore";
import React from "react";
import store from "../store";
import { useObserver } from "mobx-react-lite";
import Radio from "./Radio";

export default function LanguageRow({ item }: { item: Language }) {
    return useObserver(() => (
        <Radio
            label={item.name}
            value={item.id}
            checked={item.selected}
            onChange={() => store.languageStore.changeLanguage(item.id)}
        />
    ));
}
