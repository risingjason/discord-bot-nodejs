const capFirstLetter = (str) => {
  let words = str.split(' ');
  let newWords = [];
  let result = '';
  if (words.length > 1) {
    for (let word of words) {
      const newWord = word.substring(0, 1).toUpperCase() + word.substring(1);
      newWords.push(newWord);
    }
    result = newWords.join(' ');
  } else {
    result = str.substring(0, 1).toUpperCase() + str.substring(1);
  }
  return result;
};

const replaceAll = (str, replaceWhat, replaceTo) => {
  const regex = new RegExp(replaceWhat, 'g');
  return str.replace(regex, replaceTo);
};

module.exports = {
  capFirstLetter: capFirstLetter,
  replaceAll: replaceAll,
};
