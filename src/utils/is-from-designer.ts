const isFromDesigner =
    document.referrer &&
    (document.referrer.indexOf("app.expofp.com") > -1 || document.referrer.indexOf("app-show.expofp.com") > -1);
export default isFromDesigner;
