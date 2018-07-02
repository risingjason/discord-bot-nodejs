const Discord = require('discord.js')
const superagent = require('superagent')

module.exports.run = async (client, message, args) => {
  let cat = {}
  try {
    let response = await superagent.get('http://aws.random.cat/meow')
    cat = response.body
  } catch (err) {
    cat['file'] = ''
    // return message.channel.send('`Error sending to server. Try again.`')
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
