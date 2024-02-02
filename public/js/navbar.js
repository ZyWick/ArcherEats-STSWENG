document.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        document.querySelector('.navbar-custom').classList.add('floating-nav');
    } else {
        document.querySelector('.navbar-custom').classList.remove('floating-nav');
    }
})