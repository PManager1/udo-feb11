// Mini Carousel Functionality for Food Cards
(function() {
    'use strict';

    // Initialize all mini carousels
    const miniCarousels = document.querySelectorAll('.mini-carousel');

    miniCarousels.forEach(carousel => {
        const cardId = carousel.getAttribute('data-card');
        const images = carousel.querySelectorAll('.carousel-img');
        const prevBtn = carousel.querySelector('.mini-prev');
        const nextBtn = carousel.querySelector('.mini-next');
        
        if (images.length === 0) return;

        let currentIndex = 0;
        const totalImages = images.length;

        // Function to show specific image
        function showImage(index) {
            images.forEach((img, i) => {
                if (i === index) {
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100');
                } else {
                    img.classList.remove('opacity-100');
                    img.classList.add('opacity-0');
                }
            });
        }

        // Next button click handler
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                currentIndex = (currentIndex + 1) % totalImages;
                showImage(currentIndex);
            });
        }

        // Previous button click handler
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                currentIndex = (currentIndex - 1 + totalImages) % totalImages;
                showImage(currentIndex);
            });
        }

        // Touch/Swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 50; // Minimum swipe distance
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - go to next
                    currentIndex = (currentIndex + 1) % totalImages;
                } else {
                    // Swipe right - go to previous
                    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
                }
                showImage(currentIndex);
            }
        }

        // Initialize first image as visible
        showImage(0);
    });

    // Hero Carousel functionality (main carousel)
    const heroCarousel = document.getElementById('carousel');
    const heroSlides = heroCarousel.querySelectorAll('.carousel-slide');
    const heroPrevBtn = document.getElementById('prevBtn');
    const heroNextBtn = document.getElementById('nextBtn');
    const heroDots = document.querySelectorAll('.carousel-dot');

    let currentHeroSlide = 0;
    const totalHeroSlides = heroSlides.length;

    function showHeroSlide(index) {
        heroSlides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.remove('opacity-0');
                slide.classList.add('opacity-100');
            } else {
                slide.classList.remove('opacity-100');
                slide.classList.add('opacity-0');
            }
        });

        // Update dots
        heroDots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.remove('opacity-50');
                dot.classList.add('opacity-100');
            } else {
                dot.classList.remove('opacity-100');
                dot.classList.add('opacity-50');
            }
        });

        currentHeroSlide = index;
    }

    if (heroPrevBtn) {
        heroPrevBtn.addEventListener('click', () => {
            currentHeroSlide = (currentHeroSlide - 1 + totalHeroSlides) % totalHeroSlides;
            showHeroSlide(currentHeroSlide);
        });
    }

    if (heroNextBtn) {
        heroNextBtn.addEventListener('click', () => {
            currentHeroSlide = (currentHeroSlide + 1) % totalHeroSlides;
            showHeroSlide(currentHeroSlide);
        });
    }

    // Hero dot navigation
    heroDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showHeroSlide(index);
        });
    });

    // Auto-play hero carousel
    let heroInterval = setInterval(() => {
        currentHeroSlide = (currentHeroSlide + 1) % totalHeroSlides;
        showHeroSlide(currentHeroSlide);
    }, 5000); // Change every 5 seconds

    // Pause auto-play on hover
    heroCarousel.addEventListener('mouseenter', () => {
        clearInterval(heroInterval);
    });

    heroCarousel.addEventListener('mouseleave', () => {
        heroInterval = setInterval(() => {
            currentHeroSlide = (currentHeroSlide + 1) % totalHeroSlides;
            showHeroSlide(currentHeroSlide);
        }, 5000);
    });

    console.log('Carousels initialized successfully!');
})();

// Category carousel scroll functionality
document.querySelectorAll('.category-scroll').forEach(scrollContainer => {
    const leftArrow = scrollContainer.parentElement.querySelector('.scroll-arrow.left');
    const rightArrow = scrollContainer.parentElement.querySelector('.scroll-arrow.right');
    
    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
        });
    }
    
    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
        });
    }
});