'use strict';

/*
 scroll-control.js - controls scroll effects for mod3.html
 */

// IIFE
(() => {

    // Scope out - 1
    const slide1El = document.getElementById('slide1');
    const frame1El = document.getElementById('frame1');

    // - 2
    const slide2El = document.getElementById('slide2');
    const frame2El = document.getElementById('frame2');
    const oneHalfEl = document.getElementById('leftHalf');
    const otherHalfEl = document.getElementById('rightHalf');
    const oneHalfElL = parseInt(window.getComputedStyle(oneHalfEl).getPropertyValue('left'), 10);
    const oneHalfElR = parseInt(window.getComputedStyle(otherHalfEl).getPropertyValue('right'), 10);

    // - 2B
    const slide2BEl = document.getElementById('slide2B');
    const slide2BBkgdImg = document.getElementById('imgBox2B');

    // - 10
    const slide10El = document.getElementById('slide10');
    const frame3El = document.getElementById('frame3');

    // ScrollControl
    scrollControl();


    /* `````````````````````````````````\```````````````````````\
        scrollControl()                 |        ........       |
     ``````````````````````````````````/``````````````````````*/
    function scrollControl() {

        // Add scroll event listener
        document.addEventListener('scroll', () => {

            // Manage slide1
            manageSlide1();
            // Manage slide2
            manageSlide2();
            // Manage slide2B
            // manageSlide2B();
            // Manage slide10
            manageSlide10();


        })
    }

    /* `````````````````````````````````\```````````````````````\
        manageSlide1()                  | re. void             |
     ``````````````````````````````````/``````````````````````*/
    function manageSlide1() {

        // Delegate opacity and visibility animation
        return fadeOutFadeIn(slide1El, frame1El, 0.2, 0.8)

    }

    /* `````````````````````````````````\```````````````````````\
        manageSlide2()                  | re. void              |
     ``````````````````````````````````/``````````````````````*/
    function manageSlide2(visible) {

        // Get slide2El position
        const s2ElPos = slide2El.getBoundingClientRect();

        // Config animation
        const lead = 0.8;
        const tail = 0.1;

        // Control left/right by position
        if (s2ElPos.top <= s2ElPos.height * lead && s2ElPos.top >= s2ElPos.height * tail) {
            // Calc pctPos
            const pctPos = (s2ElPos.height * lead - s2ElPos.top) / (s2ElPos.height * (lead - tail));
            // Adj left / right
            rAF1(pctPos);
            // Adj background image pos
            rAF2(pctPos);
        } else if (s2ElPos.top < s2ElPos.height * tail) {
            // Adj left / right
            rAF1(1);
            // Adj background image pos
            rAF2(1);
        } else if (s2ElPos.top > s2ElPos.height * lead) {
            // Adj left / right
            rAF1(0);
            // Adj background image pos
            rAF2(0);
        }

        // Delegate opacity / visibility control
        fadeOutFadeIn(slide2El, frame2El, 0.2, 0.7);

        // rAF1() - right and left
        function rAF1(pct) {
            requestAnimationFrame(() => {
                const newLeft = oneHalfElL * (1 - pct);
                oneHalfEl.style.left = `${newLeft}px`;
                const newRight = oneHalfElR * (1 - pct);
                otherHalfEl.style.right = `${newRight}px`;
            });
        }

        // rAF2 - background position
        function rAF2(pct) {
            requestAnimationFrame(() => {
                const newX = Math.round((pct) * 100);
                oneHalfEl.style.backgroundPosition = `${newX}% 50%`;
            });
        }

    }

    /* `````````````````````````````````\```````````````````````\
        manageSlide2B()                  | re. void              |
     ``````````````````````````````````/``````````````````````*/
    function manageSlide2B() {

        // Get slide2BEl position
        imagePan(slide2BEl, slide2BBkgdImg, 0.1, 0.9);
    }

    /* `````````````````````````````````\```````````````````````\
        manageSlide10()                  | re. void             |
     ``````````````````````````````````/``````````````````````*/
    function manageSlide10() {

        // Delegate opacity and visibility animation
        return fadeInFadeOut(slide10El, frame3El, 0.2, 0.8)

    }

    /* `````````````````````````````````\```````````````````````\
        imagePan()                      | re. void              |
     ``````````````````````````````````/``````````````````````*/
    function imagePan(slide, img, lead, tail) {

        // Get slide position
        const pos = slide.getBoundingClientRect();
        const appliedH = pos.height * 2;
        const adjTop = pos.top - pos.height;

        // Control opacity by position
        if (adjTop <= -appliedH * lead && adjTop >= -appliedH * tail) {
            // Adjust bkgd pos
            rAF1();
        }

        // rAF1() - backgroundPosition
        function rAF1() {
            const pct = 1 - (-appliedH * lead + -adjTop) /
                (appliedH * (tail - lead).toFixed(2));
            const newX = Math.round((pct) * 100);
            window.requestAnimationFrame(() => {
                img.style.backgroundPosition = `${newX}% 50%`;
            })
        }

    }

    /* `````````````````````````````````\```````````````````````\
        fadeInfadeOut()                 | re. boolean           |
     ``````````````````````````````````/``````````````````````*/
    // Set opacity - when scrolling down, + when scrolling up
    function fadeInFadeOut(slide, frame, lead, tail) {

        // Get slide position
        const pos = slide.getBoundingClientRect();
        const actingH = pos.height ;
        const adjTop = pos.top - pos.height;


        // Control opacity by position
        if (adjTop <= -pos.height * lead && adjTop >= - pos.height * tail) {
            // Adjust opacity
            rAF1();
            // Reset visible
            rAF2(true);
        }
        // under
        else if (adjTop < -pos.height * tail) {
            // Adjust opacity
            rAF1(true, 1);
            // Reset visible
            rAF2(true);
        }
        // over
        else if (adjTop > -pos.height * lead) {
            // Adjust opacity
            rAF1(true, 0);
            // Reset visible
            rAF2(false);
        }

        // rAF1() - opacity
        function rAF1(fixed, order) {
            window.requestAnimationFrame(() => {
                if (fixed) {
                    frame.style.opacity = `${order}`;

                } else {
                    const opacity = (-pos.height * lead + -adjTop) /
                        (pos.height * (tail - lead).toFixed(2));
                    frame.style.opacity = `${opacity}`;
                }
            })
        }

        // rAF2() - visibility
        function rAF2(visible) {
            setTimeout(() => {
                window.requestAnimationFrame(() => {
                    frame.style.visibility = !visible ? 'hidden' : 'visible';
                });
            }, 0);
        }

    }

    /* `````````````````````````````````\```````````````````````\
        fadeOutFadeIn()                 | re. boolean           |
     ``````````````````````````````````/``````````````````````*/
    // Set opacity - when scrolling down, + when scrolling up
    function fadeOutFadeIn(slide, frame, lead, tail) {

        // Get slide position
        const pos = slide.getBoundingClientRect();

        // Control opacity by position
        if (pos.top <= -pos.height * lead && pos.top >= -pos.height * tail) {
            // Adjust opacity
            rAF1();
            // Reset visible
            rAF2(true);
        }
        // under
        else if (pos.top < -pos.height * tail) {
            // Adjust opacity
            rAF1(true, 0);
            // Reset visible
            rAF2(false);
        }
        // over
        else if (pos.top > -pos.height * lead) {
            // Adjust opacity
            rAF1(true, 1);
            // Reset visible
            rAF2(true);
        }

        // rAF1() - opacity
        function rAF1(fixed, order) {
            window.requestAnimationFrame(() => {
                if (fixed) {
                    frame.style.opacity = `${order}`;
                } else {
                    const opacity = 1 - (-pos.height * lead + -pos.top) /
                        (pos.height * (tail - lead).toFixed(2));
                    frame.style.opacity = `${opacity}`;
                }
            })
        }

        // rAF2() - visibility
        function rAF2(visible) {
            setTimeout(() => {
                window.requestAnimationFrame(() => {
                    frame.style.visibility = !visible ? 'hidden' : 'visible';
                });
            }, 0);
        }

    }

})();
