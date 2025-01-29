export function requestPersistentStorage(key = "expofp_persisted_storage_requested") {
    if (sessionStorage.getItem(key) || !navigator.storage) {
        return;
    }

    navigator.storage.persisted()
        .then(isPersisted => !isPersisted && navigator.storage.persist())
        .catch(console.warn)
        .finally(() => sessionStorage.setItem(key, "true"));
}
