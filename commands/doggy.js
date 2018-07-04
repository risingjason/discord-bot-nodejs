const Discord = require('discord.js')
const superagent = require('superagent')

module.exports.run = async (client, message, args) => {
  let doggy = await getNonMp4()
  let dogEmbed = new Discord.RichEmbed()
    .setTitle('Random Dog')
    .setColor('#e01d1d')
    .setImage(doggy.url)
  return message.channel.send(dogEmbed)
}

module.exports.help = {
  name: 'doggy',
  parameters: '',
  descShort: 'Displays a random image or gif of a dog.'
}

async function getNonMp4 () {
  let result = {}
  result['url'] = ''
  while (result.url === '' || result.url.slice(-4).toLowerCase() === '.mp4') {
    try {
      let response = await superagent.get('https://random.dog/woof.json')
      result = response.body
    } catch (err) {
      console.log(err)
    }
  }
  return result
}
