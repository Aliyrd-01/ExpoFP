import { useObserver } from "mobx-react-lite";
import { Language } from "../store/LanguageStore";
import React from "react";

export default function LanguageRow({ item }: { item: Language }) {
    return useObserver(() => {
        return <>{item.name}</>;
    });
}