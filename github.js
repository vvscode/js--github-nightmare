var search = function(query) {
  return function(nightmare) {
    return nightmare
          .goto('https://github.com/search')
          .insert('.search-form-fluid input[type=text]', query)
          .click('.search-form-fluid button[type=submit]')
          .wait('.codesearch-results');
  };
};


module.exports = {
  search
};
