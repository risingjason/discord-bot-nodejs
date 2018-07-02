const Discord = require('discord.js')
const superagent = require('superagent')

module.exports.run = async (client, message, args) => {
  let doggy = {}
  try {
    let response = await superagent.get('https://random.dog/woof.json')
    doggy = response.body
  } catch (err) {
    doggy['url'] = ''
    // return message.channel.send('`Error sending to server. Try again.`')
  }

  let dogEmbed = new Discord.RichEmbed()
    .setTitle('Random Dog')
    .setColor('#e01d1d')

  if (doggy.url === '') {
    dogEmbed.addField(':dog:', ':dog2:')
  } else {
    dogEmbed.setImage(doggy.url)
  }

  return message.channel.send(dogEmbed)
}

module.exports.help = {
  name: 'doggy',
  parameters: '',
  descShort: 'Displays a random image or gif of a dog.'
}
