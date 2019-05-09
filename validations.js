// only *.ipset and *.netset should be processed
function isDataFile(filename) {
  return (filename.split('.')[1] === 'ipset' || filename.split('.')[1] === 'netset');
}

// get a JSON object containing arrays of [IP, Source]
// and group the entries by IP
// Input: 1D array of JSON objects + function to group by
// Output: 2D array of JSON objects, grouped by f()
function groupBy(array, f) {
  let groups = {};
  array.forEach((o) => {
    let group = JSON.stringify(f(o));
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });
  return Object.keys(groups).map(group => groups[group]);
}

// get an array of grouped IPs and merge the sources
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

module.exports = {
  isDataFile,
  groupBy,
  mergeIPSources
};
