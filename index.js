var Nightmare = require('nightmare');
var nightmare = Nightmare({
  show: true,
  paths: {
    userData: './data'
  }
});
var vo = require('vo');
var _ = require('lodash');
var fs = require('fs');
var QUERY = '1b17d62d38a4846efa7ea4de4b773b581787b0f1';
var FILE_NAME = 'log.txt';
var QUERY_REG_EXP = '[a-z0-9]{40}';
var TIMEOUT_BASE = 20000;

vo(function* () {
  yield nightmare
    .goto('https://github.com/search')
    .insert('.search-form-fluid input[type=text]', QUERY)
    .click('.search-form-fluid button[type=submit]')
    .wait('.codesearch-results');
  yield nightmare.evaluate(function() {
    $('.octicon-code').parent('a').click();
  }).wait(TIMEOUT_BASE / 4);

  var i = 0;

  var languages = yield nightmare.evaluate(function() {
    return $('.codesearch-aside .filter-list .filter-item').toArray().map((item) => item.href);
  });

  for(var j = 0; j< languages.length; j++) {
    var langUrl = languages[j];

    yield nightmare.goto(langUrl);

    var hasNextPage = yield nightmare.exists('a[rel="next"]');
    do {
      var url = yield nightmare.url();

      yield nightmare.wait(Math.ceil(Math.random()*TIMEOUT_BASE));

      // we should pass QUERY_REG_EXP cause it's not defined at browser
      var matches = yield nightmare.evaluate(function(QUERY_REG_EXP) {
        return $(document).text().match(new RegExp(QUERY_REG_EXP, 'g'));
      }, QUERY_REG_EXP);

      var fileContent = fs.existsSync(FILE_NAME) ? fs.readFileSync(FILE_NAME, 'utf8') : '';
      savedMatches = fileContent.split('\n');
      savedMatches = _.compact(_.uniq(_.concat(savedMatches, matches)));
      fs.writeFileSync(FILE_NAME, savedMatches.join('\n'));

      console.log(`Process page ${url} founded ${matches.length} / ${savedMatches.length}`);
      hasNextPage = yield nightmare.exists('a[rel="next"]')
      if(hasNextPage) {
        yield nightmare
          .click('a[rel="next"]')
          .wait(Math.ceil(Math.random()*TIMEOUT_BASE));
      }
      i++;
    } while(hasNextPage);
  }

  return i;
})(function (err, result) {
  if (err) {
    console.error(err);
    return err;
  }

  console.log(`Done for ${result} pages`);
});;
