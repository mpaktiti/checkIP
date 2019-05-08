/* eslint-disable no-console */
const fs = require('fs');
const db = require('./queries');
const config = require('./config.json');

const { filesDir } = config;

// filter out the files I need to read and process
function isDataFile(filename) {
  return (filename.split('.')[1] === 'ipset' || filename.split('.')[1] === 'netset');
}

fs.readdir(filesDir, (err, files) => {
  console.log(`Directory read. Found ${files.length} files.`);
  files = files.filter(isDataFile);
  console.log(`Files filtered. There are ${files.length} ipset/netset files.`);
  let ipArray = [];
  files.forEach((file) => {
    let data = fs.readFileSync(`./${filesDir}/${file}`, 'utf8');
    let ips = data.match(/^\d.[\s\S]*/gm);
    if (ips) {
      ipArray.push(ips[0].split('\n'));
    }
  });
  ipArray = [].concat.apply([], ipArray).filter(n => n); // flatten array
  const distinctIP = [...new Set(ipArray)];
  console.log(`Start importing ${distinctIP.length} IPs`);
  //db.syncData(distinctIP);
});
