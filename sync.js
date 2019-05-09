const fs = require('fs');
const db = require('./queries');
const utils = require('./validations');
const config = require('./config.json');

const { filesDir } = config;

fs.readdir(filesDir, (err, files) => {
  console.log(`Directory read. Found ${files.length} files.`);
  files = files.filter(utils.isDataFile);
  console.log(`Files filtered. There are ${files.length} ipset/netset files.`);
  let ipArray = [];
  files.forEach((file) => {
    const data = fs.readFileSync(`./${filesDir}/${file}`, 'utf8');
    const ips = data.match(/^\d.[\s\S]*/gm);
    const source = data.match(/^# Maintainer\s+:+\s+.+/gim);
    const sourceStr = source[0].substring(source[0].lastIndexOf(' ') + 1, source[0].length);
    if (ips) {
      const temp = ips[0].split('\n');
      for (let i = 0; i < temp.length - 1; i++) {
        const tmp = {'ip': temp[i], 'source': sourceStr};
        ipArray.push(tmp);
      }
    }
  });
  console.log(`ipArray.length = ${ipArray.length}`);

  console.time('groupBy');
  const result = utils.groupBy(ipArray, item => [item.ip]);
  console.timeEnd('groupBy');
  console.log(result);

  console.time('mergeIPSources');
  const resultArray = utils.mergeIPSources(result, []);
  console.timeEnd('mergeIPSources');

  console.log(`Start importing ${resultArray.length} IPs`);
  db.syncData(resultArray);
});
