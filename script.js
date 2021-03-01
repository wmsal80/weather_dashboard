
const apiKey = '3d8313f230c81f64974e76aa59c0c85b'
var city = '';
var searchBtn = $('#searchButton');
var clearHistory = $('#clearHistory');
var searchCity = $('#searchCity');
var currentWeather = $('#currentWeather');
var windSpeed = $('#windSpeed');
var uvIndexS = $('#uvIndexS');
var futureWeather = $('#futureWeather');
var temperature = $('#temperature');
var humidity = $('#humidity');
var searchListCity = $('#searchCityHistory');
var currentCity = $('#currentCity');


// searches the stored city to see if it exists already 
function find(c) {
    for (var i = 0; i < sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}

// Displays the current and future weather to the user after grabbing city from the input box
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentCityWeather(city);
    }
}

function currentCityWeather(city) {
    // query URL for API 
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey;
    // AJAX call 
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        console.log(response);

        let weatherIcon = response.weather[0].icon;
        let imgURL = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date = new Date(response.dt * 1000).toLocaleDateString();
        // convert to farenheit 
        let tempFar = (response.main.temp - 273.15) * 1.80 + 32;
        $(temperature).html(Math.floor(tempFar) + "&#176;");
        //Display Wind speed and convert to MPH
        $(humidity).html(response.main.humidity + "%");
        // find wind speed from API response
        let wspeed = response.wind.speed;
        let windMPH = (wspeed * 2.237).toFixed(1);
        //add windspeed HTML 
        $(windSpeed).html(windMPH + "MPH");

        uvIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            } else {
                if (find(city) > 0) {
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }
    });
}
// uv index function
function uvIndex(ln, lt) {
    // uv index query URL 
    let uvQURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lt + "&lon=" + ln;
    // ajax call 
    $.ajax({
        url: uvQURL,
        method: "GET",
    }).then(function (response) {
        $(uvIndexS).html(response.value);
    })
}
function forecast(cityid) {
    let dayover = false;
    let queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + apiKey;
    // ajax call 
    $.ajax({
        url: queryForecastURL,
        method: "GET",
    }).then(function (response) {
        for (i = 0; i < 5; i++) {
            let date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconCode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconUrl = "https://openweathermap.org/img/wn/" + iconCode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempFar = (Math.floor((tempK - 273.5) * 1.80) + 32) + "&#176;";
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            // html add - to elements 
            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconUrl + ">");
            $("#fTemp" + i).html(tempFar);
            $("#fHumidity" + i).html(humidity + "%");
        }
    })
}

// add cities to list 
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentCityWeather(city);
    }
}

//Click Handlers
$("#searchButton").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadlastCity);
$("#clearHistory").on("click", clearClickHistory);


// load from city list
function loadlastCity() {
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i - 1];
        currentCityWeather(city);
    }
}

//Clear the search history from the page
function clearClickHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();
}