"use strict";
$(document).ready(function () {
  // card js start
  $(".card-header-right .close-card").on("click", function () {
    var $this = $(this);
    $this.parents(".card").animate({
      opacity: "0",
      "-webkit-transform": "scale3d(.3, .3, .3)",
      transform: "scale3d(.3, .3, .3)",
    });

    setTimeout(function () {
      $this.parents(".card").remove();
    }, 800);
  });
  $(".card-header-right .reload-card").on("click", function () {
    var $this = $(this);
    $this.parents(".card").addClass("card-load");
    $this
      .parents(".card")
      .append(
        '<div class="card-loader"><i class="fa fa-circle-o-notch rotate-refresh"></div>'
      );
    setTimeout(function () {
      $this.parents(".card").children(".card-loader").remove();
      $this.parents(".card").removeClass("card-load");
    }, 3000);
  });
  $(".card-header-right .card-option .open-card-option").on(
    "click",
    function () {
      var $this = $(this);
      if ($this.hasClass("fa-times")) {
        $this.parents(".card-option").animate({
          width: "30px",
        });
        $(this).removeClass("fa-times").fadeIn("slow");
        $(this).addClass("fa-wrench").fadeIn("slow");
      } else {
        $this.parents(".card-option").animate({
          width: "140px",
        });
        $(this).addClass("fa-times").fadeIn("slow");
        $(this).removeClass("fa-wrench").fadeIn("slow");
      }
    }
  );
  $(".card-header-right .minimize-card").on("click", function () {
    var $this = $(this);
    var port = $($this.parents(".card"));
    var card = $(port).children(".card-block").slideToggle();
    $(this).toggleClass("fa-minus").fadeIn("slow");
    $(this).toggleClass("fa-plus").fadeIn("slow");
  });
  $(".card-header-right .full-card").on("click", function () {
    var $this = $(this);
    var port = $($this.parents(".card"));
    port.toggleClass("full-card");
    $(this).toggleClass("fa-window-restore");
  });
  $("#more-details").on("click", function () {
    $(".more-details").slideToggle(500);
  });
  $(".mobile-options").on("click", function () {
    $(".navbar-container .nav-right").slideToggle("slow");
  });
  $(".search-btn").on("click", function () {
    $(".main-search").addClass("open");
    $(".main-search .form-control").animate({
      width: "200px",
    });
  });
  $(".search-close").on("click", function () {
    $(".main-search .form-control").animate({
      width: "0",
    });
    setTimeout(function () {
      $(".main-search").removeClass("open");
    }, 300);
  });
  $(document).ready(function () {
    $(".header-notification").click(function () {
      $(this).find(".show-notification").slideToggle(500);
      $(this).toggleClass("active");
    });
  });
  $(document).on("click", function (event) {
    var $trigger = $(".header-notification");
    if ($trigger !== event.target && !$trigger.has(event.target).length) {
      $(".show-notification").slideUp(300);
      $(".header-notification").removeClass("active");
    }
  });

  // card js end
  $.mCustomScrollbar.defaults.axis = "yx";
  $("#styleSelector .style-cont").slimScroll({
    setTop: "1px",
    height: "calc(100vh - 320px)",
  });
  $(".main-menu").mCustomScrollbar({
    setTop: "1px",
    setHeight: "calc(100% - 56px)",
  });
  /*chatbar js start*/
  /*chat box scroll*/
  var a = $(window).height() - 80;
  $(".main-friend-list").slimScroll({
    height: a,
    allowPageScroll: false,
    wheelStep: 5,
    color: "#1b8bf9",
  });

  // search
  $("#search-friends").on("keyup", function () {
    var g = $(this).val().toLowerCase();
    $(".userlist-box .media-body .chat-header").each(function () {
      var s = $(this).text().toLowerCase();
      $(this).closest(".userlist-box")[s.indexOf(g) !== -1 ? "show" : "hide"]();
    });
  });

  // open chat box
  $(".displayChatbox").on("click", function () {
    var my_val = $(".pcoded").attr("vertical-placement");
    if (my_val == "right") {
      var options = {
        direction: "left",
      };
    } else {
      var options = {
        direction: "right",
      };
    }
    $(".showChat").toggle("slide", options, 500);
  });

  //open friend chat
  $(".userlist-box").on("click", function () {
    var my_val = $(".pcoded").attr("vertical-placement");
    if (my_val == "right") {
      var options = {
        direction: "left",
      };
    } else {
      var options = {
        direction: "right",
      };
    }
    $(".showChat_inner").toggle("slide", options, 500);
  });
  //back to main chatbar
  $(".back_chatBox").on("click", function () {
    var my_val = $(".pcoded").attr("vertical-placement");
    if (my_val == "right") {
      var options = {
        direction: "left",
      };
    } else {
      var options = {
        direction: "right",
      };
    }
    $(".showChat_inner").toggle("slide", options, 500);
    $(".showChat").css("display", "block");
  });
  $(".back_friendlist").on("click", function () {
    var my_val = $(".pcoded").attr("vertical-placement");
    if (my_val == "right") {
      var options = {
        direction: "left",
      };
    } else {
      var options = {
        direction: "right",
      };
    }
    $(".p-chat-user").toggle("slide", options, 500);
    $(".showChat").css("display", "block");
  });
  // /*chatbar js end*/

  $('[data-toggle="tooltip"]').tooltip();

  // wave effect js
  Waves.init();
  Waves.attach(".flat-buttons", ["waves-button"]);
  Waves.attach(".float-buttons", ["waves-button", "waves-float"]);
  Waves.attach(".float-button-light", [
    "waves-button",
    "waves-float",
    "waves-light",
  ]);
  Waves.attach(".flat-buttons", [
    "waves-button",
    "waves-float",
    "waves-light",
    "flat-buttons",
  ]);

  $(".form-control").on("blur", function () {
    if ($(this).val().length > 0) {
      $(this).addClass("fill");
    } else {
      $(this).removeClass("fill");
    }
  });
  $(".form-control").on("focus", function () {
    $(this).addClass("fill");
  });
});
$(document).ready(function () {
  $(".theme-loader").animate(
    {
      opacity: "0.9",
    },
    100
  );
  setTimeout(function () {
    $(".theme-loader").remove();
  }, 1400);
});

