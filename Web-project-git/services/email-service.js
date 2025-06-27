// email-service.js - Complete Email Service for Tour Bookings
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class BookingEmailService {
    constructor(config = {}) {
        this.config = {
            // SMTP Configuration
            smtp: {
                host: config.smtp?.host || process.env.SMTP_HOST || 'smtp.gmail.com',
                port: config.smtp?.port || process.env.SMTP_PORT || 587,
                secure: config.smtp?.secure || false, // true for 465, false for other ports
                auth: {
                    user: config.smtp?.user || process.env.SMTP_USER,
                    pass: config.smtp?.pass || process.env.SMTP_PASS
                }
            },
            // Email addresses
            from: config.from || process.env.FROM_EMAIL || 'bookings@SilkRoadDiscoveries.com',
            tourAgentEmail: config.tourAgentEmail || process.env.TOUR_AGENT_EMAIL || 'agent@SilkRoadDiscoveries.com',
            // Company details
            company: {
                name: config.company?.name || 'Your Tour Company',
                website: config.company?.website || 'https://SilkRoadDiscoveries.com',
                phone: config.company?.phone || '+998939936139',
                address: config.company?.address || '123 Adventure St, Samarkand City'
            }
        };
        
        this.transporter = null;
        this.initialize();
    }
    
    async initialize() {
        try {
            this.transporter = nodemailer.createTransport(this.config.smtp);
            
            // Verify connection
            await this.transporter.verify();
            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
            throw new Error('Email service configuration error');
        }
    }
    
    /**
     * Send booking confirmation emails (to both customer and tour agent)
     */
    async sendBookingEmails(bookingData, tourData) {
        try {
            // Send email to tour agent
            const agentEmailResult = await this.sendToTourAgent(bookingData, tourData);
            
            // Send confirmation email to customer
            const customerEmailResult = await this.sendToCustomer(bookingData, tourData);
            
            return {
                success: true,
                agentEmail: agentEmailResult,
                customerEmail: customerEmailResult,
                message: 'Booking emails sent successfully'
            };
        } catch (error) {
            console.error('Email sending failed:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send booking emails'
            };
        }
    }
    
    /**
     * Send detailed booking information to tour agent
     */
    async sendToTourAgent(bookingData, tourData) {
        const subject = `🎯 NEW BOOKING REQUEST - ${tourData.name} | ${bookingData.firstName} ${bookingData.lastName}`;
        
        const html = this.generateTourAgentEmailTemplate(bookingData, tourData);
        const text = this.generateTourAgentTextTemplate(bookingData, tourData);
        
        const mailOptions = {
            from: `"${this.config.company.name}" <${this.config.from}>`,
            to: this.config.tourAgentEmail,
            subject: subject,
            text: text,
            html: html,
            priority: 'high',
            headers: {
                'X-Category': 'booking-request',
                'X-Tour-ID': tourData.id,
                'X-Customer-Email': bookingData.email
            }
        };
        
        return await this.transporter.sendMail(mailOptions);
    }
    
    /**
     * Send booking confirmation to customer
     */
    async sendToCustomer(bookingData, tourData) {
        const subject = `✅ Booking Request Received - ${tourData.name}`;
        
        const html = this.generateCustomerEmailTemplate(bookingData, tourData);
        const text = this.generateCustomerTextTemplate(bookingData, tourData);
        
        const mailOptions = {
            from: `"${this.config.company.name}" <${this.config.from}>`,
            to: bookingData.email,
            cc: bookingData.additionalEmail || null, // If they provided additional contact
            subject: subject,
            text: text,
            html: html,
            headers: {
                'X-Category': 'booking-confirmation',
                'X-Tour-ID': tourData.id
            }
        };
        
        return await this.transporter.sendMail(mailOptions);
    }
    
    /**
     * Generate structured HTML email template for tour agent
     */
    generateTourAgentEmailTemplate(bookingData, tourData) {
        const bookingDate = new Date(bookingData.bookingDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const totalPrice = tourData.price * parseInt(bookingData.participants);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Request</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .urgent-badge { background: #ff4757; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 10px; }
        .content { padding: 40px; }
        .booking-summary { background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .customer-details, .tour-details { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .section-title { color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #e9ecef; padding-bottom: 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { margin-bottom: 10px; }
        .info-label { font-weight: 600; color: #6c757d; display: inline-block; width: 130px; }
        .info-value { color: #495057; }
        .price-highlight { background: #28a745; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; }
        .action-buttons { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: 600; }
        .btn-primary { background: #007bff; color: white; }
        .btn-success { background: #28a745; color: white; }
        .special-requests { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { background: #343a40; color: white; padding: 20px; text-align: center; font-size: 14px; }
        @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .container { margin: 10px; } .content { padding: 20px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 NEW BOOKING REQUEST</h1>
            <div class="urgent-badge">ACTION REQUIRED</div>
        </div>
        
        <div class="content">
            <div class="booking-summary">
                <h2 style="margin-top: 0; color: #28a745;">📋 Quick Summary</h2>
                <div class="info-grid">
                    <div><strong>Customer:</strong> ${bookingData.firstName} ${bookingData.lastName}</div>
                    <div><strong>Tour:</strong> ${tourData.name}</div>
                    <div><strong>Date:</strong> ${bookingDate}</div>
                    <div><strong>Participants:</strong> ${bookingData.participants} people</div>
                </div>
            </div>
            
            <div class="customer-details">
                <div class="section-title">👤 Customer Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Full Name:</span>
                        <span class="info-value">${bookingData.firstName} ${bookingData.lastName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value"><a href="mailto:${bookingData.email}">${bookingData.email}</a></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        <span class="info-value"><a href="tel:${bookingData.phone}">${bookingData.phone}</a></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Nationality:</span>
                        <span class="info-value">${bookingData.nationality || 'Not specified'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Age Group:</span>
                        <span class="info-value">${bookingData.ageGroup || 'Not specified'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Emergency Contact:</span>
                        <span class="info-value">${bookingData.emergencyContact || 'Not provided'}</span>
                    </div>
                </div>
            </div>
            
            <div class="tour-details">
                <div class="section-title">🏔️ Tour Details</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Tour Name:</span>
                        <span class="info-value">${tourData.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Duration:</span>
                        <span class="info-value">${tourData.duration} days</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Difficulty:</span>
                        <span class="info-value">${tourData.difficulty}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Max Group Size:</span>
                        <span class="info-value">${tourData.maxGroup} people</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Requested Date:</span>
                        <span class="info-value">${bookingDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Participants:</span>
                        <span class="info-value">${bookingData.participants} people</span>
                    </div>
                </div>
            </div>
            
            ${bookingData.specialRequests ? `
            <div class="special-requests">
                <div class="section-title">⚠️ Special Requests / Notes</div>
                <p style="margin: 0; font-style: italic;">"${bookingData.specialRequests}"</p>
            </div>
            ` : ''}
            
            <div class="price-highlight">
                💰 Total Estimated Price: $${totalPrice}
                <div style="font-size: 14px; font-weight: normal; margin-top: 5px;">
                    (${bookingData.participants} × $${tourData.price} per person)
                </div>
            </div>
            
            <div class="action-buttons">
                <a href="mailto:${bookingData.email}?subject=Re: ${tourData.name} Booking Request&body=Dear ${bookingData.firstName}," class="btn btn-primary">
                    📧 Reply to Customer
                </a>
                <a href="tel:${bookingData.phone}" class="btn btn-success">
                    📞 Call Customer
                </a>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <h3 style="margin-top: 0; color: #495057;">📝 Next Steps:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Contact the customer within 24 hours</li>
                    <li>Confirm availability for the requested date</li>
                    <li>Discuss pricing, payment options, and any special requirements</li>
                    <li>Send detailed itinerary and booking terms</li>
                    <li>Arrange document collection (passport, insurance, etc.)</li>
                    <li>Schedule final confirmation call before the tour</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>This booking request was submitted on ${new Date().toLocaleString()}</p>
            <p>📧 ${this.config.from} | 📞 ${this.config.company.phone} | 🌐 ${this.config.company.website}</p>
        </div>
    </div>
</body>
</html>`;
    }
    
    /**
     * Generate text version for tour agent
     */
    generateTourAgentTextTemplate(bookingData, tourData) {
        const bookingDate = new Date(bookingData.bookingDate).toLocaleDateString();
        const totalPrice = tourData.price * parseInt(bookingData.participants);
        
        return `
🎯 NEW BOOKING REQUEST - ACTION REQUIRED

CUSTOMER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${bookingData.firstName} ${bookingData.lastName}
Email: ${bookingData.email}
Phone: ${bookingData.phone}
Nationality: ${bookingData.nationality || 'Not specified'}
Emergency Contact: ${bookingData.emergencyContact || 'Not provided'}

TOUR DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tour: ${tourData.name}
Duration: ${tourData.duration} days
Difficulty: ${tourData.difficulty}
Requested Date: ${bookingDate}
Participants: ${bookingData.participants} people
Total Price: $${totalPrice} (${bookingData.participants} × $${tourData.price})

${bookingData.specialRequests ? `SPECIAL REQUESTS:\n${bookingData.specialRequests}\n` : ''}

NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Contact customer within 24 hours
2. Confirm date availability
3. Discuss pricing and payment options
4. Send detailed itinerary
5. Arrange document collection
6. Schedule final confirmation

Booking submitted: ${new Date().toLocaleString()}
Contact: ${this.config.company.phone} | ${this.config.company.website}
        `;
    }
    
    /**
     * Generate customer confirmation email template
     */
    generateCustomerEmailTemplate(bookingData, tourData) {
        const bookingDate = new Date(bookingData.bookingDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .checkmark { font-size: 60px; margin-bottom: 20px; }
        .content { padding: 40px 30px; }
        .booking-info { background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e9ecef; }
        .info-row:last-child { border-bottom: none; margin-bottom: 0; }
        .label { font-weight: 600; color: #6c757d; }
        .value { color: #495057; }
        .next-steps { background: #e7f3ff; border: 1px solid #b6d7ff; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .contact-info { background: #343a40; color: white; padding: 25px; text-align: center; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 10px 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="checkmark">✅</div>
            <h1>Booking Request Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Thank you for choosing ${this.config.company.name}</p>
        </div>
        
        <div class="content">
            <p>Dear ${bookingData.firstName},</p>
            
            <p>We've successfully received your booking request for <strong>${tourData.name}</strong>. Our tour specialist will review your request and contact you within 24 hours to discuss the details and finalize your adventure!</p>
            
            <div class="booking-info">
                <h3 style="margin-top: 0; color: #28a745;">📋 Your Booking Details</h3>
                <div class="info-row">
                    <span class="label">Tour:</span>
                    <span class="value">${tourData.name}</span>
                </div>
                <div class="info-row">
                    <span class="label">Requested Date:</span>
                    <span class="value">${bookingDate}</span>
                </div>
                <div class="info-row">
                    <span class="label">Duration:</span>
                    <span class="value">${tourData.duration} days</span>
                </div>
                <div class="info-row">
                    <span class="label">Participants:</span>
                    <span class="value">${bookingData.participants} people</span>
                </div>
                <div class="info-row">
                    <span class="label">Difficulty Level:</span>
                    <span class="value">${tourData.difficulty}</span>
                </div>
                <div class="info-row">
                    <span class="label">Estimated Price:</span>
                    <span class="value"><strong>$${tourData.price * parseInt(bookingData.participants)}</strong></span>
                </div>
            </div>
            
            <div class="next-steps">
                <h3 style="margin-top: 0; color: #0066cc;">🚀 What Happens Next?</h3>
                <ol style="margin: 0; padding-left: 20px;">
                    <li><strong>Confirmation Call (24-48 hours):</strong> Our tour specialist will contact you to discuss your requirements and confirm availability.</li>
                    <li><strong>Detailed Itinerary:</strong> We'll send you a comprehensive tour itinerary with all the exciting details.</li>
                    <li><strong>Payment & Documentation:</strong> We'll guide you through the payment process and required documents.</li>
                    <li><strong>Pre-Tour Briefing:</strong> Final preparations and packing list will be shared before your adventure begins!</li>
                </ol>
            </div>
            
            <p><strong>Questions or need to make changes?</strong> Feel free to reply to this email or contact us directly. We're here to make your adventure perfect!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${this.config.from}" class="btn">📧 Contact Us</a>
                <a href="${this.config.company.website}" class="btn">🌐 Visit Website</a>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center; font-style: italic;">
                "Adventure awaits! We can't wait to help you create unforgettable memories."
            </p>
        </div>
        
        <div class="contact-info">
            <h3 style="margin-top: 0;">📞 Contact Information</h3>
            <p><strong>Email:</strong> ${this.config.from}</p>
            <p><strong>Phone:</strong> ${this.config.company.phone}</p>
            <p><strong>Website:</strong> ${this.config.company.website}</p>
            <p style="margin-bottom: 0; font-size: 12px; opacity: 0.8;">
                ${this.config.company.address}
            </p>
        </div>
    </div>
</body>
</html>`;
    }
    
    /**
     * Generate customer text version
     */
    generateCustomerTextTemplate(bookingData, tourData) {
        const bookingDate = new Date(bookingData.bookingDate).toLocaleDateString();
        
        return `
✅ BOOKING REQUEST RECEIVED!

Dear ${bookingData.firstName},

Thank you for choosing ${this.config.company.name}! We've successfully received your booking request for ${tourData.name}.

YOUR BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tour: ${tourData.name}
Requested Date: ${bookingDate}
Duration: ${tourData.duration} days
Participants: ${bookingData.participants} people
Difficulty: ${tourData.difficulty}
Estimated Price: $${tourData.price * parseInt(bookingData.participants)}

WHAT HAPPENS NEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Our tour specialist will contact you within 24 hours
2. We'll confirm availability and discuss your requirements
3. Detailed itinerary will be sent to you
4. Payment and documentation guidance
5. Pre-tour briefing and preparation

Questions? Reply to this email or contact us:
📧 ${this.config.from}
📞 ${this.config.company.phone}
🌐 ${this.config.company.website}

Adventure awaits! We can't wait to help you create unforgettable memories.

Best regards,
${this.config.company.name} Team
        `;
    }
}

// Usage example and route handler
async function handleBookingSubmission(req, res) {
    try {
        const bookingData = req.body;
        const tourData = {
            id: req.params.tourId,
            name: 'Sample Tour Name', // Get from database
            duration: 5,
            difficulty: 'Medium',
            maxGroup: 12,
            price: 299 
        };
        
        // Initialize email service
        const emailService = new BookingEmailService({
            tourAgentEmail: 'agent@yourtourcompany.com',
            company: {
                name: 'Amazing Tours',
                website: 'https://amazingtours.com',
                phone: '+1-234-567-8900',
                address: '123 Adventure St, Tour City'
            }
        });
        
        // Send emails
        const emailResult = await emailService.sendBookingEmails(bookingData, tourData);
        
        if (emailResult.success) {
            res.json({
                success: true,
                message: 'Booking request submitted successfully! You will receive a confirmation email shortly.',
                bookingId: generateBookingId() // Optional: generate unique ID
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Booking submitted but there was an issue sending confirmation emails.'
            });
        }
    } catch (error) {
        console.error('Booking submission error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your booking. Please try again.'
        });
    }
}

function generateBookingId() {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

module.exports = { BookingEmailService, handleBookingSubmission };