var vo = require('vo');
var _ = require('lodash');
var fs = require('fs');
var nightmare = require('nightmare')({
  show: true, // set false if no need to check behavior
  paths: {
    userData: './data' // allow save cookies, etc.
  }
});
// query for search
var QUERY = '1b17d62d38a4846efa7ea';
// file to save matches
var FILE_NAME = 'log.txt';
// regular expression for matching over search results
var QUERY_REG_EXP = '[a-z0-9]{40}';
// timeout base to skip bot-blocking system
var TIMEOUT_BASE = 20000;

var i = 0; // counter for pages

vo(function*() {
  // Open search page
  yield nightmare
    .goto('https://github.com/search')
    .insert('.search-form-fluid input[type=text]', QUERY)
    .click('.search-form-fluid button[type=submit]')
    .wait('.codesearch-results');

  // Switch to code section
  yield nightmare.evaluate(function() {
    $('.octicon-code').parent('a').click();
  }).wait(TIMEOUT_BASE / 4);

  // Parse actual languages for search
  var languages = yield nightmare.evaluate(function() {
    return $('.codesearch-aside .filter-list .filter-item').toArray().map((item) => item.href);
  });

  // iterate over each language ( to increase number of parsed pages, cause limit is 100)
  for (var j = 0; j < languages.length; j++) {
    var langUrl = languages[j];

    yield nightmare.goto(langUrl);

    // iterate over language's pages ( it's allow parse up to 100 per each lang )
    var hasNextPage = yield nightmare.exists('a[rel="next"]');
    do {
      var url = yield nightmare.url();

      yield nightmare.wait(Math.ceil(Math.random() * TIMEOUT_BASE));

      // parse results with regExp
      var matches = yield nightmare.evaluate(function(QUERY_REG_EXP) {
        // we should pass QUERY_REG_EXP cause it's not defined at browser
        return $(document).text().match(new RegExp(QUERY_REG_EXP, 'g'));
      }, QUERY_REG_EXP);

      // flush founded content to log file ( for case if we catch some error or exit parsing
      // it allows save founded results )
      var fileContent = fs.existsSync(FILE_NAME) ? fs.readFileSync(FILE_NAME, 'utf8') : '';
      savedMatches = fileContent.split('\n');
      savedMatches = _.compact(_.uniq(_.concat(savedMatches, matches)));
      fs.writeFileSync(FILE_NAME, savedMatches.join('\n'));

      console.log(`Process page ${url} founded ${matches.length} / ${savedMatches.length}`);
      // we we still have pages inside current lang - go there
      hasNextPage = yield nightmare.exists('a[rel="next"]')
      if (hasNextPage) {
        yield nightmare
          .click('a[rel="next"]')
          .wait(Math.ceil(Math.random() * TIMEOUT_BASE));
      }
      i++;
    } while (hasNextPage);
  }
  // return number of parsed pages
  // all parsed results already stored at log-file
  return i;
})(function(err, result) {
  if (err) {
    console.error(err);
    return err;
  }

  console.log(`Done for ${result} pages`);
});
