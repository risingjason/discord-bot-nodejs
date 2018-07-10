const Discord = require('discord.js')
const superagent = require('superagent')
const helper = require('../helper.js')
// config file for local testing
let config = null
try {
  config = require('../config.json')
} catch (err) {
  console.log('Config not found.')
}

const apiKey = config ? config.weatherAPIkey : process.env.WEATHER_API_KEY
const baseWeatherURL = 'api.openweathermap.org/data/2.5/weather'
const baseForecastURL = 'api.openweathermap.org/data/2.5/forecast'

// search by zip code
// api.openweathermap.org/data/2.5/weather?zip={zip code},{country code}
// search by city name
// http://api.openweathermap.org/data/2.5/weather?q=Los%20Angeles&appid=
module.exports.run = async (client, message, args) => {
  let msg = await message.channel.send('`Searching...`')
  let searchQueries = {
    appid: apiKey,
    units: 'imperial'
  }
  if (args.length < 1) {
    return msg.edit(`\`Please enter some parameters. ex. ${process.env.PREFIX || '!'}weather ${this.help.parameters}\``)
  }
  try {
    let forecast
    if (args[0] === 'daily' || args[0] === 'd') {
      forecast = false
    } else if (args[0] === 'forecast' || args[0] === 'f') {
      forecast = true
    } else {
      return msg.edit(`\`You've typed in the wrong parameters. ex. ${process.env.PREFIX || '!'}weather daily Los Angeles --country US\``)
    }

    const params = args.slice(1)
    const findCountryFlag = params.indexOf('--country')
    let country = 'US'
    // user puts country code
    if (findCountryFlag !== -1) {
      if (params[findCountryFlag + 1]) {
        params.splice(findCountryFlag, 1)
        country = params.pop()
      } else {
        return msg.edit(`\`No country code detected. ex. ${process.env.PREFIX || '!'}weather daily Los Angeles --country US\``)
      }
    }
    const location = params.length !== 0 ? params.join(' ') : 'Los Angeles'
    // check if city or zip
    if (isNaN(parseInt(params[0]))) {
      searchQueries['q'] = location + ',' + country
    } else {
      searchQueries['zip'] = location + ',' + country
    }
    let weather = await getResponse(searchQueries, forecast)
    return msg.edit(forecast ? createForecastEmbed(weather) : createWeatherEmbed(weather))
  } catch (err) {
    console.log(err)
    return msg.edit('`Error occured. City not found. Please specify country codes for non US cities.`')
  }
}

module.exports.help = {
  name: 'weather',
  parameters: '<daily/forecast> <city/zip> [--country <country_code>]',
  descShort: 'Look up the weather based on location or zip code. If there is no country code specified, then it will default to US.'
}

async function getResponse (queries, forecast) {
  let response
  try {
    if (forecast) {
      response = await superagent.get(baseForecastURL)
        .query(queries)
    } else {
      response = await superagent.get(baseWeatherURL)
        .query(queries)
    }
  } catch (err) {
    console.log(err.error)
    return JSON.parse(err)
  }
  return JSON.parse(response.text)
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
    .setTitle(`3 Day Forecast for ${forecast.city.name} :flag_${country}:`)
  const timeString = ['09:00:00', '15:00:00', '21:00:00']
  const emojis = [':city_sunrise:', ':city_dusk:', ':night_with_stars:']
  // get daily weather at timeString hours
  let weatherTime = []
  for (const element of forecast.list) {
    const date = element.dt_txt
    const time = date.split(' ')
    if (weatherTime.length > 9) break
    if (timeString.includes(time[1])) {
      weatherTime.push(element)
    }
  }

  for (const day of weatherTime) {
    const splitDate = day.dt_txt.split(' ')
    const temp = day.main.temp + ' ℉'
    const wind = day.wind.speed + ' mph'
    const desc = helper.capFirstLetter(day.weather[0].description)
    const emoji = emojis[timeString.indexOf(splitDate[1])]
    embed.addField(`${formatDate(splitDate[0])} ${formatTime(splitDate[1])} ${emoji}`,
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
