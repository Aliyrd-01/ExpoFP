import { useEffect } from "react";

function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (
                !ref.current ||
                ref.current.contains(event.target) ||
                (event.composed && ref.current.contains(event.composedPath()[0]))
            ) {
                return;
            }
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

export default useOnClickOutside;
