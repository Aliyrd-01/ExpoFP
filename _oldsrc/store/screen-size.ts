type ScreenSize = { width: number, height: number };

function getData(): ScreenSize {
        return { width: window.innerWidth, height: window.innerHeight };
}

export default {
    state: getData(),
    mutations: {
        setScreenSize(state: ScreenSize, size: ScreenSize) {
            state.width = size.width;
            state.height = size.height;
        }
    }
}

window.addEventListener("resize", () => {
    store.commit('setScreenSize', getData());
});
