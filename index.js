var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true });
var vo = require('vo');
// var gitHubPO = require('./github')(nightmare);

var query = 'ugly hack';

vo(function* () {
  yield nightmare
    .goto('https://github.com/search')
    .insert('.search-form-fluid input[type=text]', query)
    .click('.search-form-fluid button[type=submit]')
    .wait('.codesearch-results');

  var i = 0;
  var hasNextPage = yield nightmare.exists('a[rel="next"]');
  do {
    var url = yield nightmare.url();
    console.log('Process page', url);
    hasNextPage = yield nightmare.exists('a[rel="next"]')
    if(hasNextPage) {
      yield nightmare
        .click('a[rel="next"]')
        .wait(3000);
    }
    i++;
  } while(hasNextPage);

  return i;
})(function (err, result) {
  console.log(result, err);
  if (err) {
    console.error(err);
    return err;
  }

  console.log(`Done for ${result} pages`);
});;
