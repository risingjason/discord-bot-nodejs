const Discord = require('discord.js')

module.exports.run = async (client, message, args) => {
  let botIcon = client.user.displayAvatarURL
  let botEmbed = new Discord.RichEmbed()
    .setDescription('Bot information')
    .setColor('#ffffff')
    .setThumbnail(botIcon)
    .addField('Bot Name', client.user.username)
    .addBlankField()
    .addField('Created By', 'Jason Yatfai Zhang')

  return message.channel.send(botEmbed)
}

module.exports.help = {
  name: 'botinfo'
}
