const Discord = require('discord.js');
const superagent = require('superagent');

module.exports.run = async (client, message, args) => {
  let doggy = await getNonMp4();
  let msg = await message.channel.send('`Searching...`');
  let dogEmbed = new Discord.RichEmbed()
    .setTitle('Random Dog')
    .setColor('#e01d1d')
    .setImage(doggy.url);
  return msg.edit(dogEmbed);
};

module.exports.help = {
  name: 'doggy',
  parameters: '',
  descShort: 'Displays a random image or gif of a dog.',
};

async function getNonMp4() {
  let result = {};
  result['url'] = '';
  while (result.url === '' || result.url.slice(-4).toLowerCase() === '.mp4') {
    try {
      let {body: doggy} = await superagent.get('https://random.dog/woof.json');
      result = doggy;
    } catch (err) {
      console.log(err);
    }
  }
  return result;
}
