var sidenav= document.querySelector(".side-nav")

function shownavbar()
{
    const sideNav = document.querySelector('.side-nav');
    const marq = document.querySelector('.marq');
    sideNav.classList.add('active');
    marq.classList.add('active');
}

function closenavbar()
{
    const sideNav = document.querySelector('.side-nav');
    const marq = document.querySelector('.marq');
    sideNav.classList.remove('active');
    marq.classList.remove('active');
}

// Close navigation when clicking outside
document.querySelector('.marq').addEventListener('click', function(e) {
    if (e.target === this) {
        closenavbar();
    }
});