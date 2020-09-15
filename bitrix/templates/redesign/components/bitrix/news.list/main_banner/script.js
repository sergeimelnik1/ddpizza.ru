$(document).ready(function () {
    $(".owl-carousel.mainpageSlider").owlCarousel({
        items: 1,
        autoHeight: true,
        dots: false,
        mouseDrag: true,
        nav: true,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        navSpeed: 500,
        autoplaySpeed: 1500,
        loop: true,
    });
});