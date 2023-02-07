# lightsoff-contact-commercants

[![Lint Code Base](https://github.com/LaReserveTech/lightsoff-contact-commercants/actions/workflows/linter.yml/badge.svg)](https://github.com/LaReserveTech/lightsoff-contact-commercants/actions/workflows/linter.yml)
[![CodeQL](https://github.com/LaReserveTech/lightsoff-contact-commercants/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/LaReserveTech/lightsoff-contact-commercants/actions/workflows/github-code-scanning/codeql)
[![DeepScan grade](https://deepscan.io/api/teams/20315/projects/23795/branches/726211/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=20315&pid=23795&bid=726211)
[![DeepSource](https://deepsource.io/gh/LaReserveTech/lightsoff-contact-commercants.svg/?label=active+issues&show_trend=true&token=UdiMYggOKCmf_DVsVwdKpiy-)](https://deepsource.io/gh/LaReserveTech/lightsoff-contact-commercants/?ref=repository-badge)

This repository contains two scripts :

- `index.js` to sending SMS or Programmatic Voice Call to commercants
- `pullIncomings.js` to pull responses received by SMS

## Setup

- `npm install`
- Download 'places.json' and 'reviews.json' from Metabase
- Fill .env file
- `node index.js` or `node pullIncomings.js`
