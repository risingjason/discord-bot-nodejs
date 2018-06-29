const Discord = require('discord.js')
const superagent = require('superagent')
const yugiohData = require('../extraData/yugiohData.json')

module.exports.run = async (client, message, args) => {
  if (args.length === 0) {
    return message.channel.send('`Please put a card name to search. ex. !yugioh ash blossom & joyous spring`')
  }
  let query = encodeURIComponent(args.join(' '))
  let msg = await message.channel.send('`Searching...`')

  let response = null
  try {
    response = await superagent.get(`https://www.ygohub.com/api/card_info?name=${query}`)
    response = JSON.parse(response.text)
  } catch (err) {
    return msg.edit('`Error while searching.`')
  }

  if (response.status !== 'success') {
    return msg.edit('`The card you searched was not found. Please type the card exactly word for word.`')
  }

  let cardInfo = response.card
  return msg.edit(createYugiohEmbed(cardInfo))
}

module.exports.help = {
  name: 'yugioh',
  parameters: '',
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
