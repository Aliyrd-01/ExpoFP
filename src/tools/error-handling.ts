window.addEventListener("error", function (e) {
    __logger.info("Handling error:", e.error.message);

    const postObj = {
        error: {
            message: e.error.message,
            stack: e.error.stack,
        },
        log: __logger.messages
    };

    // post it to some endpoint
})