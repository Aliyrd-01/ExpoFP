// const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// import gpuInfo from './gpu-info';

const isWebkit = navigator.userAgent.indexOf("AppleWebKit") !== -1;
export default isWebkit; // && !!gpuInfo;
