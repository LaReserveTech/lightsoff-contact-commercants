const reviews = require('./reviews.json')
const places = require('./places.json')
const axios = require('axios')

const PNF = require('google-libphonenumber').PhoneNumberFormat
const phoneUtil =
  require('google-libphonenumber').PhoneNumberUtil.getInstance()

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

/**
 *
 * @param {ID of place looked for} id
 *
 * @returns Place object
 */
const findPlaceById = (id) => {
  const key = Object.keys(places).find(
    (place) => places[place]['Google Place ID'] === id
  )
  return places[key]
}

/**
 *
 * @param {ID of place that we looked for reviews} id
 * @returns Array of reviews for Google Place ID & with Do It For Me true
 */
const findOtherReviews = (id) => {
  const key = Object.keys(reviews).find(
    (review) =>
      reviews[review]['Google Place ID'] === id &&
      reviews[review]['Do It For Me'] === false
  )
  return reviews[key]
}

const placesContacted = [] // array temporaire pour stocker les lieux déjà contactés au cours du run actuel de l'algo

reviews.forEach((review) => {
  if (placesContacted.length <= 100) {
    const googlePlaceId = review['Google Place ID'] // stockage du Google Place ID de la review traitée en cours

    // on check si on est bien sur une review ou on nous a demandé de contacter le commerce + qu'il n'y a pas d'autres reviews déjà existantes + que le numéro n'a pas déjà été contacté
    if (
      review['Do It For Me'] === true &&
      findOtherReviews(googlePlaceId) === undefined &&
      placesContacted.find((id) => id === googlePlaceId) === undefined
    ) {
      const place = findPlaceById(googlePlaceId) // on stock la Google Place
      const phoneNumberNotFormatted = place['Phone Number'] // on stock le numéro associé à la Google Place

      // on check si le numéro n'est pas vide
      if (phoneNumberNotFormatted !== null) {
        const number = phoneUtil.parseAndKeepRawInput(
          phoneNumberNotFormatted,
          'FR'
        ) // on formate correctement le numéro pour Twilio/OVH
        const phoneNumber = phoneUtil.format(number, PNF.E164)

        // évaluation du numéro : si fixe => appel / si portable => SMS / si 08 => nothing
        if (phoneNumber[3] === '8') {
          console.log('Numéro spécial')
        } else if (phoneNumber[3] === '6' || phoneNumber[3] === '7') {
          ovh.request(
            'POST',
            `/sms/${process.env.OVH_SERVICE_NAME}/jobs`,
            {
              message:
                'Bonjour, plusieurs clients ont indiqué que la devanture de votre commerce restait allumée la nuit. Si c’est le cas, auriez-vous la gentillesse de l’éteindre en partant le soir ? Nous sommes en pleine crise énergétique et il est essentiel que nous fassions tous attention à faire des économies d’énergie pour éviter les coupures cet hiver et préserver notre planète. Chaque geste compte. En plus, depuis février 2022 la loi a été endurcie et vous risquez une forte amende en cas de contrôle. Bonne journée.',
              senderForResponse: true,
              noStopClause: true,
              tag: 'Contact SMS LightsOff',
              receivers: [phoneNumber]
            },
            function (errsend, result) {
              console.log(errsend, result)

              // on ajoute une review SMS sur l'api
              axios({
                method: 'post',
                url: `${process.env.API_URL}places/${googlePlaceId}/reviews`,
                data: { do_it_for_me: false, type: 'SMS' }
              })
            }
          )
        } else {
          client.calls
            .create({
              url: 'https://handler.twilio.com/twiml/EHa81ec24cdcc086714c029aaada0a87ed',
              to: phoneNumber,
              from: phoneNumberVoiceFrom
            })
            .then((call) => {
              console.log(call.sid)

              // on ajoute une review PHONE CALL sur l'api
              axios({
                method: 'post',
                url: `${process.env.API_URL}places/${googlePlaceId}/reviews`,
                data: { do_it_for_me: false, type: 'PHONE_CALL' }
              })
            })
        }

        // on ajoute la Google Place dans le tableau des places déjà contactées au cours du run
        placesContacted.push(googlePlaceId)
      }
    }
  }
})
