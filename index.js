const reviews = require('./reviews.json')
const places = require('./places.json')
const curl = require('curl')

const PNF = require('google-libphonenumber').PhoneNumberFormat
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUND_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const phoneNumberVoiceFrom = process.env.TWILIO_PHONE_VOICE
const client = require('twilio')(accountSid, authToken)

const ovh = require('ovh')({
  appKey: process.env.OVH_APP_KEY,
  appSecret: process.env.OVH_APP_SECRET_KEY,
  consumerKey: process.env.OVH_CONSUMER_KEY
})

const findPlaceById = (id) => {
  const key = Object.keys(places).find(place => places[place]['Google Place ID'] === id)
  return places[key]
}

const findOtherReviews = (id) => {
  const key = Object.keys(reviews).find(review => reviews[review]['Google Place ID'] === id && reviews[review]['Do It For Me'] === false)
  return reviews[key]
}

const placesContacted = [] // array temporaire pour stocker les lieux déjà contactés au cours du run actuel de l'algo

reviews.forEach(review => {
  const googlePlaceId = review['Google Place ID'] // stockage du Google Place ID de la review traitée en cours

  // on check si on est bien sur une review ou on nous a demandé de contacter le commerce + qu'il n'y a pas d'autres reviews déjà existantes + que le numéro n'a pas déjà été contacté
  if (review['Do It For Me'] === true && findOtherReviews(googlePlaceId) === undefined && placesContacted.find(id => id === googlePlaceId) === undefined) {
    const place = findPlaceById(googlePlaceId) // on stock la Google Place
    const phoneNumberNotFormatted = place['Phone Number'] // on stock le numéro associé à la Google Place

    // on check si le numéro n'est pas vide
    if (phoneNumberNotFormatted !== null) {
      const number = phoneUtil.parseAndKeepRawInput(phoneNumberNotFormatted, 'FR') // on formate correctement le numéro pour Twilio/OVH
      const phoneNumber = phoneUtil.format(number, PNF.E164)

      // évaluation du numéro : si fixe => appel / si portable => SMS
      if (phoneNumber[3] === '6' || phoneNumber[3] === '7') {
        ovh.request('POST', '/sms/' + process.env.OVH_SERVICE_NAME + '/jobs', {
          message: 'Bonjour, plusieurs clients ont indiqué que la devanture de votre commerce restait allumée la nuit. Si c’est le cas, auriez-vous la gentillesse de l’éteindre en partant le soir ? Nous sommes en pleine crise énergétique et il est essentiel que nous fassions tous attention à faire des économies d’énergie pour éviter les coupures cet hiver et préserver notre planète. Chaque geste compte. En plus, depuis février 2022 la loi a été endurcie et vous risquez une forte amende en cas de contrôle. Bonne journée.',
          senderForResponse: true,
          noStopClause: true,
          tag: 'Contact SMS LightsOff',
          receivers: [phoneNumber]
        }, function (errsend, result) {
          console.log(errsend, result)
        })

        // on ajoute une review OVH sur l'api
        curl.post(process.env.API_URL + googlePlaceId + '/reviews', {
          do_it_for_me: false,
          type: 'SMS'
        }, [], function (err, res, body) {
          if (err) {
            console.log(err)
          } else {
            console.log(res.statusCode, body)
          }
        })
      } else {
        client.calls
          .create({
            url: 'https://handler.twilio.com/twiml/EHa81ec24cdcc086714c029aaada0a87ed',
            to: phoneNumber,
            from: phoneNumberVoiceFrom
          })
          .then(call => console.log(call.sid))

        // on ajoute une review TWILIO sur l'api
        curl.post(process.env.API_URL + googlePlaceId + '/reviews', {
          do_it_for_me: false,
          type: 'PHONE_CALL'
        }, [], function (err, res, body) {
          if (err) {
            console.log(err)
          } else {
            console.log(res.statusCode, body)
          }
        })
      }

      // on ajoute la Google Place dans le tableau des places déjà contactées au cours du run
      placesContacted.push(googlePlaceId)
    }
  }
})
