const axios = require('axios')
const fs = require('fs')
require('dotenv').config()

/**
 *
 * @param {object} queryRequested
 * @param {object} visualiszationRequested
 * @param {string} fileName
 */
const downloader = async (
  queryRequested,
  visualiszationRequested,
  fileName
) => {
  const response = await axios({
    method: 'post',
    url: `https://${process.env.METABASE_URL}/api/session`,
    data: {
      username: `${process.env.METABASE_MAIL}`,
      password: `${process.env.METABASE_PWD}`
    }
  })
  console.log(response.data.id)

  const datasetPlaces = await axios.post(
    'https://o2t37cyszh.execute-api.eu-west-3.amazonaws.com/api/dataset/json',
    new URLSearchParams({
      query: queryRequested,
      visualization_settings: visualiszationRequested
    }),
    {
      headers: {
        authority: 'o2t37cyszh.execute-api.eu-west-3.amazonaws.com',
        accept: '*/*',
        'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        cookie:
          'metabase.DEVICE=50796a71-d0ec-49c3-9dcd-d453b57c5f53; _ga=GA1.2.938353226.1673289574; metabase.TIMEOUT=alive; metabase.SESSION=475122a0-579c-45cd-bc49-f5e84783c5c0; _gid=GA1.2.1794784591.1675763957; _gat=1',
        origin: `https://${process.env.METABASE_URL}`,
        referer: `https://${process.env.METABASE_URL}/question`,
        'sec-ch-ua':
          '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
      }
    }
  )

  const json = JSON.stringify(datasetPlaces.data)

  fs.writeFile(fileName, json, 'utf8', function (res, err) {
    console.log(res, err)
  })
}

downloader(
  '{"database":2,"query":{"source-table":7},"type":"query","middleware":{"js-int-to-string?":true,"add-default-userland-constraints?":true}}',
  '{"column_settings":{},"table.pivot":false,"table.pivot_column":"report_count","table.cell_column":"latitude","table.columns":[{"name":"google_place_id","fieldRef":["field",44,null],"enabled":true},{"name":"name","fieldRef":["field",38,null],"enabled":true},{"name":"google_place_url","fieldRef":["field",46,null],"enabled":true},{"name":"address","fieldRef":["field",41,null],"enabled":true},{"name":"phone_number","fieldRef":["field",45,null],"enabled":true},{"name":"created_at","fieldRef":["field",43,{"temporal-unit":"default"}],"enabled":true},{"name":"report_count","fieldRef":["field",39,null],"enabled":true},{"name":"latitude","fieldRef":["field",42,null],"enabled":true},{"name":"longitude","fieldRef":["field",40,null],"enabled":true}],"table.column_formatting":[]}',
  'places.json'
)
downloader(
  '{"database":2,"query":{"source-table":6},"type":"query","middleware":{"js-int-to-string?":true,"add-default-userland-constraints?":true}}',
  '{"column_settings":{},"table.pivot":false,"table.pivot_column":"completed_at","table.cell_column":"do_it_for_me","table.columns":[{"name":"id","fieldRef":["field",48,null],"enabled":true},{"name":"google_place_id","fieldRef":["field",52,null],"enabled":true},{"name":"created_at","fieldRef":["field",49,{"temporal-unit":"default"}],"enabled":true},{"name":"completed_at","fieldRef":["field",51,{"temporal-unit":"default"}],"enabled":true},{"name":"type","fieldRef":["field",47,null],"enabled":true},{"name":"do_it_for_me","fieldRef":["field",50,null],"enabled":true}],"table.column_formatting":[]}',
  'reviews.json'
)
