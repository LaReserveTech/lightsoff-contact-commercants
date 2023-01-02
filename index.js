require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUND_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumberFrom = process.env.TWILIO_PHONE;
const client = require("twilio")(accountSid, authToken);

var phones = ["+33667877564"]

phones.forEach(phone => {
    if(phone[3] == "6" || phone[3] == "7") {
        client.messages
            .create({ body: "Bonjour, plusieurs clients ont indiqué que la devanture de votre commerce restait allumée la nuit. Si c’est le cas, auriez-vous la gentillesse de l’éteindre en partant le soir ? Nous sommes en pleine crise énergétique et il est essentiel que nous fassions tous attention à faire des économies d’énergie pour éviter les coupures cet hiver et préserver notre planète. Chaque geste compte. En plus, depuis février 2022 la loi a été endurcie et vous risquez une forte amende en cas de contrôle. Bonne journée.", from: phoneNumberFrom, to: phone })
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


  