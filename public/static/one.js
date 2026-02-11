console.log( ' line 1  one.js is loading =' );

$(document).ready(function () {
   console.log( ' jquery loading ') ;


   $(".primary-menu ul li .sub-menu").hover(function () {
    $(this).siblings().toggleClass('background-header');
    console.log( ' line 8');  // jay  this was breaking the nav background color for top button. 
});


   var buttonclicked;

   $('.nav-menu').click(function () {
    if (buttonclicked != true) {
        buttonclicked = true;
        $('#nav-icon1,#nav-icon2,#nav-icon3,#nav-icon4').toggleClass('open');
        $('.mobile-navigation').slideToggle();
        $('header').toggleClass('reveal-header');
        $('.reservation-button').toggleClass('show-reservation');
        $('.logo-header').toggleClass('show-reservation');
        $('.nav-menu-container').toggleClass('show-menu');
        $('.white-logo').show();
        $('.show-hamburger-logo').toggleClass('show-logo');
    } else {
        $('#nav-icon1,#nav-icon2,#nav-icon3,#nav-icon4').toggleClass('open');
        $('.mobile-navigation').slideToggle();
        $('header').toggleClass('reveal-header');
        $('.reservation-button').toggleClass('show-reservation');
        $('.logo-header').toggleClass('show-reservation');
        $('.nav-menu-container').toggleClass('show-menu');
        $('.white-logo').show();
        $('.show-hamburger-logo').toggleClass('show-logo');
    }
});

  // Sticky hamburger menu on tablet and mobile.
  $(document).ready(function () {
    $(window).scroll(function () {
        if ($(document).scrollTop() > 50) {

            $('.header-fixed').addClass('fixed-header');
            $('.black-logo').show();
            $('.white-logo').hide();
            $('.reservation-button').removeClass('white-button');
        } else {
            $('.header-fixed').removeClass('fixed-header');
            $('.black-logo').hide();
            $('.white-logo').show();
            $('.reservation-button').addClass('white-button');
        }
    });
});

});