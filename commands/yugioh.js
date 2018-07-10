const Discord = require('discord.js')
const superagent = require('superagent')
const yugiohData = require('../extraData/yugiohData.json')
const helper = require('../helper.js')

const yugipediaLink = 'https://yugipedia.com/wiki/'
const ygoHubLink = 'https://www.ygohub.com/api/card_info'
const yugiohWikiLink = 'http://yugioh.wikia.com/api/v1/Search/List'
module.exports.run = async (client, message, args) => {
  if (args.length === 0) {
    return message.channel.send(`\`Please put a card name to search. ex. ${process.env.PREFIX || '!'}yugioh ash blossom & joyous spring\``)
  }
  let query = encodeURIComponent(args.join(' '))
  let msg = await message.channel.send('`Searching...`')
  const searchWhat = args[1]
  let response = null
  try {
    response = await superagent.get(ygoHubLink)
      .query(`name=${query}`)
    response = JSON.parse(response.text)
  } catch (err) {
    return msg.edit('`Error while searching.`')
  }

  if (response.status !== 'success') {
    let cardName = helper.capFirstLetter(args.join(' '))
    return msg.edit(await createCardNotFoundEmbed(cardName))
  }

  let cardInfo = response.card
  return msg.edit(createYugiohEmbed(cardInfo))
}

module.exports.help = {
  name: 'yugioh',
  parameters: '<card_name>',
  descShort: 'Search for your favorite yugioh cards!'
}

function createYugiohEmbed (cardInfo) {
  let embed = new Discord.RichEmbed()
    .setTitle(cardInfo.name)
    .setThumbnail(cardInfo.image_path)
    .setDescription(`${cardInfo.type} Card`)

  if (cardInfo.is_monster) {
    embed.addField('Attack / Defense', `${cardInfo.attack} / ${cardInfo.defense}`)
      .addField('Attribute', cardInfo.attribute, true)
      .addField('Type', cardInfo.species, true)
      .addField('Stars/Rank', cardInfo.stars ? cardInfo.stars : 'None', true)
      .addField('Card Type', cardInfo.monster_types.join('/'), true)
      .setColor(yugiohData.attributes[cardInfo.attribute])
    if (cardInfo.hasMaterials) {
      embed.addField('Materials', cardInfo.materials)
    }
    if (cardInfo.is_link) {
      let arrows = []
      for (let arrow of cardInfo.link_markers) {
        arrows.push(yugiohData.link_arrows[arrow])
      }
      embed.addField('Link Rating', cardInfo.link_number, true)
        .addField('Link Arrows', arrows.join(' '), true)
    }
    if (cardInfo.is_pendulum) {
      embed.addField('Pendulum Scale', `:arrow_backward: ${cardInfo.pendulum_left} :arrow_forward:`)
        .addField('Pendulum Effect', cardInfo.pendulum_text)
    }
    // Normal monsters do not have effects, Fusion Normal monster have cardInfo.text but no actual effect
    let isNormal = cardInfo.monster_types.includes('Effect') ? 'Monster Effect' : 'Description'
    let normalText = !cardInfo.monster_types.includes('Effect') && cardInfo.monster_types.length > 1 ? 'None' : cardInfo.text
    embed.addField(isNormal, normalText, true)
  } else {
    embed.addField('Property', cardInfo.property, true) // Quick-Plays etc.
      .addField('Effect', cardInfo.text, true)
      .setColor(yugiohData.attributes[cardInfo.type])
  }

  embed.addField('Legality', `${cardInfo.legality.TCG.Advanced}`, true)
    .addField('Links', `[TCGPlayer](${cardInfo.tcgplayer_link})`)

  return embed
}

async function createCardNotFoundEmbed (card) {
  let embed = new Discord.RichEmbed()
    .setTitle('Your card was not found on the YGOHub API. Here are some links instead.')
    .setColor('#207868')
  let wikiResponse
  try {
    wikiResponse = await superagent.get(yugiohWikiLink)
      .query({ query: card, limit: 3, minArticleQuality: 80 })
  } catch (err) {
    console.log(err.error.text)
  }
  const wikiInfo = JSON.parse(wikiResponse.text)
  console.log(wikiInfo)
  for (const link of wikiInfo.items) {
    embed.addField(`${link.title}`, `${link.url}`)
  }
  // embed.addField('Yugioh Wikia Link', `${wikiInfo.items[0].url}`)
  // .addField('Yugipedia Link', yugipediaLink + helper.replaceAll(wikiInfo.items[0].title, ' ', '_'))
  // disabled yugipedia link since it would not be 100% accurate.

  return embed
}
