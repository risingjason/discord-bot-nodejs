const Discord = require('discord.js')
const Pokedex = require('pokedex-promise-v2')

const P = new Pokedex()
const typeColors = require('../extraData/pkmnData.json').typeColors

module.exports.run = async (client, message, args) => {
  if (args.length <= 1) {
    return message.channel.send(`\`Please enter a pokemon name or pokedex number. ex. ${process.env.PREFIX || '!'}pokedex pkmn charizard\``)
  }
  let thingToFind = args[0].toLowerCase()
  let whoToFind = args[1].toLowerCase()
  if (thingToFind === 'pkmn' || thingToFind === 'pokemon') {
    let msg = await message.channel.send('`Searching...`')
    let pkmnReply = await findPokemon(whoToFind)
    return msg.edit(pkmnReply)
  }
}

module.exports.help = {
  name: 'pokedex',
  parameters: 'pkmn <pokemon_name/pokedex_entry>',
  descShort: 'Find information about your favorite pokemon!'
}

async function findPokemon (entry) {
  try {
    let pkmnFound = await P.getPokemonByName(entry)
    let reply = createPkmnEmbed(pkmnFound)
    return reply
  } catch (err) {
    return '`Pokemon not found. Please try again.`'
  }
}

async function createPkmnEmbed (pkmnFound) {
  let embed = new Discord.RichEmbed()
    .setTitle(capFirstLetter(pkmnFound.name))
    .setThumbnail(pkmnFound.sprites.front_default)
    .addField('Pokedex Entry: ', pkmnFound.id)

  let types = []
  for (let idx of pkmnFound.types) {
    let save = capFirstLetter(idx.type.name)
    if (idx.slot === 1) {
      embed.setColor(typeColors[save])
    }
    types.push(save)
  }
  embed.addField('Type: ', types.reverse().join(' '))

  let abilities = []
  for (let idx of pkmnFound.abilities) {
    let save = capFirstLetter(idx.ability.name)
    if (idx.is_hidden) {
      save += '(hidden)'
    }
    abilities.push(save)
  }
  embed.addField('Abilities: ', abilities.reverse().join(', '))

  let heldItems = []
  if (pkmnFound.held_items.length === 0) {
    embed.addField('Held Items', 'None.')
  } else {
    for (let idx of pkmnFound.held_items) {
      let save = capFirstLetter(idx.item.name)
      heldItems.push(save)
    }
    embed.addField('Held Items', heldItems.join(', '))
  }

  let link = `https://bulbapedia.bulbagarden.net/wiki/${pkmnFound.name}`
  embed.addField('Links', `[Bulbpedia](${link})`)

  return embed
}

function capFirstLetter (str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1)
}
