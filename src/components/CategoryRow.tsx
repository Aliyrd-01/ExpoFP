import React from "react";
import store from "../store";
import { Category } from "../store/CategoryStore";
import "./CategoryRow.scss";
import SimpleRow from "./SimpleRow";
import { t } from "../utils/i18n";

const CategoryRow: React.FC<{
    category: Category;
    className: string;
}> = ({ category, className }) => {
    return (
        <SimpleRow
            className={className}
            slug={category.slug}
            onClick={handleClick}
            line1={`${category.name} (${category.exhibitors.length})`}
            line2={t("Category")}
        />
    );
    function handleClick() {
        store.clickCategory(category);
    }
};

export default CategoryRow;
