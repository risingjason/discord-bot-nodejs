const Discord = require('discord.js')
const Pokedex = require('pokedex-promise-v2')
const P = new Pokedex()

module.exports.run = async (client, message, args) => {
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
  descShort: 'Find information about your favorite pokemon, moves, and more!'
}

async function findPokemon (entry) {
  try {
    let pkmnFound = await P.getPokemonByName(entry)
    let reply = createEmbed(pkmnFound)
    return reply
  } catch (err) {
    console.log(err)
    return '`Pokemon not found. Please try again.`'
  }
}

function createEmbed (pkmnFound, message) {
  let embed = new Discord.RichEmbed()
    .setTitle(capFirstLetter(pkmnFound.name))
    .setThumbnail(pkmnFound.sprites.front_default)
    .addField('Pokedex Entry: ', pkmnFound.id)

  let types = []
  for (let idx of pkmnFound.types) {
    let save = capFirstLetter(idx.type.name)
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
  if (pkmnFound.held_items === 0) {
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
