const Discord = require('discord.js')
const config = require('./config.json')
const fs = require('fs')

const client = new Discord.Client()
client.commands = new Discord.Collection()

// loading up the commands handler
fs.readdir('./commands/', (err, files) => {
  if (err) console.log(err)

  let jsFile = files.filter(f => f.split('.').pop() === 'js')
  if (jsFile.length <= 0) {
    console.log('Couldn\'t find commands.')
  }

  jsFile.forEach((f, i) => {
    let props = require(`./commands/${f}`)
    // console.log(`${f} loaded!`)
    // setting the command name based on the help module
    client.commands.set(props.help.name, props)
  })
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

// goes through the commands handler and if command exists,
// the bot will run that module in the commands folder
client.on('message', async (message) => {
  // make sure no recursive messages
  if (message.author.bot) return
  if (message.channel.type === 'dm') return

  // symbol for bot to know user wants a command
  const prefix = config.prefix
  // the message user sent
  const messageArray = message.content.split(' ')
  // the bot command
  let command = messageArray[0]
  // any arguments after the command
  let args = messageArray.slice(1)

  if (command.indexOf(prefix) === 0) {
    // removes the prefix symbol and checks if command exists for the bot
    let commandExists = client.commands.get(command.slice(prefix.length))
    if (commandExists) {
      commandExists.run(client, message, args)
    }
  }
})

client.login(config.token)
