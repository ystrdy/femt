const gulp = require('gulp');

const { TASK_DEVELOP, TASK_PRODUCT } = require('./gulp/constants');
const develop = require('./gulp/develop');
const product = require('./gulp/product');

gulp.task(TASK_DEVELOP, develop);
gulp.task(TASK_PRODUCT, product);