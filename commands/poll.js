
// intended usage
// !poll <delay in minutes> <question>
// default is 1 minute
// max delay is 5 minutes
module.exports.run = async (client, message, args) => {
  let delay = await calcDelay(client, message, args)
  if (delay !== 0) {
    await message.react('👍')
    await message.react('👎')
    await sleep(delay)
    calcVotes(client, message, args)
  }
}

module.exports.help = {
  name: 'poll',
  descShort: 'Poll on a yes/no question and the bot will tally all the :+1: and :-1: votes!'
}

// sleep function
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

// calculate how much delay the user wants
function calcDelay (client, message, args) {
  let delay = 0
  let time = parseInt(args[0])
  if (!args || args.length === 0) {
    message.channel.send('Please put valid arguments. ex. `!poll 1 Should I buy milk?`')
  } else { // find delay
    if (typeof time === 'number' && time % 1 === 0) {
      if (time < 1) {
        message.channel.send('Please put a valid time delay.')
      } else if (time > 5) {
        message.channel.send('The maximum delay is 5 minutes.')
      } else {
        delay = 1000 * 60 * args[0]
      }
    } else {
      message.channel.send('Please put a valid time delay.')
    }
  }
  return delay
}

// calculate vote tallies
function calcVotes (client, message, args) {
  let votes = message.reactions
  let thumbsUp = votes.get('👍').count
  let thumbsDown = votes.get('👎').count
  let question = args.splice(1)
  if (question.length !== 0) {
    question.splice(0, 0, 'for "')
    question.splice(question.length - 1, 0, '"')
  }
  if (thumbsUp > thumbsDown) {
    message.channel.send(':white_check_mark: VOTE YES PASSED :white_check_mark: ' + question)
  } else if (thumbsUp === thumbsDown) {
    message.channel.send(':ballot_box:  VOTE TIED :ballot_box: "' + question + '"')
  } else {
    message.channel.send(':white_check_mark: VOTE NO PASSED :white_check_mark: ' + question)
  }
}
