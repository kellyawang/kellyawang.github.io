$(document).ready(function(){
    'use strict';

    // FIXME: Initialize affix and add an offset to add affix class on scroll
    // $('#mainNavbar').affix({
    //   offset: {
    //     top: 100
    //   }
    // });

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
      $('.film, .interactive, .art').addClass('hide');
      $('.code').removeClass('hide');
    });

    // Show urban
    $('.filter-film').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .interactive, .art').addClass('hide');
      $('.film').removeClass('hide');
    });

    // Show portrait
    $('.filter-interactive').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .film, .art').addClass('hide');
      $('.interactive').removeClass('hide');
    });

    // Show portrait
    $('.filter-art').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .film, .interactive').addClass('hide');
      $('.art').removeClass('hide');
    });

});
