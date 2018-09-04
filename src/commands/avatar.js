
module.exports.run = async (client, message, args) => {
  // format
  // !avatar for self
  // !avatar @user for others
  if (args.length === 0) {
    return message.channel.send(message.author + '`\'s avatar is `\n' + message.author.avatarURL);
  } else {
    let firstUserMentioned = message.mentions.users.first();
    if (!firstUserMentioned) {
      return message.channel.send('`Please @ the person whose avatar you want to see.`');
    }

    // need to add <@USER_ID> in order to have bot mention a different user
    return message.channel.send('<@' + firstUserMentioned.id + '>\'s avatar is \n' + firstUserMentioned.avatarURL);
  }
};

module.exports.help = {
  name: 'avatar',
  parameters: '<user>',
  descShort: 'Displays a larger image of your or another person\'s avatar.',
};
