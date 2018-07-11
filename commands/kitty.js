const Discord = require('discord.js')
const superagent = require('superagent')

module.exports.run = async (client, message, args) => {
  let cat = {}
  try {
    let { body } = await superagent.get('http://aws.random.cat/meow')
    cat = body
  } catch (err) {
    cat['file'] = ''
    if (err.status === 403) {
      return message.channel.send('`Sorry :( the random.cat API is down right now or there are too many requests to the server from us.`')
    }
  }

  let catEmbed = new Discord.RichEmbed()
    .setTitle('Random Cat')
    .setColor('#e01d1d')

  if (cat.file === '') {
    catEmbed.addField(':cat:', ':kissing_cat:')
  } else {
    catEmbed.setImage(cat.file)
  }
  return message.channel.send(catEmbed)
}

module.exports.help = {
  name: 'kitty',
  parameters: '',
  descShort: 'Displays a random image of a cat.'
}
