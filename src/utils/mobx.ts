import { useEffect, EffectCallback } from "react";
import { autorun, IReactionPublic, IAutorunOptions, reaction, IReactionOptions } from "mobx";

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

export function useInit(effect: EffectCallback){
    return useEffect(effect, []);
}