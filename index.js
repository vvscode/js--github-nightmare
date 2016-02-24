var Nightmare = require('nightmare');
var gitHubPO = require('./github');

var nm = Nightmare({ show: true });

var query = 'ugly hack';

nm
  .use(gitHubPO.search(query))
  .end()
  .then(() => console.log('Done'));
