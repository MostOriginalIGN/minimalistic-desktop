var pendingTexts = {} // An object to store the pending texts for each element
var currvol;
var currline;

let interval2 = {}; // An object to store the interval for the write function
let interval = {}; // An object to store the interval for the clear function
let isClearingFinished = {}; // An object to store a flag indicating whether the clear function has finished running
let isWriting = {}; // An object to store a flag indicating whether the write function is currently running

var lrc;

// https://github.com/anhthii/lrc-parser
function extractInfo(data) {
  const info = data.trim().slice(1, -1) // remove brackets: length: 03:06
  return info.split(': ')
}

function lrcParser(data) {
  if (typeof data !== 'string') {
    throw new TypeError('expect first argument to be a string')
  }
  // split a long stirng into lines by system's end-of-line marker line \r\n on Windows
  // or \n on POSIX
  let lines = data.split('\n')
  const timeStart = /\[(\d*\:\d*\.?\d*)\]/ // i.g [00:10.55]
  const scriptText = /(.+)/ // Havana ooh na-na (ayy) 
  const timeEnd = timeStart
  const startAndText = new RegExp(timeStart.source + scriptText.source)


  const infos = []
  const scripts = []
  const result = {}

  for (let i = 0; startAndText.test(lines[i]) === false; i++) {
    infos.push(lines[i])
  }

  infos.reduce((result, info) => {
    const [key, value] = extractInfo(info)
    result[key] = value
    return result
  }, result)

  lines.splice(0, infos.length) // remove all info lines
  const qualified = new RegExp(startAndText.source + '|' + timeEnd.source)
  lines = lines.filter(line => qualified.test(line))

  for (let i = 0, l = lines.length; i < l; i++) {
    const matches = startAndText.exec(lines[i])
    const timeEndMatches = timeEnd.exec(lines[i + 1])
    if (matches && timeEndMatches) {
      const [, start, text] = matches
      const [, end] = timeEndMatches
      scripts.push({
        start: convertTime(start),
        text,
        end: convertTime(end),
      })
    }
  }

  result.scripts = scripts
  return result
}

// convert time string to seconds
// i.g: [01:09.10] -> 69.10
function convertTime(string) {
  string = string.split(':');
  const minutes = parseInt(string[0], 10)
  const seconds = parseFloat(string[1])
  if (minutes > 0) {
    const sc = minutes * 60 + seconds
    return parseFloat(sc.toFixed(2))
  }
  return seconds
}

// End Of https://github.com/anhthii/lrc-parser

// Lyrics
function formatLyrics(lrc) {
  const filteredScripts = lrc.scripts.filter(script => !script.text.includes('作曲') && !script.text.includes('作词')  && !script.text.includes('制作人') && !script.text.includes('编曲'));
  return { ...lrc, scripts: filteredScripts };
}
function updateLyrics(lines) {
  if (lines.line[0] == document.getElementsByClassName('lyric-line')[0].textContent && currline == lines.line[1]) {
    return;
  }
  currline = lines.line[1]
  $('.lyric-line').css('transition', 'all 0.5s ease')
  document.getElementsByClassName('lyric-line')[0].style.top = "-4rem"
  document.getElementsByClassName('lyric-line')[1].style.transform = "scale(0.8)"
  document.getElementsByClassName('lyric-line')[1].style.top = "2rem"
  document.getElementsByClassName('lyric-line')[1].style.filter = "blur(0px)"
  document.getElementsByClassName('lyric-line')[0].style.filter = "blur(3px)"
  document.getElementsByClassName('lyric-line')[1].style.transform = "scale(1)"
  document.getElementsByClassName('lyric-line')[2].style.top = "6rem"
  setTimeout(() => {
    $('.lyric-line').css('transition', 'all 0s')
    try {
      if (lines.line == undefined) {
        document.getElementsByClassName('lyric-line')[0].innerText = ""
        return;
      }
      if (lines.nextLine == undefined) {
        document.getElementsByClassName('lyric-line')[1].innerText = ""
        return;
      }
      document.getElementsByClassName('lyric-line')[0].innerText = lines.line[0]
      document.getElementsByClassName('lyric-line')[1].innerText = lines.nextLine[0]
      document.getElementsByClassName('lyric-line')[2].innerText = lines.after[0]
    } catch {
      console.log('no lyric')
    }
    document.getElementsByClassName('lyric-line')[0].style.top = "2rem"
    document.getElementsByClassName('lyric-line')[0].style.filter = "blur(0px)"
    document.getElementsByClassName('lyric-line')[1].style.transform = "scale(1)"
    document.getElementsByClassName('lyric-line')[1].style.top = "6rem"
    document.getElementsByClassName('lyric-line')[1].style.transform = "scale(0.8)"
    document.getElementsByClassName('lyric-line')[2].style.top = "10rem"
    document.getElementsByClassName('lyric-line')[1].style.filter = "blur(3px)"
  }, 500)

}
function getCurrentLine(pos, lrc) {
  try {
    if (lrc == undefined) {
      console.log('no lyrics')
      return "";
    }
    currentTime = pos.split(':')

    const currentTimeSec = (parseInt(currentTime[0]) * 60 + parseInt(currentTime[1]) + syncOffset);
    if (currentTimeSec < lrc.scripts[0].start){
      console.log('hi')
      return {
        "line": [" ", -1],
        "nextLine": [lrc.scripts[0].text,0],
        "after": [lrc.scripts[1].text,1]
      }
    }
    for (let i = 0; i < lrc.scripts.length; i++) {
      if (currentTimeSec >= lrc.scripts[i].start && currentTimeSec < lrc.scripts[i].end) {
        return {
          "line": [lrc.scripts[i].text,i],
          "nextLine": [lrc.scripts[i + 1].text, i+1],
          "after": [lrc.scripts[i + 2].text, i=2]
        }
      }
    }
    return "";
  } catch {
    return "";
  }
}


