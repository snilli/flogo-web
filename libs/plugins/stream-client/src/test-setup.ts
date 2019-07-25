import 'jest-preset-angular';

const $ = require('jquery');
global['$'] = global['jQuery'] = $;
require('bootstrap/dist/js/bootstrap.min');
