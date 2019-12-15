const sgMail = require('@sendgrid/mail')

const sendGridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIKey)

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'pranavpande94@yahoo.in',
        subject: 'Thanks for joining in!',
        text: `Hi ${name}, welcome to task manager! We're excited to have you. Let us know how you get along with the app.`
    })
}

const sendDeleteMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'pranavpande94@yahoo.in',
        subject: 'We will miss you',
        text: `Hi ${name}, we're sad to see you leave. Let us know what we could have done better to make you stay and we'll work on it.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendDeleteMail
}