const Discord = require('discord.js')
const config = require('./config.json')

const client = new Discord.Client()

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
})

client.login(config.token)
