'use strict';

// IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT IMPORTANT 

let version = "1.1.2";
// CONFIG
let api = 'PUT OPENWEATHERMAP API KEY HERE'
let numImg = 1 // How Many Images You Put
let wallpaperType = 1 // 0 = random local, 1 = random online
let milTime = true;
let celsius = false;
let showSec = true;
let showAMPM = false;
// END CONFIG

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

const versionv = document.createElement('version');
document.body.appendChild(versionv);


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

var stillRaining = false;

var current = (Math.floor(Math.random() * numImg) + 1);
console.log(current)

// Set the current background to a random number
function nextBackground() {
	switch (wallpaperType) {
		case 0:
			console.log('local');
			current = (Math.floor(Math.random() * numImg) + 1)
			header.css('background', `url('./Resources/${current}.jpg') no-repeat center/cover`);
			return;
		case 1:
			console.log('online');
			var a = (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + 1) // random # so the image actually updates
			header.css('background', `url('https://picsum.photos/seed/${a}/1920/1080') no-repeat center/cover`);
			// Prevents White Flash
			setTimeout(() => {
				$('html').css('background', `url('https://picsum.photos/seed/${a}/1920/1080') no-repeat center/cover`);
			}, "1000")
			return;
	}
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
	fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api}`)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			console.log(data);

			return {
				temp: celsius ? Math.floor(data.main.temp - 273.15) + "°C" : Math.floor((data.main.temp - 273.15) * 9 / 5 + 32) + "°F",
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
			$('#wIco').attr('src', "./Resources/icons/unknown.png");
		});
}


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

	// Store the original value of h
	let origH = h;

	if (!milTime) {
		// Convert h to a 12-hour clock format
		h = h % 12 || 12; // If h is 0, set h to 12
		let times = h + (m < 10 ? ":0" + m : ":" + m);
		if (showSec) {
			times += (s < 10 ? ":0" + s : ":" + s);
		}
		if (showAMPM) {
			times += (origH >= 12 ? " PM" : " AM");
		}
		return times;
	}

	// Convert m and s to strings, and add a leading zero if they are less than 10
	m = m < 10 ? "0" + m : "" + m;
	s = s < 10 ? "0" + s : "" + s;
	return showSec ? `${h}:${m}:${s}` : `${h}:${m}`;
}



// Format the date in the format "Day, Month Day"
function date(time) {
	let d = time.d;
	let mo = time.mo;
	let fd = time.fd;
	const months = ["Janurary", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	return `${fd}, ${months[mo]} ${d}`;
}
function compareVersions(latestVersion, currentVersion) {
	console.log(`Comparing ${latestVersion} to ${currentVersion}`);
	// Check if either version string contains "beta"
	const latestContainsBeta = latestVersion.includes("beta");
	const currentContainsBeta = currentVersion.includes("beta");

	console.log(`latestContainsBeta: ${latestContainsBeta}`);
	console.log(`currentContainsBeta: ${currentContainsBeta}`);

	// If neither version contains "beta", compare as integers
	if (!latestContainsBeta && !currentContainsBeta) {
		console.log(`Comparing as integers`);
		// Split the version strings on the "." character
		const latestParts = latestVersion.split(".");
		const currentParts = currentVersion.split(".");

		// Compare the substrings as integers
		for (let i = 0; i < latestParts.length; i++) {
			if (parseInt(latestParts[i]) > parseInt(currentParts[i])) {
				console.log(`${latestVersion} is greater`);
				return (true);
			} else if (parseInt(latestParts[i]) < parseInt(currentParts[i])) {
				console.log(`${currentVersion} is greater`);
				return (false);
			}
		}

		if(latestParts[currentParts.length] != undefined){
			console.log(`${currentVersion} is equal to ${latestVersion}`);
			return (false);
		}

		console.log(`${latestVersion} is greater`);
		return (true);

		
	}

	// If only one version contains "beta", return true if the version without "beta" is greater
	if (latestContainsBeta && !currentContainsBeta) {
		console.log(`Comparing with latestContainsBeta`);
		return compareVersions(latestVersion.replace("-beta", "."), currentVersion) === true;
	}
	if (!latestContainsBeta && currentContainsBeta) {
		console.log(`Comparing with currentContainsBeta`);
		return compareVersions(latestVersion, currentVersion.replace("-beta", ".")) === true;
	}

	// If both versions contain "beta", compare the version numbers as integers, ignoring the "beta" part
	console.log(`Comparing with bothContainBeta`);
	const latestParts = latestVersion.replace("-beta", ".").split(".");
	const currentParts = currentVersion.replace("-beta", ".").split(".");

	console.log(`Comparing ${latestParts} to ${currentParts}`);
	// Compare the substrings as integers
	for (let i = 0; i < latestParts.length; i++) {
		if (parseInt(latestParts[i]) > parseInt(currentParts[i])) {
			console.log(`${latestVersion} is greater`);
			return (true);
		} else if (parseInt(latestParts[i]) < parseInt(currentParts[i])) {
			console.log(`${currentVersion} is greater`);
			return (false);
		}
	}

	console.log(`${currentVersion} is equal to ${latestVersion}`);
	return (false);
}

function getLatest() {
	if (version.includes('beta')) {
		versionv.innerHTML = `Dev ${version}`;
		fetch('https://api.github.com/repos/Astrogamer54/minimalistic-desktop/releases')
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error('Error fetching version');
				}
			})
			.then(data => {
				var lversion = data[0].tag_name.substring(1);
				console.log(compareVersions(lversion, version));
				if (compareVersions(lversion, version)) {
					versionv.innerHTML = `Outdated <span style="color: #00ff00">${lversion}</span> > <span style="color: #ff0000">${version}</span>`;
				}
				else {
					console.log("Up To Date")
				}
			})
	}
	else {
		fetch('https://api.github.com/repos/Astrogamer54/minimalistic-desktop/releases/latest')
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error('Error fetching version');
				}
			})
			.then(data => {
				var lversion = data.tag_name.substring(1);
				console.log(compareVersions(lversion, version));
				if (compareVersions(lversion, version)) {
					versionv.innerHTML = `Outdated <span style="color: #00ff00">${lversion}</span> > <span style="color: #ff0000">${version}</span>`;
				}
				else {
					console.log("Up To Date")
				}
			})
	}


}
function init() {
	// Lively Wallpaper?
	if (window.showAMPM != undefined) {
		api = window.api;
		milTime = window.milTime;
		numImg = window.numImg;
		wallpaperType = window.wallpaperType;
		celsius = window.celsius;
		showSec = window.showSec;
		showAMPM = window.showAMPM;
		console.log("Lively Wallpaper");
	} else {
		console.log("No Lively Wallpaper")
	}
	getLatest();
	setInterval(nextBackground, 1000 * 60);
	nextBackground();
	setInterval(update, 1000);
	setInterval(updateWeather, 1000 * 60 * 20);
	update();
	updateWeather();
}
setTimeout(init, 1000);
// Wait for the DOM to load and then remove the splash screen and show the clock, weather, and date
window.addEventListener('DOMContentLoaded', function () {
	this.setTimeout(() => {
		this.document.getElementsByClassName('splash')[0].classList.add('splashloaded');
		this.document.getElementsByClassName('weather')[0].classList.add('loaded');
		this.document.getElementsByClassName('clock')[0].classList.add('clockLoaded');
		this.document.getElementById('cdiv').classList.add('divLoaded');
		console.log('hiii')
	}, "4000")
})
