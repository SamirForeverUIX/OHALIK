const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { BookingEmailService } = require('../services/email-service');

const prisma = new PrismaClient();

// GET tour detail page
router.get('/:id', async (req, res) => {
    try {
        const tourId = parseInt(req.params.id);

        if (isNaN(tourId)) {
            return res.status(400).render('error', { message: 'Invalid tour ID' });
        }

        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            include: {
                itinerary: {
                    orderBy: { dayNumber: 'asc' }
                }
            }
        });

        if (!tour) {
            return res.status(404).render('error', { message: 'Tour not found' });
        }

        res.render('tours/detail', {
            tour,
            title: `${tour.name} | Ohalik Travel`
        });
    } catch (error) {
        console.error('Error fetching tour details:', error);
        res.status(500).render('error', {
            message: 'Error fetching tour details',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// POST booking for a tour
router.post('/book/:id', async (req, res) => {
    try {
        const tourId = parseInt(req.params.id);

        if (isNaN(tourId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tour ID'
            });
        }

        // Fetch tour from database
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            include: {
                itinerary: {
                    orderBy: { dayNumber: 'asc' }
                }
            }
        });

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tour not found'
            });
        }

        // Extract booking data
        const {
            firstName,
            lastName,
            email,
            phone,
            birthDate,
            bookingDate,
            participants,
            message
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !bookingDate || !participants) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Prepare data for email service
        const bookingData = {
            firstName,
            lastName,
            email,
            phone,
            birthDate,
            bookingDate,
            participants,
            message
        };

        const tourData = {
            id: tour.id,
            name: tour.name,
            location: tour.location,
            duration: tour.duration,
            difficulty: tour.difficulty,
            price: tour.price
        };

        // Call BookingEmailService
        const emailService = new BookingEmailService();
        await emailService.sendBookingEmails(bookingData, tourData);

        res.json({
            success: true,
            message: 'Booking request sent successfully! You will receive a confirmation email shortly.'
        });

    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing booking. Please try again or contact us directly.'
        });
    }
});

module.exports = router;
