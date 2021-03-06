const Discord = require('discord.js');
const osrsGE = require('../extraData/geData.json');
const osrsData = require('../extraData/osrsData.json');
const superagent = require('superagent');
const helper = require('../helper.js');

const flags = Object.keys(osrsData.flags);
const baseURL = 'http://services.runescape.com';
const wikiSearchURL = 'http://oldschoolrunescape.wikia.com/api/v1/Search/List';
const wikiIcon = 'https://vignette.wikia.nocookie.net/2007scape/images/8/89/Wiki-wordmark.png';
const geEndpoint = '/m=itemdb_oldschool/api/catalogue/detail.json';

module.exports.run = async (client, message, args) => {
  if (args.length <= 1) {
    return message.channel.send(`\`Please enter the right query. ex. ${process.env.PREFIX || '!'}osrs player Name or !osrs item dragon dagger\``);
  }

  let msg = await message.channel.send('`Searching...`');
  let [searchWhat, ...query] = args;

  if (searchWhat && query) {
    let [last] = query.slice(-1);
    if (last.toLowerCase() === 'potion') {
      query[query.length - 1] += '(4)';
    } else if (last.toLowerCase() === 'mix') {
      query[query.length - 1] += '(2)';
    }
  }

  try {
    if (searchWhat === 'player') {
      let hiscoreEndpoint = osrsData.flags['--normal'];
      for (let i = 0; i < query.length; i++) {
        if (flags.includes(query[i])) {
          hiscoreEndpoint = osrsData.flags[query[i]];
          query.splice(i, 1);
        }
      }
      const name = helper.capFirstLetter(query.join(' '));
      const {text: player} = await superagent.get(baseURL + hiscoreEndpoint)
        .query({player: name});
      const hiscore = interpretPlayerScores(player);
      return msg.edit(createPlayerEmbed(hiscore.Skills, name));
    } else if (searchWhat === 'item') {
      const search = query.join(' ');
      const itemId = findItemIdByName(osrsGE, search);
      const {text: item} = await superagent.get(baseURL + geEndpoint)
        .query({item: itemId});
      return msg.edit(createItemEmbed(JSON.parse(item).item));
    } else if (searchWhat === 'wiki') {
      const search = query.join(' ');
      const results = await wikiSearch(search);
      return msg.edit(createWikiSearchEmbed(results.items, `Search results for "${search}"`));
    } else {
      return msg.edit(`\`Please enter the right query. ex. ${process.env.PREFIX || '!'}osrs player Name or ${process.env.PREFIX || '!'}osrs item dragon dagger\``);
    }
  } catch (err) {
    if (searchWhat === 'item') {
      const search = query.join(' ');
      const results = await wikiSearch(search);
      return msg.edit(createWikiSearchEmbed(results.items, 'Item not found in GE. Here are the results on wiki.'));
    }
    console.log(err);
    return msg.edit('`Item or player not found.`');
  }
};

module.exports.help = {
  name: 'osrs',
  parameters: '<item/player> <item_name/user_name>',
  descShort: 'Look up anyone on the Old School RuneScape highscores or look up any item on the OSRS Grand Exchange.',
};

async function wikiSearch(query) {
  try {
    const {text: searches} = await superagent.get(wikiSearchURL)
      .query({query: query, limit: 5, minArticleQuality: 80});
    return JSON.parse(searches);
  } catch (err) {
    console.log(err);
    return {items: 'Error in Search'};
  }
}

function createPlayerEmbed(player, name) {
  let embed = new Discord.RichEmbed()
    .setTitle(name)
    .setDescription(`Hiscores for ${name}`)
    .setColor('#e01d1d');
    // .setThumbnail(logoLink)
  for (let skill of Object.keys(player)) {
    let current = player[skill];
    embed.addField(`${skill}`, `Rank: ${current.Rank}\nLevel: ${current.Level}\nXP: ${current.XP}`, true);
  }
  return embed;
}

function createItemEmbed(item) {
  let encoded = fixedEncodeURIComponent(item.name.replace(' ', '_'));
  let embed = new Discord.RichEmbed()
    .setTitle(item.name)
    .setThumbnail(item.icon_large)
    .setColor('#ffe207')
    .setDescription(item.description)
    .addField('Members Item', `${item.members.toUpperCase()}`)
    .addField('Price', `${item.current.price} gp`, true)
    .addField('Today\'s Trend', `${item.today.price} gp`, true)
    .addField('30 Day Trend', `${item.day30.change}`, true)
    .addField('90 Day Trend', `${item.day90.change}`, true)
    .addField('180 Day Trend', `${item.day180.change}`, true)
    .addField('Links:',
      `[Wiki Link](http://oldschoolrunescape.wikia.com/wiki/${encoded})\n` +
      `[OSRS GE Graph](http://services.runescape.com/m=itemdb_oldschool/${encoded}/viewitem?obj=${item.id})`
    );
  return embed;
}

function createWikiSearchEmbed(search, desc) {
  let embed = new Discord.RichEmbed()
    .setTitle('Search Results')
    .setColor('#5b3921')
    .setThumbnail(wikiIcon)
    .setDescription(desc);

  for (let i = 0; i < search.length; i++) {
    embed.addField(`${search[i].title}`, `${search[i].url}`);
  }
  return embed;
}

function interpretPlayerScores(data) {
  let skills = data.split('\n');
  // removes last empty entry
  skills.pop();
  let numbers = [];
  skills.forEach((element) => {
    let nums = element.split(',');
    numbers.push(nums);
  });
  let scoreKeys = {
    Skills: ['Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer', 'Magic', 'Cooking',
      'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility',
      'Thieving', 'Slayer', 'Farming', 'Runecraft', 'Hunter', 'Construction'],
    Minigame: ['Clue Scrolls (easy)', 'Clue Scrolls (medium)', 'Clue Scrolls (all)', 'Bounty Hunter - Rogue',
      'Bounty Hunter - Hunter', 'Clue Scrolls (hard)', 'LMS - Rank', 'Clue Scrolls (elite)', 'Clue Scrolls (master)'],
  };
  let result = {Skills: getSkillData(scoreKeys.Skills, numbers), Minigame: getMinigameData(scoreKeys.Minigame, numbers)};
  return result;
}
// 24
function getSkillData(emptySkills, data) {
  let result = {};
  for (let i = 0; i < emptySkills.length; i++) {
    result[emptySkills[i]] = {
      Rank: data[i][0],
      Level: data[i][1],
      XP: data[i][2],
    };
  }
  return result;
}

function getMinigameData(emptyMinigames, data) {
  let result = {};
  let idx = 24;
  for (let i = 0; i < emptyMinigames.length; i++, idx++) {
    if (data[idx][0] !== '-1') {
      result[emptyMinigames[i]] = {
        Rank: data[idx][0],
        Score: data[idx][1],
      };
    }
  }
  return result;
}

function findItemIdByName(object, value) {
  return Object.keys(object).find((key) => object[key].toLowerCase() === value.toLowerCase());
}

// source from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