async function findLyrics(name, artist, album) {
  const bname = name.split('(')[0];

  const song = encodeURIComponent(`${bname} ${artist}`)
  console.log(song)
  try {
    const id = await fetch(`https://music.xianqiao.wang/neteaseapiv2/search?limit=10&type=1&keywords=${song}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Error fetching data');
        }
      })
      .then(data => {
        let index;

        console.log(`https://music.xianqiao.wang/neteaseapiv2/search?limit=10&type=1&keywords=${song}`)
        if (data.result.songs == undefined) {
          console.log("Song Not Found")
          return "No Lyrics";
        }
        const songs = data.result.songs
        for (let i = 0; i < songs.length; i++) {
          if (songs[i].album.name.toUpperCase() == album.toUpperCase()) {
            index = i;
            break;
          }
        }
        if (index == undefined) {
          console.log("Song Not Found")
          return "No Lyrics";
        }
        return data.result.songs[index].id;
      })
    const lyricData = await fetch(`https://music.xianqiao.wang/neteaseapiv2/lyric?id=${id}`)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Error fetching data');
        }
      })
      .then(data => {
        return data.lrc.lyric;
      })
    console.log(`https://music.xianqiao.wang/neteaseapiv2/lyric?id=${id}`)
    return lyricData;
  }
  catch (error) {
    console.log(error)
    return "No Lyrics";
  }
}


// Now Playing

// The write function adds characters to an element's text with a fading effect
function write(newText, element) {
  console.log(`Attempting to write: ${pendingTexts[element.attr('id')]}`)
  // Clear the interval if it already exists and the clear function has finished running
  if (interval2[element.attr('id')] && isClearingFinished[element.attr('id')]) {
    clearInterval(interval2[element.attr('id')]);
    console.log('cleared', element)
  }

  isWriting[element.attr('id')] = true; // Set the flag indicating that the write function is currently running

  // Set up a counter to keep track of the current character
  let counter = 0;
  try {
    interval2[element.attr('id')] = setInterval(() => {
      // If we've reached the end of the new text, clear the interval
      if (counter === newText.length) {
        clearInterval(interval2[element.attr('id')]);
        isWriting[element.attr('id')] = false; // Set the flag indicating that the write function is not currently running
        // If the element's text is not the same as the pending text, call the clear function again
        if (element.text() != pendingTexts[element.attr('id')]) {
          clear(pendingTexts[element.attr('id')], element);
          console.log(`Attempting to write: ${pendingTexts[element.attr('id')]}`)
        }
        return;
      }

      // Add the current character to the element's text
      element.text(element.text() + newText[counter])

      // Increment the counter
      counter++;
    }, 50);
  }
  // If an error occurs, set the flag indicating that the write function is not currently running
  catch {
    console.log('failed')
    isWriting[element.attr('id')] = false;
  }

}

