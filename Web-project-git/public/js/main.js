// Navigation menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// Sticky header
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });
}

// Back to top button
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Tour tab switching
const tourTabs = document.querySelectorAll('.tour-tab');
const tourContents = document.querySelectorAll('.tour-content-container');

if (tourTabs.length && tourContents.length) {
    tourTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tourTabs.forEach(t => t.classList.remove('active'));
            tourContents.forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            const selectedTour = tab.getAttribute('data-tour');
            const activeContent = document.getElementById(selectedTour);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}

// NEWSLETTER
let subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        if (!email) {
            alert('Please enter a valid email.');
            return;
        }
        subscribers.push(email);
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
        alert('You have successfully subscribed!');
        document.getElementById('email').value = '';
    });
}

// Age Validation
const ageValidation = (birthDate) => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.setFullYear(today.getFullYear() - 18));
    return new Date(birthDate) <= eighteenYearsAgo;
};

// File Size Validation
const MAX_FILE_SIZE = 10485760;

const validateFileSize = (file) => {
    return file.size <= MAX_FILE_SIZE;
};

// Slug Validation
const generateSlug = async (title) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    const existingSlug = false;
    return existingSlug ? null : slug;
};

// Register form validation
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const birthDate = document.getElementById('birthDate').value;
        const file = document.getElementById('fileUpload').files[0];

        if (!ageValidation(birthDate)) {
            alert('You must be at least 18 years old to register.');
            return;
        }

        if (!validateFileSize(file)) {
            alert('File size exceeds the 10MB limit.');
            return;
        }

        const title = document.getElementById('postTitle').value;
        const slug = await generateSlug(title);
        if (!slug) {
            alert('Slug already exists!');
            return;
        }

        // Form passes all checks
        alert('Form submitted successfully!');
    });
}
