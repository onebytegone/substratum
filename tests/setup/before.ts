import * as chai from 'chai';
import enableStrictlyEqual from '@silvermine/chai-strictly-equal';

let jsdom: any = require('jsdom-global');

chai.use(enableStrictlyEqual);
jsdom(undefined, {}); // returns a function that could be called to clean up
