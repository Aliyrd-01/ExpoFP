import classNames from "classnames";
import { useObserver, useLocalStore } from "mobx-react-lite";
import React, { MouseEvent, useEffect, useRef } from "react";
import store, { uiState } from "../store";
import { Exhibitor } from "../store/ExhibitorStore";
import BookmarkSvg from "./BookmarkSvg";
import "./Exhibitor.scss";
import data from "../data";
import { useAutorun, useReaction } from "../utils/mobx";
import { Category } from "../store/CategoryStore";
import logger from "../tools/logger";

function ExhibitorComponent() {
    const el = useRef<HTMLDivElement>();
    const s = useLocalStore(() => ({
        collapsed: true,

        get exhibitor() {
            return uiState.selectedExhibitor;
        },
        get websiteTrimmed() {
            return this.exhibitor.website ? this.exhibitor.website.replace(/^(http(s?):\/\/)([^/]+)(\/)?$/i, "$3") : "";
        },
        anySocial() {
            return !!["facebook", "instagram", "linkedin", "twitter", "googlePlus", "xing", "youtube"].find(
                s => this.exhibitor[s]
            );
        },
        anyAddress() {
            return !!["address", "address2", "phone1", "website", "email"].find(s => this.exhibitor[s]);
        },
        disableCollapse() {
            return (
                (!this.anySocial && !this.anyAddress) ||
                (uiState.overlayPosition === "left" && (this.exhibitor.description || "").length < 800)
            );
        },
        showEdit() {
            return data.sendLoginLinkUrl && this.sendLinkEmail;
        },
        sendLinkEmail() {
            return this.exhibitor.privateEmail || this.exhibitor.email;
        }
    }));

    useReaction(
        () => s.exhibitor,
        () => {
            el.current.parentElement.scrollTop = 0;
            s.collapsed = true;
        }
    );

    return <></>;

    function handleCategoryClick(c: Category) {
        store.selectCategory(c);
    }

    function sendLoginLink(e) {
        e.target.blur();
        const email = s.sendLinkEmail;
        if (!window.confirm(`Send login instructions to ${email} to edit profile?`)) return;
        if (process.env.REACT_APP_EFP_EXPO === "expo") return;
        const xhr = new XMLHttpRequest();
        xhr.open("POST", data.sendLoginLinkUrl);
        xhr.setRequestHeader("Content-Type", "application/json");
        function er() {
            alert("Error sending login instructions.");
        }
        xhr.onload = function(e) {
            if (this.status !== 200) {
                er();
                return;
            }
            alert(`A link to edit profile was sent to ${email}.`);
        };
        xhr.onerror = function(e) {
            logger.error("Error", e);
            er();
        };
        xhr.send(JSON.stringify({ id: s.exhibitor.id }));
    }

    function bookmark() {
        s.exhibitor.bookmarked = !s.exhibitor.bookmarked;
        // this.$store.commit("setBookmarked", { id: this.exhibitor.id, yes: !this.bookmarked });
    }
}

export default () =>
    useObserver(() => <>{!uiState.menu && uiState.details instanceof Exhibitor ? <ExhibitorComponent /> : null}</>);
