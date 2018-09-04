
// intended usage
// !poll <delay in minutes> <question>
// default is 1 minute
// max delay is 5 minutes
module.exports.run = async (client, message, args) => {
  const delay = await calcDelay(client, message, args);
  if (delay !== 0) {
    await message.react('👍');
    await message.react('👎');
    await sleep(delay);
    calcVotes(client, message, args);
  }
};

module.exports.help = {
  name: 'poll',
  parameters: '<time_delay> <question>',
  descShort: 'Poll on a yes/no question and the bot will tally all the :+1: and :-1: votes!',
};

// sleep function
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// calculate how much delay the user wants
function calcDelay(client, message, args) {
  let delay = 0;
  let [time, ...question] = args;

  if (!time || !question) {
    message.channel.send(`\`Please put valid arguments. ex. ${process.env.PREFIX || '!'}poll 1 Should I buy milk?\``);
  } else { // find delay
    if (typeof parseInt(time) === 'number' && time % 1 === 0) {
      if (time < 1) {
        message.channel.send('`Please put a valid time delay.`');
      } else if (time > 5) {
        message.channel.send('`The maximum delay is 5 minutes.`');
      } else {
        delay = 1000 * 60 * time;
      }
    } else {
      message.channel.send('`Please put a valid time delay.`');
    }
  }

  return delay;
}

// calculate vote tallies
function calcVotes(client, message, args) {
  const votes = message.reactions;
  const thumbsUp = votes.get('👍').count;
  const thumbsDown = votes.get('👎').count;
  let question = args.splice(1);
  if (question.length !== 0) {
    question.splice(0, 0, 'for `');
    question.splice(question.length, 0, '`');
  }
  if (thumbsUp > thumbsDown) {
    message.channel.send(':white_check_mark:  **POLL PASSED**  :white_check_mark: ' + question.join(' '));
  } else if (thumbsUp === thumbsDown) {
    message.channel.send(':ballot_box:  **POLL TIED**  :ballot_box: ' + question.join(' '));
  } else {
    message.channel.send(':no_entry_sign:  **POLL NOT PASSED**  :no_entry_sign: ' + question.join(' '));
  }
}
