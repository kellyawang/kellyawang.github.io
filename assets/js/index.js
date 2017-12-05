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
      $('.film, .interactive, .art, .paint').addClass('hide');
      $('.code').removeClass('hide');
    });

    // Show film
    $('.filter-film').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .interactive, .art, .paint').addClass('hide');
      $('.film').removeClass('hide');
    });

    // Show interactive
    $('.filter-interactive').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .film, .art, .paint').addClass('hide');
      $('.interactive').removeClass('hide');
    });

    // Show art
    $('.filter-art').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .film, .interactive, .paint').addClass('hide');
      $('.art').removeClass('hide');
    });

    // Show paintings
    $('.filter-paint').on('click', function() {
      var $this = $(this);
      $('.filter').removeClass('active');
      $this.addClass('active');
      $('.code, .film, .interactive, .art').addClass('hide');
      $('.paint').removeClass('hide');
    });

});
