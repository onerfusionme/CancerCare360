// Bootstrap wrapper: load DATABASE_URL before anything else runs
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'yes' : 'NO');
require('./dist/src/main');
