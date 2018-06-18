const Discord = require('discord.js')
const Pokedex = require('pokedex-promise-v2')
const P = new Pokedex()

module.exports.run = async (client, message, args) => {
  let find = args[0].toLowerCase()
  try {
    let pkmnFound = await P.getPokemonByName(find)
    let reply = createEmbed(pkmnFound)
    return message.channel.send(reply)
  } catch (err) {
    return message.channel.send('Pokemon not found. Please try again.')
    // console.log(err)
  }
}

module.exports.help = {
  name: 'pokedex',
  descShort: 'Find information about your favorite 2, pokemon moves, and more!'
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
  embed.addField('Abilities: ', abilities.reverse().join(' '))

  embed.addField('Bulbpedia Link: ', `https://bulbapedia.bulbagarden.net/wiki/${pkmnFound.name}_(Pokémon)`)
  return embed
}

function capFirstLetter (str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1)
}
