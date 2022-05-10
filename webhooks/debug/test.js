
const opds = require('opds-fetcher-parser');
const fs = require('fs');

(async function () {

  const o = new opds.OpdsFetcher();

  const feed = await o.feedRequest("https://storage.googleapis.com/audiobook_edrlab/navigation/thematic_list.json");

  console.log(feed);
  fs.writeFileSync("/tmp/feed.json", JSON.stringify(feed));
  
})()