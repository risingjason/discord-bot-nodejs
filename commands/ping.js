// const Discord = require('discord.js')

module.exports.run = async (client, message, args) => {
  // format
  // !ping
  message.reply('pong')
}

module.exports.help = {
  name: 'ping',
  descShort: 'Simple command that makes the bot reply "Pong".'
}
