/*
    nav.js
    -----
    Tiny helper that auto-closes the CSS checkbox mobile navigation when
    a navigation link is clicked (improves UX on small viewports).

    Keep this file tiny and dependency-free so it can be included on any page.
*/
// Close the mobile nav (checkbox) when any nav link is clicked on small screens
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.navbar a');
    if (!toggle) return;
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // only auto-close when checkbox is present and checked
            if (window.innerWidth <= 992 && toggle.checked) {
                // small delay so navigation (if anchor) can proceed
                setTimeout(() => { toggle.checked = false; }, 50);
            }
        });
    });
});
