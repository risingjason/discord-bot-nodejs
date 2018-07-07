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
    if (args[0] === 'daily' || args[0] === 'd') {
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
      } else {
        return msg.edit(`\`You've typed in the wrong parameters. ex. ${process.env.PREFIX || '!'}weather daily city Los Angeles\``)
      }
      let weather = JSON.parse(response.text)
      return msg.edit(createWeatherEmbed(weather))
    } else if (args[0] === 'forecast' || args[0] === 'f') {
      if (args[1] === 'city') {
        let city = args.length < 3 ? 'los angeles' : args.slice(2).join(' ')
        searchQueries['q'] = city
        response = await superagent.get(baseForecastURL)
          .query(searchQueries)
      } else if (args[1] === 'zip') {

      } else {
        return msg.edit(`\`You've typed in the wrong parameters. ex. ${process.env.PREFIX || '!'}weather forecast city Los Angeles\``)
      }
      let forecast = JSON.parse(response.text)
      return msg.edit(createForecastEmbed(forecast))
    } else {
      return msg.edit(`\`You've typed in the wrong parameters. ex. ${process.env.PREFIX || '!'}weather daily city Los Angeles\``)
    }
  } catch (err) {
    console.log(err)
    return msg.edit('`Error occured. Please check for spelling errors.`')
  }
}

module.exports.help = {
  name: 'weather',
  parameters: '<daily/forecast> <city/zip> <location>',
  descShort: 'Look up the weather based on location or US zip code.'
}

function createWeatherEmbed (weather) {
  const icon = `http://openweathermap.org/img/w/${weather.weather[0].icon}.png`
  const country = weather.sys.country.toLowerCase()
  let embed = new Discord.RichEmbed()
    .setTitle(`${weather.name} :flag_${country}:`)
    .setDescription(weather.weather[0].main)
    .setThumbnail(icon)
    .setColor('#6dc4ff')
    .addField('Temperature :thermometer:', `${weather.main.temp} ℉`, true)
    .addField('Wind Speed :dash:', `${weather.wind.speed} mph`, true)
    .addField('High :fire:', `${weather.main.temp_max} ℉`, true)
    .addField('Low :snowflake:', `${weather.main.temp_min} ℉`, true)

  return embed
}

function createForecastEmbed (forecast) {
  const country = forecast.city.country.toLowerCase()
  let embed = new Discord.RichEmbed()
    .setColor('#6dc4ff')
    .setTitle(`5 Day Forecast for ${forecast.city.name} :flag_${country}:`)
  const timeString = ['09:00:00', '15:00:00', '21:00:00']

  // get daily weather at noon
  let noonWeather = []
  for (const element of forecast.list) {
    const date = element.dt_txt
    const time = date.split(' ')
    if (noonWeather.length > 9) break
    if (timeString.includes(time[1])) {
      noonWeather.push(element)
    }
  }

  for (const day of noonWeather) {
    const splitDate = day.dt_txt.split(' ')
    const temp = day.main.temp + ' ℉'
    const wind = day.wind.speed + ' mph'
    const desc = capFirstLetter(day.weather[0].description)
    embed.addField(`${formatDate(splitDate[0])} ${formatTime(splitDate[1])}`,
      `Temperature :thermometer: ${temp}\n` +
      `Wind Speed :dash: ${wind}\n` +
      `${desc}`, true)
  }
  return embed
}

function formatTime (time) {
  let splitTime = time.split(':').shift()
  let ampm = ''
  if (splitTime.substring(0, 1) === '0') {
    splitTime = splitTime.slice(1)
  }
  if (parseInt(splitTime) > 12) {
    ampm = 'PM'
    splitTime -= 12
  } else {
    ampm = 'AM'
  }
  return splitTime + ampm
}

function formatDate (date) {
  const split = date.split('-')
  const months = {
    '01': 'January',
    '02': 'Feburary',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
  }
  const days = {
    '1': 'st',
    '2': 'nd',
    '3': 'rd'
  }
  const dateObj = {
    'Year': split[0],
    'Month': split[1],
    'Day': split[2]
  }
  const suffix = days[dateObj.Day.slice(-1)] || 'th'
  const removeZero = dateObj.Day.substring(0, 1) === '0' ? dateObj.Day.slice(-1) : dateObj.Day
  const result = months[dateObj.Month] + ' ' + removeZero + suffix + ', ' + dateObj.Year
  return result
}

function capFirstLetter (str) {
  let words = str.split(' ')
  let newWords = []
  let result = ''
  if (words.length > 1) {
    for (let word of words) {
      const newWord = word.substring(0, 1).toUpperCase() + word.substring(1)
      newWords.push(newWord)
    }
    result = newWords.join(' ')
  } else {
    result = str.substring(0, 1).toUpperCase() + str.substring(1)
  }
  return result
}
