import 'es6-promise/auto';
import 'console-polyfill';
// jquery注入全局
window['$'] = window['jquery'] = window['jQuery'] = require('jquery');
// json polyfill
if (!window['JSON']) {
    window['JSON'] = require('json-fallback');
}