/**
 * Global Booking Modal System
 * Simple global functions that can be called from any page with EJS data
 */

// Global variables
let currentTour = null;
let globalBookingModal = null;

// Configuration object (can be customized per page)
const bookingConfig = {
    modalId: 'bookingModal',
    apiEndpoint: '/tours/book',
    currency: '$'
};

/**
 * Main function to open booking modal with tour data
 * Call this from any page with your EJS tour data
 */
function openBookingModal(tourData, preselectedDate = '', preselectedParticipants = '') {
    currentTour = tourData;
    
    // Populate modal with tour data
    document.getElementById('modalTourName').textContent = tourData.name;
    document.getElementById('summaryDuration').textContent = `${tourData.duration} days`;
    document.getElementById('summaryDifficulty').textContent = tourData.difficulty;
    document.getElementById('summaryMaxGroup').textContent = `${tourData.maxGroup} people`;
    document.getElementById('summaryPrice').textContent = `${bookingConfig.currency}${tourData.price}`;
    
    // Populate participants dropdown
    const participantsSelect = document.querySelector('#bookingModal #participants');
    participantsSelect.innerHTML = '<option value="">Select participants</option>';
    
    for (let i = 1; i <= tourData.maxGroup; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} ${i === 1 ? 'person' : 'people'}`;
        if (i.toString() === preselectedParticipants) {
            option.selected = true;
        }
        participantsSelect.appendChild(option);
    }
    
    // Add event listener for participants change in modal
    participantsSelect.removeEventListener('change', updateTotalPrice); // Remove existing listener
    participantsSelect.addEventListener('change', updateTotalPrice);
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const modalDateInput = document.querySelector('#bookingModal #bookingDate');
    modalDateInput.min = today;
    
    // Set preselected date if provided
    if (preselectedDate) {
        modalDateInput.value = preselectedDate;
    }
    
    // Update total price if participants were preselected
    if (preselectedParticipants) {
        updateTotalPrice();
    }
    
    // Clear any previous messages
    document.getElementById('messageContainer').innerHTML = '';
    
    // Show modal
    document.getElementById('bookingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close the booking modal
 */
function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form
    document.getElementById('bookingForm').reset();
    document.getElementById('totalPrice').textContent = `${bookingConfig.currency}0`;
    document.getElementById('messageContainer').innerHTML = '';
}

/**
 * Update total price based on participants
 */
function updateTotalPrice() {
    if (!currentTour) return;
    
    const participants = parseInt(document.querySelector('#bookingModal #participants').value) || 0;
    const total = currentTour.price * participants;
    document.getElementById('totalPrice').textContent = `${bookingConfig.currency}${total}`;
}

/**
 * Show message to user
 */
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.innerHTML = `
        <div class="${type}-message">
            ${message}
        </div>
    `;
}

/**
 * Handle form submission
 */
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    if (!currentTour) {
        showMessage('Tour information is missing. Please refresh and try again.', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(e.target);
    const bookingData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'bookingDate', 'participants'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    submitBtn.disabled = true;
    submitText.innerHTML = '<span class="loading-spinner"></span>Sending request...';
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    try {
        
        const response = await fetch(`${bookingConfig.apiEndpoint}/${currentTour.id}`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken   // 👈 ADD THIS
        },
        body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            
            // Reset form after success
            setTimeout(() => {
                closeBookingModal();
            }, 3000);
        } else {
            showMessage(result.message || 'An error occurred. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Send Booking Request';
    }
}

/**
 * Initialize global event listeners (call this once when the script loads)
 */
function initializeBookingModal() {
    // Prevent multiple initializations
    if (globalBookingModal) return;
    globalBookingModal = true;
    
    // Form submission handler
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'bookingForm') {
            handleBookingSubmit(e);
        }
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.id === 'bookingModal') {
            closeBookingModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('bookingModal')?.classList.contains('active')) {
            closeBookingModal();
        }
    });
    
    // Close and cancel button handlers
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal') || 
            e.target.classList.contains('btn-secondary')) {
            closeBookingModal();
        }
    });
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBookingModal);