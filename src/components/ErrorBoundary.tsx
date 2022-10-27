import React from "react";

class State {
    constructor(public hasError: boolean) {}
}

export default class ErrorBoundary extends React.Component<any, State> {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Example "componentStack":
        //   in ComponentThatThrows (created by App)
        //   in ErrorBoundary (created by App)
        //   in div (created by App)
        //   in App    logComponentStackToMyService(info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h4 style={{ textAlign: "center" }}>Not available offline.</h4>;
        }

        return this.props.children;
    }
}
