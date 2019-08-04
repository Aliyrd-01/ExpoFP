import { useEffect } from "react";
import { autorun, IReactionPublic, IAutorunOptions } from "mobx";

export function useAutorun(view: (r: IReactionPublic) => any, opts?: IAutorunOptions) {
    return useEffect(() =>
        autorun(view, opts)
        // eslint-disable-next-line
        , []);
}