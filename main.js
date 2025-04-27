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

// Video loading handler
document.addEventListener('DOMContentLoaded', function() {
    const videos = document.querySelectorAll('.box video, .box2 video');
    
    videos.forEach(video => {
        // Add loaded class when video can play
        video.addEventListener('canplay', function() {
            this.classList.add('loaded');
        });
        
        // Force video to play (some browsers require this)
        video.play().catch(error => {
            console.log('Video autoplay failed:', error);
        });
    });
});