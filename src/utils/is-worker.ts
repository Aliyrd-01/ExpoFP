// eslint-disable-next-line
const inWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
export default inWorker;