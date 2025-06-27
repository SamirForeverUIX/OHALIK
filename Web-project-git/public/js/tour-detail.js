document.addEventListener('DOMContentLoaded', function() {
    // Handle sticky navigation highlighting
    const sections = document.querySelectorAll('.tour-section');
    const navLinks = document.querySelectorAll('.tour-nav-links a');
    
    // Get the height of the navigation bar
    const navHeight = document.querySelector('header, nav, .navbar').offsetHeight || 80;
    
    // Update active nav link based on scroll position
    function updateActiveNavLink() {
        // Get the current scroll position plus a small offset
        const scrollPosition = window.scrollY + (navHeight + 20);
        
        // Find the section that's currently at the top of the viewport
        let activeSection = null;
        let minDistance = Number.MAX_VALUE;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Calculate how far this section is from the ideal position
            const distance = Math.abs(sectionTop - scrollPosition);
            
            // If this section is closer to the top than previous sections, make it active
            if (distance < minDistance) {
                minDistance = distance;
                activeSection = section;
            }
        });
        
        // Set active class for the closest section
        if (activeSection) {
            const currentSectionId = activeSection.getAttribute('id');
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Smooth scroll to section when nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (!targetSection) return; // Safety check
            
            // Highlight the clicked link immediately
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll to the exact top of the section minus navbar height
            const targetPosition = targetSection.offsetTop - navHeight - 10; // 10px extra padding
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL hash without scrolling
            history.pushState(null, null, targetId);
        });
    });
    
    // Toggle FAQ answers
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            
            if (this.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = '1';
            } else {
                answer.style.maxHeight = '0';
                answer.style.opacity = '0';
            }
        });
    });
    
    // Initialize FAQ visibility
    faqQuestions.forEach(question => {
        const answer = question.nextElementSibling;
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'all 0.3s ease';
    });
    
    // Listen for scroll events
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Initialize active state
    updateActiveNavLink();
    
    // Debug helper - logs section positions to console
    // Uncomment this to help debug section positions
    /*
    function logSectionPositions() {
        console.log('Current scroll position:', window.scrollY);
        sections.forEach(section => {
            console.log(`Section ${section.id}: offsetTop = ${section.offsetTop}, height = ${section.offsetHeight}`);
        });
    }
    window.addEventListener('scroll', _.throttle(logSectionPositions, 1000));
    logSectionPositions();
    */
});