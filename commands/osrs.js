const Discord = require('discord.js')
const osrs = require('osrs-wrapper')

module.exports.run = async (client, message, args) => {
  let searchWhat = null
  let query = null
  let msg = await message.channel.send('`Searching...`')
  if (args.length !== 0 && args.length !== 1) {
    searchWhat = args.shift()
    query = args.join(' ')
  }
  try {
    if (searchWhat === 'player') {
      let player = await osrs.hiscores.getPlayer(query)
      return msg.edit(createPlayerEmbed(player.Skills, query))
    } else if (searchWhat === 'item') {
      let item = await osrs.ge.getItem(query)
      return msg.edit(createItemEmbed(JSON.parse(item).item))
    }
  } catch (err) {
    return msg.edit('`Item or player not found.`')
  }
}

module.exports.help = {
  name: 'osrs',
  descShort: 'Look up anyone on the Old School RuneScape highscores or look up any item on the OSRS Grand Exchange.'
}

function createPlayerEmbed (player, name) {
  let embed = new Discord.RichEmbed()
    .setTitle(name)
    .setDescription(`Hiscores for ${name}`)
    .setColor('#e01d1d')
    // .setThumbnail(logoLink)
  for (let skill of Object.keys(player)) {
    let current = player[skill]
    embed.addField(`${skill}`, `Rank: ${current.rank}\nLevel: ${current.level}\nXP: ${current.xp}`, true)
  }
  return embed
}

function createItemEmbed (item, graph) {
  let encoded = fixedEncodeURIComponent(item.name.replace(' ', '_'))
  let embed = new Discord.RichEmbed()
    .setTitle(item.name)
    .setThumbnail(item.icon_large)
    .setColor('#ffe207')
    .setDescription(item.description)
    .addField('Members Item', `${item.members.toUpperCase()}`)
    .addField('Price', `${item.current.price} gp`, true)
    .addField('Today\'s Trend', `${item.today.price.replace(' ', '')} gp`, true)
    .addField('30 Day Trend', `${item.day30.change}`, true)
    .addField('90 Day Trend', `${item.day90.change}`, true)
    .addField('180 Day Trend', `${item.day180.change}`, true)
    .addField('Links:',
      `[Wiki Link](http://oldschoolrunescape.wikia.com/wiki/${encoded})\n` +
      `[OSRS GE Graph](http://services.runescape.com/m=itemdb_oldschool/${encoded}/viewitem?obj=${item.id})`
    )
  return embed
}

// source from
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function fixedEncodeURIComponent (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16)
  })
}