// The clear function removes characters from an element's text with a fading effect
function clear(newText, element) {
  isClearingFinished[element.attr('id')] = false; // Set the flag indicating that the clear function is currently running

  if (interval[element.attr('id')]) { // Clear the interval if it already exists
    clearInterval(interval[element.attr('id')]);

  }
  try {
    // Set up a counter to keep track of the current character
    let counter = element.text().length;

    // Set up an interval to remove one character from the element's text every 50ms
    interval[element.attr('id')] = setInterval(() => {
      // If we've reached the end of the new text, clear the interval
      if (counter === 0) {
        console.log('deleted');
        clearInterval(interval[element.attr('id')]);
        // If the write function is not currently running, call it to write the new text
        if (!isWriting[element.attr('id')]) {
          write(newText, element)
        }
        return;
      }

      // Remove one character from the element's text
      element.text(element.text().substring(0, element.text().length - 1))

      // Decrement the counter
      counter--;
    }, 50);
  }
  // If an error occurs, set the element's text to the new text without using the fading effect
  catch {
    console.log("Could Not Clear With Effect");
    element.text('');
    write(newText);
  }

  isClearingFinished[element.attr('id')] = true; // Set the flag indicating that the clear function has finished running
}

// The updateType function updates the text of an element with a fading effect
function updateType(newText, element) {
  // Store the new text in the pendingTexts object using the element ID as the key
  pendingTexts[element] = newText;
  // Call the clear function to clear the element's text with a fading effect
  clear(newText, $(element))
}

// The updateType function updates the progress bar
function progressBar(current, duration) {
  // Split the time strings at the colon to get an array of the form [minutes, seconds]
  currentTime = current.split(':')
  dur = duration.split(':')

  // Convert the minutes and seconds to milliseconds and add them together
  const currentTimeMs = (parseInt(currentTime[0]) * 60 + parseInt(currentTime[1])) * 1000;
  const durMs = (parseInt(dur[0]) * 60 + parseInt(dur[1])) * 1000;

  // Calculate the progress as a percentage
  const prog = (currentTimeMs / durMs) * 100
  // Update the width of the progress bar element
  $('#progress-bar').css('width', `${prog}%`)
}

function updateVol(vol){
  currvol = vol;
  $('#volume').addClass('show-vol')
  $('#volume-fill').css('height', `${vol}%`)
  setTimeout(() => {
    $('#volume').removeClass('show-vol')
  }, 2000)
}
// The getData function fetches data from a server and updates the page with the new data
function getData() {
  fetch('http://127.0.0.1:8975')
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Error fetching data');
      }
    })
    .then(data => {
      if (data.STATE == '1') {
        $('#npdiv').css('opacity', 1);
        $('#lyrics-container').css('opacity', 1);
        $('#progress-bar').css('bottom', 0);
      } else {
        $('#npdiv').css('opacity', 0);
        $('#lyrics-container').css('opacity', 0);
        $('#progress-bar').css('bottom', '-0.2rem');
      }
      var src = $('#npImg').css('backgroundImage');
      if (src != `url("${data.COVER}")`) {
        document.getElementById('npImg').style.backgroundImage = `url('${data.COVER}')`;
        console.log('update image');
        console.log(src);
      }
      if (pendingTexts['npName'] != data.TITLE) {
        console.log('attempting to write')
        updateType(data.TITLE, 'npName');
        if (showLyrics) {
          $('.lyric-line').text('');
          lrc = ''
          findLyrics(data.TITLE, data.ARTIST, data.ALBUM)
            .then(data => {
              if (data != 'No Lyrics') {
                lrc = formatLyrics(lrcParser(data));
              } else {
                lrc = ''
              }

            })
        }
      }
      if (pendingTexts['npArtist'] != data.ARTIST) {
        updateType(data.ARTIST, 'npArtist');
      }
      progressBar(data.POSITION, data.DURATION);
      if (showLyrics) {
        updateLyrics(getCurrentLine(data.POSITION, lrc));
      }
      if (currvol != data.VOLUME){
        updateVol(data.VOLUME);
      }
    })

}

function init() {
  const showLyrics = window.showLyrics;
  const syncOffset = window.syncOffset;

  // Call the getData function every 1000ms (1 second)
  setInterval(getData, 1000)
}

setTimeout(init, 1000);
