const Discord = require('discord.js')
const superagent = require('superagent')

// config file for local testing
let config = null
try {
  config = require('../config.json')
} catch (err) {
  console.log('Config not found.')
}

// search by zip code
// api.openweathermap.org/data/2.5/weather?zip={zip code},{country code}
// search by city name
// http://api.openweathermap.org/data/2.5/weather?q=Los%20Angeles&appid=
module.exports.run = async (client, message, args) => {
  let apiKey = config ? config.weatherAPIkey : process.env.WEATHER_API_KEY
  let baseWeatherURL = 'api.openweathermap.org/data/2.5/weather'
  let baseForecastURL = 'api.openweathermap.org/data/2.5/forecast'
  let msg = await message.channel.send('`Searching...`')
  let searchQueries = {
    appid: apiKey,
    units: 'imperial'
  }
  try {
    let response
    if (args[0] === 'daily') {
      if (args[1] === 'city') {
        let city = args.length < 3 ? 'los angeles' : args.slice(2).join(' ')
        searchQueries['q'] = city
        response = await superagent.get(baseWeatherURL)
          .query(searchQueries)
      } else if (args[1] === 'zip') {
        let zip = args.length < 3 ? '90012' : args.slice(2).join(' ').trim()
        searchQueries['zip'] = zip
        response = await superagent.get(baseWeatherURL)
          .query(searchQueries)
      }
    } else if (args[0] === 'forecast') {
      // code here
    } else {
      return msg.edit('`You\'ve typed in the wrong parameters. ex. !weather daily city Los Angeles`')
    }
    let weather = JSON.parse(response.text)
    return msg.edit(createWeatherEmbed(weather))
  } catch (err) {
    console.log(err)
    return msg.edit('`Error occured. Please check for spelling errors.`')
  }
}

module.exports.help = {
  name: 'weather',
  parameters: '<daily/forecast> <city/zip> <location>',
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
