/* eslint-disable no-console */
const fs = require('fs');
const db = require('./queries');
const config = require('./config.json');

const { filesDir } = config;

// filter out the files I need to read and process
function isDataFile(filename) {
  return (filename.split('.')[1] === 'ipset' || filename.split('.')[1] === 'netset');
}

function mergeIPSources(inputArray, resultArray) {
  for (let i = 0; i < inputArray.length; i++) {
    let { source } = inputArray[i][0];
    for (let j = 1; j < inputArray[i].length; j++) {
      if (source.indexOf(inputArray[i][j].source) === -1) {
        source += `,${inputArray[i][j].source}`;
      }
    }
    resultArray.push([inputArray[i][0].ip, source]);
  }
  return resultArray;
}

function groupBy(array, f) {
  let groups = {};
  array.forEach((o) => {
    let group = JSON.stringify(f(o));
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });
  return Object.keys(groups).map(group => groups[group]);
}

fs.readdir(filesDir, (err, files) => {
  console.log(`Directory read. Found ${files.length} files.`);
  files = files.filter(isDataFile);
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
  const result = groupBy(ipArray, item => [item.ip]);
  console.timeEnd('groupBy');

  console.time('mergeIPSources');
  const resultArray = mergeIPSources(result, []);
  console.timeEnd('mergeIPSources');

  console.log(`Start importing ${resultArray.length} IPs`);
  db.syncData(resultArray);
});
