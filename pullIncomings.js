require('dotenv').config()
const ovh = require('ovh')({
  appKey: process.env.OVH_APP_KEY,
  appSecret: process.env.OVH_APP_SECRET_KEY,
  consumerKey: process.env.OVH_CONSUMER_KEY
})
const axios = require('axios')

const tempData = async () => {
  return new Promise((resolve, reject) => {
    ovh.request(
      'GET',
      '/sms/' + process.env.OVH_SERVICE_NAME + '/incoming',
      function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      }
    )
  })
}

tempData()
  .then((messages) => {
    messages.forEach((messageID) => {
      ovh.request(
        'GET',
        '/sms/' + process.env.OVH_SERVICE_NAME + '/incoming/' + messageID,
        function (err, msgText) {
          if (err) {
            console.log(err)
          } else {
            axios({
              method: 'post',
              url: process.env.SLACK_WEBHOOK,
              headers: { 'Content-type': 'application/json' },
              data: { text: msgText.message }
            })
          }
        }
      )

    ovh.request('DELETE', '/sms/' + process.env.OVH_SERVICE_NAME + '/incoming/' + messageID, function (err, res) {
      if (err) {
        console.log(err)
      } else {
        console.log('Réponse supprimée : ' + messageID)
      }
    })
  })
  .catch((err) => {
    console.error(err)
  })
