document.addEventListener('DOMContentLoaded', function () {
    // Add click event to each blog card to go to the detail page
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        card.addEventListener('click', function () {
            const blogId = this.getAttribute('data-blog-id');
            if (blogId) {
                window.location.href = `/blog/${blogId}`;
            }
        });
    });

    // Animation to blog cards on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    blogCards.forEach(card => {
        observer.observe(card);
    });
});
