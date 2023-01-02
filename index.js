require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUND_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumberFrom = process.env.TWILIO_PHONE;
const client = require("twilio")(accountSid, authToken);

var phones = ["+33667877564"]

phones.forEach(phone => {
    if(phone[3] == "6" || phone[3] == "7") {
        client.messages
            .create({ body: "Hello from Twilio", from: phoneNumberFrom, to: phone })
            .then(message => console.log(message.sid));
    } else {
        client.calls
            .create({
                url: 'https://github.com/La-Reserve-Tech-For-Good/lightsoff-contact-commercants/blob/main/voice.xml',
                to: phone,
                from: phoneNumberFrom
            })
            .then(call => console.log(call.sid));
    }
});


  