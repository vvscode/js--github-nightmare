var Nightmare = require('nightmare');
var nm = Nightmare({ show: true });
var gitHubPO = require('./github')(nm);


var query = 'ugly hack';

gitHubPO.search(query)
  .then(gitHubPO.iterateOverPages(
    () => nm.url().then((currentUrl) => console.log(currentUrl)),
    () => nm.end().then(() => {
        console.log('Done');
      })
  ));
