var search = function(nightmare) {
  return function(query) {
    return nightmare
          .goto('https://github.com/search')
          .insert('.search-form-fluid input[type=text]', query)
          .click('.search-form-fluid button[type=submit]')
          .wait('.codesearch-results');
  };
};

var iterateOverPages = function(nightmare) {
  return function (stepCb, finCb) {
    var runNext = function() {
      return Promise.resolve(stepCb())
        .then(() => nightmare.exists('a[rel="next"]'))
        .then((hasNextPage) => {
          console.log('Check next page', hasNextPage);
          if(hasNextPage) {
            return nightmare
              .click('a[rel="next"]')
              .wait(300)
              .run(runNext);
          }
          return Promise.resolve(finCb());
        });
    };
    runNext();
  };
}

module.exports = function(nm) {
  return {
    search: search(nm),
    iterateOverPages: iterateOverPages(nm)
  };
}