// toggle full screen
function toggleFullScreen() {
  var a = $(window).height() - 10;

  if (
    !document.fullscreenElement && // alternative standard method
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement
  ) {
    // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(
        Element.ALLOW_KEYBOARD_INPUT
      );
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

// $("body").append('<div class="fixed-button active"><a href="https://codedthemes.com/item/flash-able-bootstrap-admin-template/" target="_blank" class="btn btn-md btn-primary"><i class="fa fa-shopping-cart" aria-hidden="true"></i> Upgrade To Pro</a> </div>');var $window=$(window),nav=$(".fixed-button");

// popup message



// document.getElementById("exitButton2").addEventListener("click", async function () {
//   const result = await Swal.fire({
//     title: "Cancel Editing?",
//     text: "You have unsaved changes. Are you sure you want to cancel?",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#d33",     // Red for confirm
//     cancelButtonColor: "#3085d6",   // Blue for cancel
//     confirmButtonText: "Yes, Cancel",
//     cancelButtonText: "No, Keep Editing",
//     reverseButtons: true,
//     customClass: {
//       popup: "swal2-custom-popup",
//       title: "swal2-custom-title"
//     }
//   });
//   if(result.isConfirmed){
//     // document.location.reload();
//       document.querySelector('#tabWrapper').classList.add('d-none');
//     document.querySelector('#tableCard').style.display = 'block';
//   }
//   else{
//   }
// });

// document.getElementById("exitButton").addEventListener("click", async function () {
//   const result = await Swal.fire({
//     title: "Cancel Editing?",
//     text: "Your unsaved changes will be lost. Do you want to cancel?",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#d33",     // Red for confirm
//     cancelButtonColor: "#3085d6",   // Blue for cancel
//     confirmButtonText: "Yes, Cancel",
//     cancelButtonText: "No, Keep Editing",
//     reverseButtons: true,
//     customClass: {
//       popup: "swal2-custom-popup",
//       title: "swal2-custom-title"
//     }
//   });
//   if(result.isConfirmed){
     
//             document.querySelector('#tab').classList.add('d-none');
//             document.querySelector('#tableCard').style.display = 'block';
//   }
//   else{
//   }
// });






// $(document).ready(function () {
//   // When Edit button is clicked → show confirmation modal
//   $('#editButton').on('click', function () {
//     $('#confirmEditModal').modal('show');
//   });

//   // When "Yes, Edit" is clicked → proceed with edit action
//   $('#confirmEditYes').on('click', function () {
//     $('#confirmEditModal').modal('hide');

//     // ✅ You can run your edit logic here
//     // Example: Enable form fields or open another modal
//     Swal.fire({
//       icon: 'success',
//       title: 'Edit Enabled',
//       text: 'You can now edit the record.',
//       showConfirmButton: false,
//       timer: 1800
//     });
//   });
// });

// document.getElementById("exitButton").addEventListener("click", async function () {
//   const result = await Swal.fire({
//     title: "Are you sure?",
//     text: "If you leave now, your unsaved changes will be lost.",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonText: "Yes, Exit Anyway",
//     cancelButtonText: "Stay Here",
//     confirmButtonColor: "#d33",     // red for exit
//     cancelButtonColor: "#3085d6",   // blue for cancel
//     background: "#fff",
//     color: "#333",
//     reverseButtons: true,
//     showClass: {
//       popup: 'animate__animated animate__fadeInDown'
//     },
//     hideClass: {
//       popup: 'animate__animated animate__fadeOutUp'
//     }
//   });

//   if (result.isConfirmed) {
//     // ✅ Close only the edit modal (no reload)
//     Swal.fire({
//       icon: "success",
//       title: "Exited!",
//       text: "You have left the edit mode.",
//       showConfirmButton: false,
//       timer: 1500,
//       timerProgressBar: true
//     });

//     // hide modal smoothly after popup
//     setTimeout(() => {
//       let modal = bootstrap.Modal.getInstance(document.getElementById("editStaffModal"));
//       if (modal) modal.hide();  // close modal
//     }, 1200);
//   } else {
//     Swal.fire({
//       icon: "info",
//       title: "Continue Editing",
//       text: "You can continue making your changes.",
//       showConfirmButton: false,
//       timer: 1500
//     });
//   }
// });
