// variables for displays of current data
let currentDate = $("#c_day_city");
let currentImage = $("#c_day_img");
let currentTemp = $("#c_day_temp");
let currentWind = $("#c_day_wind");
let currentHumidity = $("#c_day_humid");

// Search bar inputs
let cityInput = $("#city_input");
let searchButton = $("#submit_button");
let searchForm = $("#search_form");

// list for our search history
let searchHistory = $("#search_history");

// our forecast holder
let forecastList = $("#forecast");

// our api key
let apiKey = "b931cc84b8f5dc065c5b779e6b59bf60";

// our page load city, this is the city that the page loads weather for on load
let city = "Toronto";

let historyCache = [];

// Links for accesing apis

//api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
let weatherFutureURL = "https://api.openweathermap.org/data/2.5/forecast?units=metric&";

//https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
let weatherCurrentURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&";

//http://api.openweathermap.org/geo/1.0/direct?q={city name}&limit={limit}&appid={API key}
let locationURL = "https://api.openweathermap.org/geo/1.0/direct?";

//http://openweathermap.org/img/wn/10d@2x.png
let imageURL = "https://openweathermap.org/img/wn/"

// this parses the data for weather in the next 5 days
function parseFutureWeather(data) {
    let daysToDisplay = [];
    data.forEach(element => {
        let time = moment(element.dt*1000).format("H")
        if (time == "11") {
            daysToDisplay.push(element);
        }
    })

    let forecastChildren = forecastList.children();
    
    
    for (const index in daysToDisplay) {
        let cardChildren = $(forecastChildren[index]).children();
        let dayData = daysToDisplay[index];

        // Date
        cardChildren[0].textContent = moment(dayData.dt*1000).format("M/D/YYYY");
        // Image
        $(cardChildren[1]).children()[0].src = imageURL+dayData.weather[0].icon+"@2x.png";
        // temp
        cardChildren[2].textContent = "Temp: "+dayData.main.temp+"  \u00B0C";
        // wind
        cardChildren[3].textContent = "Wind: "+dayData.wind.speed+"  Km/h";
        // humid
        cardChildren[4].textContent = "Humidity: "+dayData.main.humidity+" %";
    }
}

// This parses the data for weather for the current day
function parseCurrentWeather(data) {
    currentDate.text(data.name+" ("+moment().format("M/D/YYYY")+")");
    currentImage.attr("src", imageURL+data.weather[0].icon+"@2x.png");
    currentTemp.text("Temp: "+data.main.temp+" \u00B0C");
    currentWind.text("Wind: "+data.wind.speed+" Km/h");
    currentHumidity.text("Humidity: "+data.main.humidity+" %");
}

// This gets the weather information from the latitude and longitude
function getWeatherInfo(lat, lon) {
    let weatherCurrent = weatherCurrentURL+"lat="+lat+"&lon="+lon+"&appid="+apiKey;
    fetch(weatherCurrent)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        parseCurrentWeather(data);
    })

    let weather = weatherFutureURL+"lat="+lat+"&lon="+lon+"&appid="+apiKey;
    fetch(weather)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        parseFutureWeather(data.list);
    })
}

// This gets the longitude and latitude from city name
// This also adds our search city to history
function findCity(searchCity, addToHistory) {
    if (searchCity === null || searchCity === '') {
        return;
    }

    if (addToHistory) {
        addHistory(searchCity);
    }

    let location = locationURL+"q="+searchCity+"&limit=1&appid="+apiKey;
    fetch(location)
    .then(function(response){
        return response.json();
    })
    .then(function(data) {
        getWeatherInfo(data[0].lat, data[0].lon);
    })
}

// This clears and renders the search history
function renderHistory() {
    searchHistory.empty();
    console.log(historyCache)
    historyCache.forEach(element => {
        let button = $('<button class="nav_button">');
        
        button.text(element);

        searchHistory.append(button);
    });
}

// This loads the history from localstorage
function loadHistory() {
    let history = JSON.parse(localStorage.getItem("WeatherHistory"));
    if (history !== null ) {
        historyCache = history;
    }

    renderHistory();
}

// This adds a history object to the array and shifts the last used date to the start of the history
function addHistory(name) {
    for (const index in historyCache) {
        if (historyCache[index] === name) {
            historyCache.splice(index, 1);
        }
    }

    historyCache.unshift(name);

    localStorage.setItem("WeatherHistory", JSON.stringify(historyCache));

    renderHistory();
}

findCity(city);
loadHistory();

// detectors for when to retrieve new data to display
searchButton.on("click", function(event){
    event.preventDefault();

    let text = cityInput.val();
    findCity(text, true);
})

searchHistory.on("click", ".nav_button", function(event) {
    findCity(event.target.textContent, true);
})