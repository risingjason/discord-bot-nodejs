const Discord = require('discord.js');
const Pokedex = require('pokedex-promise-v2');
const helper = require('../helper.js');

const P = new Pokedex();
const typeColors = require('../extraData/pkmnData.json').typeColors;

module.exports.run = async (client, message, args) => {
  if (args.length <= 1) {
    return message.channel.send(`\`Please enter a pokemon name or pokedex number. ex. ${process.env.PREFIX || '!'}pokedex pkmn charizard\``);
  }
  const [thingToFind, whoToFind] = args.map((arg) => arg.toLowerCase());
  if (thingToFind === 'pkmn' || thingToFind === 'pokemon') {
    let msg = await message.channel.send('`Searching...`');
    const pkmnReply = await findPokemon(whoToFind);
    return msg.edit(pkmnReply);
  }
};

module.exports.help = {
  name: 'pokedex',
  parameters: 'pkmn <pokemon_name/pokedex_entry>',
  descShort: 'Find information about your favorite pokemon!',
};

async function findPokemon(entry) {
  try {
    const pkmnFound = await P.getPokemonByName(entry);
    const reply = createPkmnEmbed(pkmnFound);
    return reply;
  } catch (err) {
    return '`Pokemon not found. Please try again.`';
  }
}

async function createPkmnEmbed(pkmnFound) {
  let embed = new Discord.RichEmbed()
    .setTitle(helper.capFirstLetter(pkmnFound.name))
    .setThumbnail(pkmnFound.sprites.front_default)
    .addField('Pokedex Entry: ', pkmnFound.id);

  const types = [];
  for (const idx of pkmnFound.types) {
    const save = helper.capFirstLetter(idx.type.name);
    if (idx.slot === 1) {
      embed.setColor(typeColors[save]);
    }
    types.push(save);
  }
  embed.addField('Type: ', types.reverse().join(' '));

  const abilities = [];
  for (const idx of pkmnFound.abilities) {
    let save = helper.capFirstLetter(idx.ability.name);
    if (idx.is_hidden) {
      save += '(hidden)';
    }
    abilities.push(save);
  }
  embed.addField('Abilities: ', abilities.reverse().join(', '));

  const heldItems = [];
  if (pkmnFound.held_items.length === 0) {
    embed.addField('Held Items', 'None.');
  } else {
    for (const idx of pkmnFound.held_items) {
      const save = helper.capFirstLetter(idx.item.name);
      heldItems.push(save);
    }
    embed.addField('Held Items', heldItems.join(', '));
  }

  const link = `https://bulbapedia.bulbagarden.net/wiki/${pkmnFound.name}`;
  embed.addField('Links', `[Bulbpedia](${link})`);

  return embed;
}
