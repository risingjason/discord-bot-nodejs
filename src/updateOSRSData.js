const superagent = require('superagent');
const fs = require('fs');
const file = './extraData/geData.json';

module.exports.updateGE = async () => {
  let items = await superagent.get('https://rsbuddy.com/exchange/summary.json');
  if (fs.existsSync(file)) {
    let currentItems = require(file);
    let currentItemSize = Object.keys(currentItems).length;
    let itemSize = Object.keys(items.body).length;

    if (currentItemSize < itemSize) {
      console.log('Updating GE Items.');

      let json = JSON.stringify(makeItemObject(currentItems, items.body));
      fs.writeFileSync(file, json, 'utf8');
    } else {
      console.log('GE items update not needed.');
    }
  } else {
    console.log('Writing GE Items on new file.');
    let json = JSON.stringify(makeItemObject({}, items.body));
    fs.writeFileSync(file, json, 'utf8');
  }
};

function makeItemObject(current, items) {
  Object.keys(items).forEach((itemNumber) => {
    if (!current[itemNumber]) {
      current[itemNumber] = items[itemNumber].name;
    }
  });
  return current;
}
