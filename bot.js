const Discord = require('discord.js')
const config = require('./config.json')

const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
  // make sure no recursive messages
  if (msg.author.bot) return

  // split message to words
  const args = msg.content.split(/ +g/)
  // removes first element from args and saves it to command
  const command = args.shift().toLowerCase()

  if (command === 'ping') {
    msg.reply('pong')
  }
})

client.login(config.token)
