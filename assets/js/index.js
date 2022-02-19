$(document).ready(function(){
    'use strict';

    // FIXME: Initialize affix and add an offset to add affix class on scroll
    // $('#mainNavbar').affix({
    //   offset: {
    //     top: 100
    //   }
    // });

    /*
    * Sidebar functions
    *
    * Set the width of the side navigation to 450px
    */
/*    function openNav() {
        document.getElementById("about-side-nav").style.width = "450px"
    }
    // Set the width of the side navigation to 0
    function closeNav() {
        document.getElementById("about-side-nav").style.width = "0";
    }

    $('#about-label').on('click', function() {
        openNav();
    });

    $('.closebtn').on('click', function() {
        closeNav();
    });
*/

    // Show all
    $('.filter-all').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.all').removeClass('hide');
    });

    // Show code
    $('.filter-code').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.film, .interactive, .paint').addClass('hide');
      $('.code').removeClass('hide');
    });

    // Show film
    $('.filter-film').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .interactive, .paint').addClass('hide');
      $('.film').removeClass('hide');
    });

    // Show interactive
    $('.filter-interactive').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .film, .paint').addClass('hide');
      $('.interactive').removeClass('hide');
    });

    // Show paintings
    $('.filter-paint').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .film, .interactive').addClass('hide');
      $('.paint').removeClass('hide');
    });

    // Animations for portfolio thumbnails using Animate.css (animate-custom.css) library
    // $('.sectionphoto').hover(
    //     function() {
    //         console.log("hover in");
    //         $(this).addClass('animated infinite pulse');
    //     },
    //     function() {
    //         console.log("hover out");
    //         $(this).removeClass('animated infinite pulse');
    //     }
    // );

});
