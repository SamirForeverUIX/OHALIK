process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});


// server.js - Main Express Application
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('morgan');
const flash = require('connect-flash');
const { PrismaClient } = require('@prisma/client');
// Initialize Express app and databases
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const { Client } = require('pg');
const db = require('./db'); // Import the new db module

// We'll log a connection test on startup but use the pool for actual queries
db.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to PostgreSQL pool'))
  .catch(err => console.error('❌ PostgreSQL connection error', err.stack));

// Update the homepage route to use the db module
app.get('/', async (req, res) => {
  try {
    // Fetch featured tours from Prisma
    const featuredTours = await prisma.tour.findMany({
      where: { featured: true },
      take: 3
    });

    // Fetch all tours from our connection pool
    const allTours = await db.getTours();

    res.render('index', {
      tours: featuredTours,
      allTours: allTours,
      title: 'Ohalik Tours - Experience the Adventure'
    });
  } catch (error) {
    console.error('Error fetching homepage tours:', error);
    res.render('index', {
      tours: [],
      allTours: [],
      title: 'Ohalik Tours - Experience the Adventure'
    });
  }
});

// Also update the uncaughtException handler - don't immediately exit
// Modify these at the top of your file
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit immediately on database connection errors
  if (err.code === 'ECONNRESET' || 
      err.code === 'EPIPE' || 
      err.message.includes('Connection terminated unexpectedly')) {
    console.log('Database connection error, but keeping server running');
  } else {
    // For other critical errors, we can still exit
    process.exit(1);
  }
});




// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "http://localhost:3000/api/placeholder"],
    },
  },
  referrerPolicy: { policy: 'no-referrer' },
  xFrameOptions: { value: 'DENY' }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);
app.use('/login', limiter);
app.use('/register', limiter);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Basic middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // Prevent CSRF via cookies
  }
}));

// Set up CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Flash messages
app.use(flash());

// Global middleware - pass data to all views
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.session.user || null;
  res.locals.csrfToken = req.csrfToken();
  res.locals.user = req.session.userId ? { 
    isLoggedIn: true, 
    isAdmin: req.session.isAdmin 
  } : null;
  next();
});

// Auth middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Auth middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId }
    });
    
    if (user && user.isAdmin) {
      return next();
    }
    
    res.status(403).render('error', { message: 'Access denied. Admin rights required.', status: 403 });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).render('error', { message: 'Server error while checking admin status', status: 500 });
  }
};

// Input validation middleware
const validateEmail = (req, res, next) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).render(req.path.slice(1), { 
      error: 'Please enter a valid email address',
      csrfToken: req.csrfToken()
    });
  }
  next();
};

const validatePassword = (req, res, next) => {
  if (req.body.password.length < 8) {
    return res.status(400).render(req.path.slice(1), { 
      error: 'Password must be at least 8 characters long',
      csrfToken: req.csrfToken()
    });
  }
  next();
};

// Import route modules
const tourRoutes = require('./routes/tourRoutes');
const authRoutes = require('./routes/authRoutes');
const blogApi = require('./api/blogs/id');

// Apply routes
app.use('/api/blogs', blogApi);
app.use('/api', tourRoutes);
app.use('/tours', tourRoutes);
app.use('/auth', authRoutes);

// Homepage route
app.get('/', async (req, res) => {
  try {
    // Fetch featured tours from Prisma
    const featuredTours = await prisma.tour.findMany({
      where: { featured: true },
      take: 3
    });

    // Fetch all tours from raw PostgreSQL client
    const allTours = await getTours();

    res.render('index', {
      tours: featuredTours,
      allTours: allTours,
      title: 'Ohalik Tours - Experience the Adventure'
    });
  } catch (error) {
    console.error('Error fetching homepage tours:', error);
    res.render('index', {
      tours: [],
      allTours: [],
      title: 'Ohalik Tours - Experience the Adventure'
    });
  }
});

