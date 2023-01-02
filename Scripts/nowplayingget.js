// Forgot to add Geolocation commit also fixed typewriter effect

var pendingTexts = {} // An object to store the pending texts for each element

let interval2 = {}; // An object to store the interval for the write function
let interval = {}; // An object to store the interval for the clear function
let isClearingFinished = {}; // An object to store a flag indicating whether the clear function has finished running
let isWriting = {}; // An object to store a flag indicating whether the write function is currently running

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
          console.log(`${element.attr('id')} = ${element.text()} != ${(pendingTexts[element.attr('id')])}`)
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
      console.log(counter, element)
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
  console.log(`${element} = ${pendingTexts[element.toUpperCase()]}`) // Debugging line
  // Call the clear function to clear the element's text with a fading effect
  clear(newText, $(element))
}

// The updateType function updates the progress bar
function progressBar(current, duration){
  // Split the time strings at the colon to get an array of the form [minutes, seconds]
  currentTime = current.split(':')
  dur = duration.split(':')

  console.log(currentTime, dur)
  // Convert the minutes and seconds to milliseconds and add them together
  const currentTimeMs = (parseInt(currentTime[0]) * 60 + parseInt(currentTime[1])) * 1000;
  const durMs = (parseInt(dur[0]) * 60 + parseInt(dur[1])) * 1000;

  // Calculate the progress as a percentage
  const prog = (currentTimeMs/durMs) * 100
  // Update the width of the progress bar element
  $('#progress-bar').css('width', `${prog}%`)
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
        $('#progress-bar').css('bottom', 0);
      } else {
        $('#npdiv').css('opacity', 0);
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
      }
      if (pendingTexts['npArtist'] != data.ARTIST) {
        updateType(data.ARTIST, 'npArtist');
      }
      progressBar(data.POSITION, data.DURATION)
    })
    .catch(error => {
      console.log("now-playing-server not detected");
    });

}

// Call the getData function every 1000ms (1 second)
setInterval(getData, 1000)
