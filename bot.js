const Discord = require('discord.js')
const config = require('./config.json')
const fs = require('fs')

const client = new Discord.Client()

// reads file name of commands folder
fs.readdir('./commands/', (err, files) => {
  if (err) console.log(err)

  let jsFile = files.filter(f => f.split('.').pop() === 'js')
  if (jsFile.length <= 0) {
    console.log('Couldn\'t find commands.')
  }
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (message) => {
  // make sure no recursive messages
  if (message.author.bot) return

  // make sure first argument starts with the prefix
  if (message.content.indexOf(config.prefix) !== 0) return

  // removes prefix and then split message to words
  const args = message.content.slice(config.prefix.length).trim().split(/ +g/)
  // removes first element from args and saves it to command
  const command = args.shift().toLowerCase()

  if (command === 'ping') {
    message.reply('pong')
  }

  if (command === 'latency') {
    // using promises
    // message.channel.send('latency...').then((msg) => {
    //   msg.edit(`latency is ${msg.createdTimestamp - message.createdTimestamp}ms`)
    // })

    // using async/await
    let msg = await message.channel.send('Latency...')
    msg.edit(`latency is ${msg.createdTimestamp - message.createdTimestamp}ms`)
  }

  // botinfo command. testing embeds
  if (command === 'botinfo') {
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
})

client.login(config.token)
