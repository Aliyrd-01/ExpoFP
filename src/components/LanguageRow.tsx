import { Language } from "../store/LanguageStore";
import React from "react";
import store from "../store";
import { useObserver } from "mobx-react-lite";

export default function LanguageRow({ item }: { item: Language }) {
    return useObserver(() => {
        return (
            <div
                onClick={() => {
                    store.languageStore.changeLanguage(item.id);
                }}
            >
                {item.name}
            </div>
        );
    });
}
