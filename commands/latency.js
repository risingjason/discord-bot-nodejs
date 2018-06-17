
module.exports.run = async (client, message, args) => {
  // format
  // !latency
  let msg = await message.channel.send('Latency...')
  msg.edit(`latency is ${msg.createdTimestamp - message.createdTimestamp}ms`)
}
module.exports.help = {
  name: 'latency'
}
