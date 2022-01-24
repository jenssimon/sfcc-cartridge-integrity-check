[![NPM version][npm-image]][npm-url] [![Downloads][npm-downloads-image]][npm-url] [![Dependencies][deps-image]][deps-url] [![star this repo][gh-stars-image]][gh-url] [![fork this repo][gh-forks-image]][gh-url] [![Build Status][travis-image]][travis-url] ![Code Style][codestyle-image]

# sfcc-cartridge-integrity-check

> Check the integrity of SFCC cartridges that shouldn't be modified.

![Screenshot](https://github.com/jenssimon/sfcc-cartridge-integrity-check/raw/master/screenshot.png)

## Install

```sh
$ yarn add sfcc-cartridge-integrity-check --dev
```

## Usage

Salesforce Commerce Cloud (SFCC) introduced the concept of cartridges that shouldn't be modified with their Storefront Reference Architecture (SFRA).

To protect your customization projects from (unintented) modifications of such cartridges here is a small tool to check these cartridges.
The git hash of the last commit in the cartridge is used to check if there is a modification. Also the uncommitted files will be checked and a warning will be shown.

```javascript
const cartridgeIntegrity = require('./cartridgeIntegrity');

// retrieve this data from a file
const integrityData = {
  'app_storefront_base': 'SHA',
};

const { checkCartridgeIntegrity, generateCartridgeIntegrityDataFile } = cartridgeIntegrity({
  readOnlyCartridges: [
    'app_storefront_base',
  ],
  integrityData,
  customizationProject: true, // if false integrity won't be checked
});

checkCartridgeIntegrity();
```

You can generate a file containing the integrity data as JSON.

```javascript
generateCartridgeIntegrityDataFile('./path/to/file.json');
```

## License

MIT © 2022 [Jens Simon](https://github.com/jenssimon)

[npm-url]: https://www.npmjs.com/package/sfcc-cartridge-integrity-check
[npm-image]: https://badgen.net/npm/v/sfcc-cartridge-integrity-check
[npm-downloads-image]: https://badgen.net/npm/dw/sfcc-cartridge-integrity-check

[deps-url]: https://david-dm.org/jenssimon/sfcc-cartridge-integrity-check
[deps-image]: https://badgen.net/david/dep/jenssimon/sfcc-cartridge-integrity-check

[gh-url]: https://github.com/jenssimon/sfcc-cartridge-integrity-check
[gh-stars-image]: https://badgen.net/github/stars/jenssimon/sfcc-cartridge-integrity-check
[gh-forks-image]: https://badgen.net/github/forks/jenssimon/sfcc-cartridge-integrity-check

[travis-url]: https://travis-ci.com/jenssimon/sfcc-cartridge-integrity-check
[travis-image]: https://travis-ci.com/jenssimon/sfcc-cartridge-integrity-check.svg?branch=master

[codestyle-image]: https://badgen.net/badge/code%20style/airbnb/f2a
