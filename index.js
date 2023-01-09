const reviews = require('./reviews.json');
const places = require('./places.json')
const curl = require('curl')

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUND_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumberFrom = process.env.TWILIO_PHONE;
const client = require("twilio")(accountSid, authToken);

const findPlaceById = (id) => {
    const key = Object.keys(places).find(place => places[place]["Google Place ID"] === id)
    return places[key]
}

const findOtherReviews = (id) => {
    const key = Object.keys(reviews).find(review => reviews[review]["Google Place ID"] === id && reviews[review]["Do It For Me"] == false)
    return reviews[key]
}

let placesContacted = [] // array temporaire pour stocker les lieux déjà contactés au cours du run actuel de l'algo

reviews.forEach(review => {
    let google_place_id = review["Google Place ID"] // stockage du Google Place ID de la review traitée en cours

    
    // on check si on est bien sur une review ou on nous a demandé de contacter le commerce + qu'il n'y a pas d'autres reviews déjà existantes + que le numéro n'a pas déjà été contacté
    if (review["Do It For Me"] == true && findOtherReviews(google_place_id) == undefined && placesContacted.find(id => id == google_place_id) == undefined) {
        let place = findPlaceById(google_place_id) // on stock la Google Place
        let phone_number = place["Phone Number"] // on stock le numéro associé à la Google Place
        
        // on check si le numéro n'est pas vide
        if(phone_number !== null) {
            const number = phoneUtil.parseAndKeepRawInput(phone_number, 'FR') // on formate correctement le numéro pour Twilio
            
            // évaluation du numéro : si fixe => appel / si portable => SMS
            if(number[3] == "6" || number[3] == "7") {
                client.messages
                    .create({ body: "Bonjour, plusieurs clients ont indiqué que la devanture de votre commerce restait allumée la nuit. Si c’est le cas, auriez-vous la gentillesse de l’éteindre en partant le soir ? Nous sommes en pleine crise énergétique et il est essentiel que nous fassions tous attention à faire des économies d’énergie pour éviter les coupures cet hiver et préserver notre planète. Chaque geste compte. En plus, depuis février 2022 la loi a été endurcie et vous risquez une forte amende en cas de contrôle. Bonne journée.", from: phoneNumberFrom, to: number })
                    .then(message => console.log(message.sid));
            } else {
                client.calls
                    .create({
                        url: 'https://github.com/La-Reserve-Tech-For-Good/lightsoff-contact-commercants/blob/main/voice.xml',
                        to: number,
                        from: phoneNumberFrom
                    })
                    .then(call => console.log(call.sid));
            }

            // on ajoute une review TWILIO sur l'api
            curl.post(process.env.API_URL + google_place_id + '/reviews', {
                "do_it_for_me": false,
                "type": "TWILIO"
            },[],console.log(err))

            // on ajoute la Google Place dans le tableau des places déjà contactées au cours du run
            placesContacted.push(google_place_id)
        }
        
    }
});


