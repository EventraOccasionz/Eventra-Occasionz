// Firebase Functions for Email Notifications
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password
    }
});

// Send email notification on RSVP submission
exports.sendRSVPNotification = functions.firestore
    .document('guests/{guestId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        
        // Check if RSVP status changed
        if (before.RSVPStatus !== after.RSVPStatus && after.RSVPStatus) {
            const mailOptions = {
                from: '"Eventra Occasionz" <noreply@eventraoccasionz.com>',
                to: 'eventraoccasionz@gmail.com', // Admin email
                subject: `RSVP Update: ${after.guestName}`,
                html: `
                    <h2>New RSVP Response</h2>
                    <p><strong>Guest Name:</strong> ${after.guestName}</p>
                    <p><strong>Status:</strong> ${after.RSVPStatus}</p>
                    <p><strong>Guest Count:</strong> ${after.guestCount || 1}</p>
                    <p><strong>Food Preference:</strong> ${after.foodPreference || 'Not specified'}</p>
                    <p><strong>Arrival Date:</strong> ${after.arrivalDate || 'Not specified'}</p>
                    <p><strong>Departure Date:</strong> ${after.departureDate || 'Not specified'}</p>
                    <p><strong>Pickup Required:</strong> ${after.pickupRequired ? 'Yes' : 'No'}</p>
                    ${after.photoURL ? `<p><strong>Photo:</strong> <a href="${after.photoURL}">View Photo</a></p>` : ''}
                `
            };
            
            try {
                await transporter.sendMail(mailOptions);
                console.log('RSVP notification sent');
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }
        
        return null;
    });

// HTTP function to send test email
exports.sendTestEmail = functions.https.onRequest(async (req, res) => {
    const mailOptions = {
        from: '"Eventra Occasionz" <noreply@eventraoccasionz.com>',
        to: req.query.email || 'eventraoccasionz@gmail.com',
        subject: 'Test Email from Eventra Occasionz',
        html: '<h1>Test Email</h1><p>This is a test email from your RSVP system.</p>'
    };
    
    try {
        await transporter.sendMail(mailOptions);
        res.send('Email sent successfully');
    } catch (error) {
        res.status(500).send('Error sending email: ' + error.message);
    }
});