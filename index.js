'use strict';

const wrapper = document.createElement('div');
wrapper.id = 'datediv';
const wWrapper = document.createElement('div');
wWrapper.id = 'wdiv';
const cWrapper = document.createElement('div');
cWrapper.id = 'cdiv';
const nowPlayingWrapper = document.createElement('div');
nowPlayingWrapper.id = 'npdiv'
const nowPlayingTxtWrapper = document.createElement('div');
nowPlayingTxtWrapper.id = 'nptxtdiv'

const npImg = document.createElement('div');
const npName = document.createElement('npName');
const npArtist = document.createElement('npArtist');
npImg.id = 'npImg';
npName.id = 'npName';
npArtist.id = 'npArtist';
document.body.appendChild(nowPlayingWrapper);
nowPlayingWrapper.appendChild(npImg);
nowPlayingWrapper.appendChild(nowPlayingTxtWrapper)
nowPlayingTxtWrapper.appendChild(npName);
nowPlayingTxtWrapper.appendChild(npArtist);
const wclock = document.createElement('clock');
wclock.classList.add('clock')
wrapper.classList.add('weather')
document.body.appendChild(cWrapper);
cWrapper.appendChild(wclock);
document.body.appendChild(wrapper);
const dateView = document.createElement('date');
wrapper.appendChild(dateView);
wrapper.appendChild(wWrapper);
const weather = document.createElement('weather');
wWrapper.appendChild(weather);
const weatherIco = document.createElement('img');
weatherIco.id = 'wIco';
wWrapper.appendChild(weatherIco);

var header = $('body');

const api = '388d2a4a9cc90d656d5420e6f82080ec'

var stillRaining = false;

// Generate a random number between 1 and 24
var current = (Math.floor(Math.random() * 24) + 1);
console.log(current)

// Set the current background to a random number
function nextBackground() {
	current = (Math.floor(Math.random() * 24) + 1)
	header.css('background', `url('./Resources/${current}.jpg') no-repeat center/cover`);
}

// Update the clock if it is different than the provided string
function updateClock(string) {
	if (wclock.innerText.toLowerCase() === string) {
		return;
	}
	setClock(string);

}

// Set the clock to the provided string
function setClock(string) {
	wclock.innerHTML = string;
}

// Set the date view to the provided string
function setDateView(string) {
	if (dateView.innerText === string) {
		return;
	}
	dateView.innerText = string
}

// Set the temperature to the provided string
function setTemp(string) {
	weather.innerText = string
}

// Update the clock and date view

function update() {
	const time = clock(getTime());
	const datew = date(getTime());
	updateClock(time);
	setDateView(datew);
}

// Update the weather by getting the current location and calling updateWeatherGet
function updateWeather() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			updateWeatherGet(position.coords.latitude, position.coords.longitude);
		}, function (error) {
			// User denied permission to access location
			console.error("Geolocation error: ", error);
			// You could fall back to a default location here
			updateWeatherGet('37.593283', '-122.044019');
		});
	} else {
		console.error("Geolocation is not supported by this browser.");
		updateWeatherGet('37.593283', '-122.044019');
	}
}


// Get the weather data from the OpenWeatherMap API and update the weather and temperature
function updateWeatherGet(lat, lon) {
	fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=967e45a1b18de11ee1ddb9212d586841`)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			console.log(data);
			return {
				temp: Math.floor((data.main.temp - 273.15) * 9 / 5 + 32) + "°F",
				sum: data.weather[0].description,
				icon: data.weather[0].icon
			}
		})
		.then((data) => {
			var iconurl = "./Resources/icons/" + data.icon + ".png";
			setTemp(data.temp);
			$('#wIco').attr('src', iconurl);
			if (data.icon == "09d" || data.icon == "09n") {
				stillRaining = true;
			} else {
				stillRaining = false;
			}
		})
		.catch(error => {
			console.error(error);
		});
}

setInterval(update, 1000);
setInterval(updateWeather, 1000 * 60 * 10);
setInterval(updateClock, 1000 * 60);
update();
updateWeather();


// Get the current time, date, and day of the week
function getTime() {
	const now = new Date();
	now.setTime(now.getTime());
	return {
		h: now.getHours(),
		m: now.getMinutes(),
		s: now.getSeconds(),
		d: now.getDate(),
		mo: now.getMonth(),
		fd: now.toLocaleString('en-us', { weekday: 'long' }),
	};
}

// Format the time in the format "HH:MM:SS"
function clock(time) {
	let h = time.h;
	let m = time.m;
	let s = time.s;
	if (m < 10) {
		m = "0" + m;
	}
	if (s < 10) {
		s = "0" + s;
	}
	return `${h}:${m}:${s}`
}

// Format the date in the format "Day, Month Day"
function date(time) {
	let d = time.d;
	let mo = time.mo;
	let fd = time.fd;
	const months = ["Janurary", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	return `${fd}, ${months[mo]} ${d}`;
}

// Wait for the DOM to load and then remove the splash screen and show the clock, weather, and date
window.addEventListener('DOMContentLoaded', function () {
	this.setTimeout(() => {
		this.document.getElementsByClassName('splash')[0].classList.add('splashloaded');
		this.document.getElementsByClassName('weather')[0].classList.add('loaded');
		this.document.getElementsByClassName('clock')[0].classList.add('clockLoaded');
		this.document.getElementById('cdiv').classList.add('divLoaded');
	}, "4000")
})
