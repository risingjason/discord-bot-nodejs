const Discord = require('discord.js')

// config file for local testing
let config = null
try {
  config = require('../config.json')
} catch (err) {
  console.log('Config not found.')
}

module.exports.run = async (client, message, args) => {
  // format
  // !help
  // if (!args || args.length === 0) {
  //   return message.channel.send(generalHelp(client, message))
  // } else {
  //   return message.channel.send(specificHelp(client, message, args))
  // }
  return message.channel.send(generalHelp(client, message))
}

module.exports.help = {
  name: 'help',
  parameters: '',
  descShort: 'Lists all the usable bot commands.'
}

// used for when regular !help is called
function generalHelp (client, message) {
  const botIcon = client.user.displayAvatarURL
  let helpMessage = new Discord.RichEmbed()
    .setTitle('Welcome to Chinatown Discord Bot! :mahjong:')
    .setDescription('Here are a list of usable commands.')
    .setColor('#e01d1d')
    .setThumbnail(botIcon)
    .setFooter('Created by Jason Yatfai Zhang.')

  const prefix = config ? config.prefix : process.env.PREFIX
  for (const [cmdName, cmdFull] of client.commands) {
    helpMessage.addField(prefix + cmdName + '  ' + cmdFull.help.parameters, cmdFull.help.descShort)
  }
  return helpMessage
}

// WIP used for when !help <command> is called
// function specificHelp (client, message, args) {
//   let helpMessage = new Discord.RichEmbed()
// }
