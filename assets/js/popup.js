//`````````````````````````````````````````````````````````````````````POPUP MESSAGES ```````````````````````````````

function showPopupBottomRight(message) {
    toastr.options = {
        positionClass: "toast-bottom-right",
        timeOut: 1000
    };
    toastr.info(message);
}

function showPopupFadeInDown(message) {
    toastr.options = {
        positionClass: "toast-top-right",
        showMethod: "fadeIn",  
        hideMethod: "fadeOut" ,
        timeOut:1000
    };
    toastr.success(message);
}

function showErrorPopupFadeInDown(message) {
    toastr.options = {
        positionClass: "toast-top-right",
        showMethod: "fadeIn",  
        hideMethod: "fadeOut" ,
        timeOut:1000
    };
    toastr.error(message);
}

function showWarningPopupFadeInDown(message) {
    toastr.options = {
        positionClass: "toast-top-right",
        showMethod: "fadeIn",  
        hideMethod: "fadeOut" ,
        timeOut:1000
    };
    toastr.warning(message);
}

function showSucessPopupFadeInDownLong(message){

    toastr.options = {
        positionClass: "toast-top-right",
        showMethod: "fadeIn",  
        hideMethod: "fadeOut" ,
        timeOut:3000
    };
    toastr.success(message);

}


window.showPopupBottomRight = showPopupBottomRight;
window.showPopupFadeInDown = showPopupFadeInDown;
window.showErrorPopupFadeInDown = showErrorPopupFadeInDown;
window.showWarningPopupFadeInDown = showWarningPopupFadeInDown;
window.showSucessPopupFadeInDownLong = showSucessPopupFadeInDownLong;