// Auth status API
app.get('/auth/status', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Auth routes
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect(req.session.isAdmin ? '/admin' : '/dashboard');
  }
  res.render('login');
});

app.post('/login', validateEmail, async (req, res) => {
  const { email, password, adminKey } = req.body;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.render('login', { error: 'Invalid email or password' });
    }
    
    // Check for admin access
    let isAdmin = user.isAdmin;
    
    // If user is not already an admin, check if they provided the correct admin key
    if (!isAdmin && adminKey === process.env.ADMIN_KEY) {
      isAdmin = true;
      // Update user to admin in database
      await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true }
      });
    }
    
    // Set session variables
    req.session.userId = user.id;
    req.session.isAdmin = isAdmin;
    
    // Redirect based on role
    if (isAdmin) {
      res.redirect('/admin');
    } else {
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', { error: 'Server error while logging in', status: 500 });
  }
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect(req.session.isAdmin ? '/admin' : '/dashboard');
  }
  res.render('register');
});

app.post('/register', validateEmail, validatePassword, async (req, res) => {
  const { email, password, firstName, lastName, adminKey } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.render('register', { error: 'Email already in use' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if registering as admin
    const isAdmin = adminKey === process.env.ADMIN_KEY;
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin
      }
    });
    
    // Set session variables
    req.session.userId = user.id;
    req.session.isAdmin = isAdmin;
    
    // Redirect based on role
    if (isAdmin) {
      res.redirect('/admin');
    } else {
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register', { error: 'Server error while registering user', status: 500 });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// User dashboard route
app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        isSubscribed: true,
      }
    });
    
    res.render('dashboard', { user });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { message: 'Server error while loading dashboard', status: 500 });
  }
});

// Admin dashboard route
app.get('/admin', isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        isSubscribed: true,
        createdAt: true,
      }
    });
    
    const blogCount = await prisma.blog.count();
    const publishedBlogCount = await prisma.blog.count({
      where: { published: true }
    });
    
    res.render('admin', { users, blogCount, publishedBlogCount });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', { message: 'Server error while fetching admin dashboard data', status: 500 });
  }
});

// Blog routes
app.get('/blog', async (req, res) => {
  console.log('Blog route handler called');
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`Found ${blogs.length} blogs`);
    res.render('blog', { blogs });
  } catch (err) {
    console.error('Error loading blog page:', err);
    res.status(500).render('error', { 
      message: 'Server error while loading blogs.',
      status: 500 
    });
  }
});

app.get('/blog/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await prisma.blog.findUnique({
      where: { id: String(id) },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!blog) {
      return res.status(404).render('error', { message: 'Blog not found', status: 404 });
    }

    if (!blog.published && !req.session?.isAdmin) {
      return res.status(403).render('error', { message: 'This blog post is not yet published', status: 403 });
    }

    res.render('blog-detail', { blog });
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).render('error', { message: 'Server error while fetching blog post', status: 500 });
  }
});

// API routes for blog management (admin only)
app.post('/api/blogs', isAdmin, csrfProtection, async (req, res) => {
  try {
    const { title, content, coverImage, published } = req.body;
    
    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        coverImage,
        published: published === 'true',
        authorId: req.session.userId
      }
    });
    
    res.redirect('/admin/blogs');
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).render('error', { message: 'Server error while creating blog post', status: 500 });
  }
});

// Newsletter subscription
app.post('/api/newsletter/subscribe', csrfProtection, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    
    // If user is logged in, update their subscription status
    if (req.session.userId) {
      await prisma.user.update({
        where: { id: req.session.userId },
        data: { isSubscribed: true }
      });
    }
    
    res.json({ success: true, message: 'You have successfully subscribed!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ success: false, message: 'Server error while processing subscription', status: 500 });
  }
});

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error', { message: 'Page not found', status: 404 });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle CSRF token errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', { 
      message: 'Invalid or expired form submission. Please try again.', status: 403 
    });
  }
  
  res.status(500).render('error', { 
    message: 'Something went wrong! Please try again later.', status: 500 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;