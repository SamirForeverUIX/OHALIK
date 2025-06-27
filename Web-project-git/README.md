
💡 Core Purpose
The website allows travelers to:

Explore guided tours across Uzbekistan and nearby regions

View detailed itineraries with price, duration, and location

Book tours directly through the platform

Read blog posts or updates from the tour company

Access a personalized dashboard (for both users and admins)

🔧 Tech Stack
Backend: Node.js with Express

Templating Engine: EJS (for rendering dynamic HTML)

Frontend: HTML, CSS (with responsive layout), and JavaScript

Styling Strategy: Separate CSS files for each section (style.css, tour-detail.css, etc.)

Data Handling: Dynamic rendering of tour data from backend
Built with Express.js and EJS templates.
Modular partials (header/footer).
CSS for styling, custom per section (e.g., tour-detail.css).

Tour data pulled dynamically (tour.imageUrl, tour.description, etc.).

User Management: Login/Registration system (with role-based access: user vs admin)

File Structure: EJS templates are organized into views (e.g., index.ejs, tour-detail.ejs, partials/header.ejs, etc.)

📄 Main Features So Far

1. Landing & Tour Pages
Beautiful homepage with navigation.

A tours section inspired by caminowomen.com.au — card-based layout showing image, title, brief info, and a link to full tour detail.

Each tour detail page includes:

Hero banner with tour name and image.

Meta info (duration, group size, location, difficulty).

Itinerary with day-by-day breakdown.

Booking form (date, number of people).

Sidebar with summary and highlights.


3. Admin Panel
Add/edit/remove:

Tours

Blog posts

Itineraries, prices, and images

Upload images and attach to tours.

View user bookings and messages.


4. Blog & Newsletter
Blog posts with dedicated pages (not modals anymore).

Email subscription system (targeting up to 1000 subscribers).


Implemented using card-based layout

Posts are now shown in a dedicated blog detail page (instead of modal popups)

Fully responsive grid layout for clean display

Fixed blog header for better navigation

🔐 Security Considerations
Email and password login system

Role-checking logic to restrict admin access

Proper form handling and POST routes for bookings and updates


