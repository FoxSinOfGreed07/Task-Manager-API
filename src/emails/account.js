const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'priyanshuv2001@gmail.com',
        pass : 'crimsondawn'
    }
})

const sendWelcomeMail = (email, name) => {
    const mailOptions = {
        from : 'priyanshuv2001@gmail.com',
        to : email,
        subject : 'Welcome to Task-Manager',
        text : `Hello, ${name} Welcome to Task-Manager, I am FoxSinOfGreed and this is my Task Management Web App. Have Fun!`
    }
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            console.log(error);
        } else {
            console.log('Mail sent!');
        }
    })
}

const sendGoodbyeMail = (email, name) => {
    const mailOptions = {
        from : 'priyanshuv2001@gmail.com',
        to : email,
        subject : 'Sorry To See You Go',
        text : `Hello, ${name}! I am sorry to see you go, please let me know what I can improve upon. `
    }
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            console.log(error);
        } else {
            console.log('Mail sent!');
        }
    })
}

module.exports = {
    sendWelcomeMail,
    sendGoodbyeMail

}