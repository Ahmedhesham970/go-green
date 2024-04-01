// emailUtils.js
function generateVerificationEmailMessage(userName, verificationCode) {
    return `

    Dear ${userName},

    You are receiving this email because you requested to verify your account with GoGreen. Please use the following verification code to complete the process:

    Verification Code: ${verificationCode}

    If you did not request this verification, please ignore this email. Thank you for using GoGreen.

    Best regards,
    GoGreen Team
    `;
}

module.exports = { generateVerificationEmailMessage };
