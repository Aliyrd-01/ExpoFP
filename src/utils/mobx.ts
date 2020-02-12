import { autorun, IAutorunOptions, IReactionOptions, IReactionPublic, reaction } from "mobx";
import { EffectCallback, useEffect } from "react";

export function useAutorun(view: (r: IReactionPublic) => any, opts?: IAutorunOptions) {
    return useEffect(
        () => autorun(view, opts),
        // eslint-disable-next-line
        []
    );
}

export function useReaction<T>(
    expression: (r: IReactionPublic) => T,
    effect: (arg: T, r: IReactionPublic) => void,
    opts?: IReactionOptions
) {
    return useEffect(
        () => reaction<T>(expression, effect, opts),
        // eslint-disable-next-line
        []
    );
}

export function useInit(effect: EffectCallback) {
    return useEffect(effect, []);
}
