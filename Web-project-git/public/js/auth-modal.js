document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const loginBtn = document.getElementById('loginBtn');
  const authModal = document.getElementById('authModal');
  const closeBtn = document.querySelector('.auth-modal-close');
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form-container');
  const adminToggle = document.querySelector('.admin-toggle');
  const adminCodeInput = document.querySelector('.admin-code-input');
  
  // Profile elements (will be populated after login)
  const profileIcon = document.getElementById('profileIcon');
  const profileDropdown = document.getElementById('profileDropdown');
  
  // Check if user is logged in on page load
  checkLoginStatus();
  
  // Open auth modal when login button is clicked
  if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
          // Check if JavaScript is enabled
          if (window.jsEnabled !== false) {
              e.preventDefault();
              openAuthModal();
          }
          // If JavaScript is disabled, the default behavior will navigate to the login page
      });
  }
  
  // Close auth modal
  if (closeBtn) {
      closeBtn.addEventListener('click', closeAuthModal);
  }
  
  // Close modal when clicking outside
  if (authModal) {
      authModal.addEventListener('click', function(e) {
          if (e.target === authModal) {
              closeAuthModal();
          }
      });
  }
  
  // Switch between login and register tabs
  authTabs.forEach(tab => {
      tab.addEventListener('click', function() {
          // Deactivate all tabs and forms
          authTabs.forEach(t => t.classList.remove('active'));
          authForms.forEach(f => f.classList.remove('active'));
          
          // Activate selected tab and corresponding form
          const tabName = this.getAttribute('data-tab');
          this.classList.add('active');
          document.getElementById(tabName + 'Form').classList.add('active');
      });
  });
  
  // Toggle admin code input section
  if (adminToggle) {
      adminToggle.addEventListener('click', function() {
          this.classList.toggle('active');
          
          if (adminCodeInput.style.display === 'none' || adminCodeInput.style.display === '') {
              adminCodeInput.style.display = 'block';
              this.querySelector('.admin-toggle-icon').textContent = '×';
          } else {
              adminCodeInput.style.display = 'none';
              this.querySelector('.admin-toggle-icon').textContent = '+';
          }
      });
  }
  
  // Handle login form submission
  const loginForm = document.querySelector('#loginForm form');
  if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const email = document.getElementById('loginEmail').value;
          const password = document.getElementById('loginPassword').value;
          
          // Send login request to server
          fetch('/auth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  // Close modal and update UI for logged in user
                  closeAuthModal();
                  updateUIAfterLogin(data.user);
                  
                  // Show success message
                  showNotification('Login successful!', 'success');
              } else {
                  // Show error message
                  showNotification(data.message || 'Login failed. Please try again.', 'error');
              }
          })
          .catch(error => {
              console.error('Error during login:', error);
              showNotification('An error occurred. Please try again later.', 'error');
          });
      });
  }
  
  // Handle register form submission
  const registerForm = document.querySelector('#registerForm form');
  if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const name = document.getElementById('registerName').value;
          const email = document.getElementById('registerEmail').value;
          const password = document.getElementById('registerPassword').value;
          const confirmPassword = document.getElementById('registerConfirmPassword').value;
          const adminCode = document.getElementById('adminCode')?.value || '';
          
          // Basic validation
          if (password !== confirmPassword) {
              showNotification('Passwords do not match!', 'error');
              return;
          }
          
          // Send registration request to server
          fetch('/auth/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name, email, password, adminCode }),
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  // Close modal and update UI for logged in user
                  closeAuthModal();
                  updateUIAfterLogin(data.user);
                  
                  // Show success message
                  showNotification('Registration successful!', 'success');
              } else {
                  // Show error message
                  showNotification(data.message || 'Registration failed. Please try again.', 'error');
              }
          })
          .catch(error => {
              console.error('Error during registration:', error);
              showNotification('An error occurred. Please try again later.', 'error');
          });
      });
  }
  
  // Toggle profile dropdown when profile icon is clicked
  if (profileIcon) {
      profileIcon.addEventListener('click', function() {
          profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
      });
  }
  
  // Close profile dropdown when clicking outside
  document.addEventListener('click', function(e) {
      if (profileDropdown && profileIcon && 
          !profileDropdown.contains(e.target) && 
          !profileIcon.contains(e.target)) {
          profileDropdown.style.display = 'none';
      }
  });
  
  // Helper Functions
  function openAuthModal() {
      authModal.style.display = 'flex';
      authModal.classList.add('fade-in');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
  
  function closeAuthModal() {
      authModal.classList.add('fade-out');
      setTimeout(() => {
          authModal.style.display = 'none';
          authModal.classList.remove('fade-out');
          document.body.style.overflow = 'auto';
      }, 300);
  }
  
  function checkLoginStatus() {
      // Check if user is logged in by fetching from server
      fetch('/auth/status')
          .then(response => response.json())
          .then(data => {
              if (data.isLoggedIn) {
                  updateUIAfterLogin(data.user);
              }
          })
          .catch(error => {
              console.error('Error checking login status:', error);
          });
  }
  
  function updateUIAfterLogin(user) {
      // Hide login button
      if (loginBtn) {
          loginBtn.parentElement.style.display = 'none';
      }
      
      // Create and show profile icon if it doesn't exist
      if (!document.getElementById('profileIcon')) {
          const profileIconHTML = `
              <div class="profile-icon-container">
                  <div class="profile-icon" id="profileIcon">
                      <img src="${user.avatar || '/images/default-avatar.jpg'}" alt="Profile">
                  </div>
              </div>
          `;
          
          // Insert profile icon into navbar
          const navbar = document.querySelector('.navbar');
          navbar.insertAdjacentHTML('beforeend', profileIconHTML);
          
          // Add click event to new profile icon
          document.getElementById('profileIcon').addEventListener('click', function() {
              profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
          });
      }
      
      // Update profile dropdown with user info
      document.getElementById('userName').textContent = user.name;
      document.getElementById('userEmail').textContent = user.email;
      document.getElementById('userAvatar').src = user.avatar || '/images/default-avatar.jpg';
      
      // Show appropriate menu based on user role
      const regularMenu = document.querySelector('.regular-user-menu');
      const adminMenu = document.querySelector('.admin-user-menu');
      
      if (user.isAdmin) {
          regularMenu.style.display = 'none';
          adminMenu.style.display = 'block';
      } else {
          regularMenu.style.display = 'block';
          adminMenu.style.display = 'none';
      }
  }
  
  function showNotification(message, type = 'info') {
      // Create notification element if it doesn't exist
      let notification = document.getElementById('notification');
      if (!notification) {
          notification = document.createElement('div');
          notification.id = 'notification';
          document.body.appendChild(notification);
          
          // Add styles
          notification.style.position = 'fixed';
          notification.style.bottom = '20px';
          notification.style.right = '20px';
          notification.style.padding = '15px 25px';
          notification.style.borderRadius = '5px';
          notification.style.color = '#fff';
          notification.style.zIndex = '2000';
          notification.style.transform = 'translateY(100px)';
          notification.style.transition = 'all 0.3s ease';
      }
      
      // Set notification type styling
      switch (type) {
          case 'success':
              notification.style.backgroundColor = '#2ecc71';
              break;
          case 'error':
              notification.style.backgroundColor = '#e74c3c';
              break;
          case 'warning':
              notification.style.backgroundColor = '#f39c12';
              break;
          default:
              notification.style.backgroundColor = '#3498db';
      }
      
      // Set message and show notification
      notification.textContent = message;
      notification.style.transform = 'translateY(0)';
      
      // Hide notification after 3 seconds
      setTimeout(() => {
          notification.style.transform = 'translateY(100px)';
      }, 3000);
  }
});


// Password Reset Functionality
document.addEventListener('DOMContentLoaded', function() {
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const passwordResetForm = document.getElementById('passwordResetForm');
  const backToLoginLink = document.querySelector('.back-to-login');
  
  forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Hide all forms and show password reset form
      document.querySelectorAll('.auth-form-container').forEach(f => f.classList.remove('active'));
      passwordResetForm.classList.add('active');
      
      // Update tabs (optional - make none active or create a new tab)
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  });
  
  backToLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Show login form again
      document.querySelectorAll('.auth-form-container').forEach(f => f.classList.remove('active'));
      document.getElementById('loginForm').classList.add('active');
      
      // Update tabs
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="login"]').classList.add('active');
  });
});

// Set a flag to indicate JavaScript is enabled
window.jsEnabled = true;