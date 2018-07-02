const Discord = require('discord.js')
const superagent = require('superagent')

module.exports.run = async (client, message, args) => {
  let {body} = await superagent
    .get('https://random.dog/woof.json')

  let catEmbed = new Discord.RichEmbed()
    .setTitle('Random Cat')
    .setColor('#e01d1d')
    .setImage(body.file)

  return message.channel.send(catEmbed)
}

module.exports.help = {
  name: 'kitty',
  parameters: '',
  descShort: 'Displays a random image of a cat.'
}
