const Discord = require('discord.js')

module.exports.run = async (client, message, args) => {
  // format
  // !botinfo
  let botIcon = client.user.displayAvatarURL
  let botEmbed = new Discord.RichEmbed()
    .setTitle('Chinatown Discord Bot')
    .setDescription('A Discord Bot for the Chinatown LA.')
    .setColor('#e01d1d')
    .setThumbnail(botIcon)
    .addField('Welcome!', 'This bot was made as a personal project to play around with the discord.js' +
      ' API. This bot was created using Node.js. If you would like to see a list of commands, use `!help`.')
    .addField('Check out the project on GitHub!', 'https://github.com/risingjason/discord-bot-nodejs')
    .setFooter('Created by Jason Yatfai Zhang')

  return message.channel.send(botEmbed)
}

module.exports.help = {
  name: 'botinfo',
  descShort: 'A more detailed description of the Chinatown Discord Bot.'
}
