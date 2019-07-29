import copyToClipboard from "copy-to-clipboard";
import { VisibilityProperty } from "csstype";
import { observer, useLocalStore } from "mobx-react-lite";
import React, { useEffect } from "react";
import data from "../data";
import { exhibitorStore, uiState } from "../store";
import baseUrl from "../tools/base-data-url";
import "./Menu.scss";
import OverlayContent from "./OverlayContent";

const logoUrl = baseUrl + data.logo;

window.setTimeout(function() {
    const link = document.createElement("link");
    link.href = logoUrl;
    link.rel = "preload";
    (link as any).as = "image";
    document.head.appendChild(link);
}, 4000);

function Menu() {
    const s = useLocalStore(() => ({
        logoVisibility: "visible" as VisibilityProperty,
        shown: false,
        shownTimeout: undefined as number
    }));

    useEffect(() => {
        if (uiState.menu) {
            s.shown = false;
            if (s.shownTimeout) window.clearTimeout(s.shownTimeout);
        } else {
            s.shownTimeout = window.setTimeout(() => {
                s.shown = true;
            }, 1);
        }
    }, [uiState.menu]);

    if (!uiState.menu) return;

    const barContent = (
        <div className="menu__bar">
            <a className="menu__title" href={data.homeUrl} target="_blank" rel="noopener">
                <img src={logoUrl} onError={() => (s.logoVisibility = "hidden")} style={{ visibility: s.logoVisibility }} />
            </a>
        </div>
    );

    return (
        <OverlayContent className={`menu ${s.shown ? "shown" : ""}`} bar={barContent} onC>
            <div className="menu__content">
                {/* <a :href='homeUrl' target="_blank" class="menu__item"><i class="fas fa-home"></i> Event&nbsp;Home&nbsp;<i
                    class="fas fa-external-link"></i></a>
            <a href='' @click.prevent='handleSearch' class="menu__item"><i class="fas fa-search"></i> Search</a>
            <a href='?bookmarks' @click.prevent='$store.dispatch("clickBookmarks"); $store.dispatch("moveToList");'
                class="menu__item -bookmarks"><i class="fas fa-bookmark"></i>
                <span>Bookmarks ({{bookmarkedArray.length}})</span>
                <button @click.stop.prevent=' shareBookmarks' v-if='bookmarkedArray.length' class="fas fa-share-square"
                    title="Share bookmarks"></button>
            </a>
            <a href='' class="menu__item -pdf" @click.prevent='$store.commit("setPrintingPdf", true)'><i class="fas fa-file-pdf"></i> Download PDF</a>
             <!-- <a href='javascript:print()' class="menu__item -print"><i class="fas fa-print"></i> Print</a> -->
            <!-- <a href='?seminars' @click.prevent='$store.dispatch("clickSeminars");' class="menu__item"><i class="fas fa-graduation-cap"></i> Seminars</a> -->

            <div class="menu__item" v-if="categoriesArray.length">Categories</div>
            <a class="menu__cat" :href='"?" + encodeURIComponent(c.slug)' v-for="c in categoriesArray" :key="c.id"
                @click.prevent='$store.dispatch("clickCategory", c.id);'>
                <div class="menu__cat-bullet">&bullet;</div>
                <div class="menu__cat-title">{{c.name}}</div>
                <div class="menu__cat-count">{{numOfExhibitors(c.id)}}</div>
            </a> */}
            </div>
        </OverlayContent>
    );

    function shareBookmarks(e) {
        e.target.blur();
        const url = `${location.protocol}//${location.host}/?b=` + exhibitorStore.bookmarked.map(x => x.id).join("|");
        copyToClipboard(url);
        alert("Link copied to clipboard.\nOpen it on another device to import bookmarks.");
    }

    function close() {
        uiState.menu = false;
    }

    function numOfExhibitors(id: number) {
        return exhibitorStore.exhibitors.filter(e => e.categories.find(c => c.id === id)).length;
    }

    function handleSearch() {
        // this.close();
        // this.$store.dispatch("selectSearch");
        // this.$nextTick(() => this.$store.commit("setSearchFocused", true));
    }
}

export default observer(Menu);
