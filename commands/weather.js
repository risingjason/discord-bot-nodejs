const Discord = require('discord.js')
const superagent = require('superagent')
const config = require('../config.json')

// search by zip code
// api.openweathermap.org/data/2.5/weather?zip={zip code},{country code}
// search by city name
// http://api.openweathermap.org/data/2.5/weather?q=Los%20Angeles&appid=
module.exports.run = async (client, message, args) => {
  let city = args.length === 0 ? 'los angeles' : args.join(' ')
  let searchQueries = {
    q: city,
    appid: config.weatherAPIkey || process.env.WEATHER_API_KEY,
    units: 'imperial'
  }
  let msg = await message.channel.send('`Searching...`')
  try {
    let response = await superagent.get('api.openweathermap.org/data/2.5/weather')
      .query(searchQueries)
    let weather = JSON.parse(response.text)
    return msg.edit(createWeatherEmbed(weather))
  } catch (err) {
    return msg.edit('`Error occured. Please check for spelling errors.`')
  }
}

module.exports.help = {
  name: 'weather',
  parameters: '<city>',
  descShort: 'Look up the weather based on location.'
}

function createWeatherEmbed (weather) {
  let icon = `http://openweathermap.org/img/w/${weather.weather[0].icon}.png`
  let country = weather.sys.country.toLowerCase()
  let embed = new Discord.RichEmbed()
    .setTitle(`${weather.name} :flag_${country}:`)
    .setDescription(weather.weather[0].main)
    .setThumbnail(icon)
    .setColor('#6dc4ff')
    .addField('Temperature :thermometer:', `${weather.main.temp}℉`, true)
    .addField('Wind Speed :dash:', `${weather.wind.speed} mph`, true)
    .addField('High :fire:', `${weather.main.temp_max}℉`, true)
    .addField('Low :snowflake:', `${weather.main.temp_min}℉`, true)

  return embed
}
