const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const updateOsrs = require('./updateOSRSData.js');

// config file for local testing
let config = null;
try {
  config = require('./config.json');
} catch (err) {
  console.log('Config not found.');
}
// symbol for bot to know user wants a command
const prefix = config ? config.prefix : process.env.PREFIX;

// loading up the commands handler
fs.readdir('./commands/', (err, files) => {
  if (err) console.log(err);

  const jsFile = files.filter((f) => f.split('.').pop() === 'js');
  if (jsFile.length <= 0) {
    console.log('Couldn\'t find commands.');
  }

  jsFile.forEach((f, i) => {
    const props = require(`./commands/${f}`);
    // console.log(`${f} loaded!`)
    // setting the command name based on the help module
    client.commands.set(props.help.name, props);
  });
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // check for updates when not testing locally
  if (!config) updateOsrs.updateGE();
  // set activity
  client.user.setActivity(`${prefix}help`, {type: 'PLAYING'});
});

client.on('guildMemberAdd', (member) => {
  let generalChannel = member.guild.channels.find(`name`, 'general');
  generalChannel.send(`Welcome! ${member} has joined **${member.guild.name}.**`);
});

client.on('guildMemberRemove', (member) => {
  let generalChannel = member.guild.channels.find(`name`, 'general');
  generalChannel.send(`Goodbye! ${member} has left **${member.guild.name}.**`);
});
// goes through the commands handler and if command exists,
// the bot will run that module in the commands folder
client.on('message', (message) => {
  // make sure no recursive messages
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;

  // the message user sent
  const messageArray = message.content.trim().split(' ').filter((element) => {
    return element !== '';
  });

  // the bot command
  let command = messageArray[0];
  // any arguments after the command
  let args = messageArray.slice(1);

  if (command.indexOf(prefix) === 0) {
    // removes the prefix symbol and checks if command exists for the bot
    let commandExists = client.commands.get(command.slice(prefix.length));
    if (commandExists) {
      return commandExists.run(client, message, args);
    }
  }
});

const token = config ? config.token : process.env.BOT_TOKEN;
client.login(token);
