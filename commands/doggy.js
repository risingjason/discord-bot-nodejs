const Discord = require('discord.js')
const superagent = require('superagent')

module.exports.run = async (client, message, args) => {
  let {body} = await superagent
    .get('https://random.dog/woof.json')

  let dogEmbed = new Discord.RichEmbed()
    .setTitle('Random Dog')
    .setColor('#e01d1d')
    .setImage(body.url)

  return message.channel.send(dogEmbed)
}

module.exports.help = {
  name: 'doggy',
  parameters: '',
  descShort: 'Displays a random image or gif of a dog.'
}
