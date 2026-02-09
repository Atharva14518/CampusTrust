/**
 * Twilio Notification Service
 * Handles SMS notifications for attendance and alerts
 */

class NotificationService {
    constructor() {
        this.twilioEnabled = false;
        this.client = null;
        this.fromNumber = null;

        this.initialize();
    }

    initialize() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (accountSid && authToken && this.fromNumber) {
            try {
                const twilio = require('twilio');
                this.client = twilio(accountSid, authToken);
                this.twilioEnabled = true;
                console.log('✓ Twilio SMS service initialized');
            } catch (error) {
                console.log('⚠ Twilio not available:', error.message);
            }
        } else {
            console.log('ℹ Twilio not configured - SMS notifications disabled');
        }
    }

    /**
     * Send SMS notification
     */
    async sendSMS(to, message) {
        if (!this.twilioEnabled) {
            console.log('[SMS Mock]', to, message);
            return { success: true, mock: true };
        }

        try {
            const result = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: to
            });

            return {
                success: true,
                messageId: result.sid
            };
        } catch (error) {
            console.error('SMS send error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send attendance confirmation
     */
    async sendAttendanceConfirmation(phone, studentName, classId) {
        const message = `🎓 TrustCampus: ${studentName}, your attendance for ${classId} has been recorded on the blockchain! Keep up the great work! 🔥`;
        return this.sendSMS(phone, message);
    }

    /**
     * Send parent notification
     */
    async sendParentNotification(phone, studentName, classId, timestamp) {
        const time = new Date(timestamp).toLocaleTimeString();
        const message = `📚 TrustCampus Alert: ${studentName} marked attendance for ${classId} at ${time}. Blockchain verified ✓`;
        return this.sendSMS(phone, message);
    }

    /**
     * Send streak achievement
     */
    async sendStreakAchievement(phone, studentName, streakDays) {
        const message = `🔥 Congratulations ${studentName}! You've achieved a ${streakDays}-day attendance streak on TrustCampus! Keep it up!`;
        return this.sendSMS(phone, message);
    }

    /**
     * Send certificate minted notification
     */
    async sendCertificateMinted(phone, studentName, certTitle) {
        const message = `🏆 Awesome news ${studentName}! Your "${certTitle}" certificate has been minted as an NFT on TrustCampus! 🎉`;
        return this.sendSMS(phone, message);
    }

    /**
     * Check if Twilio is enabled
     */
    isEnabled() {
        return this.twilioEnabled;
    }
}

module.exports = new NotificationService();
