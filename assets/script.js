// Constants 

const apiKey = 'bc66b79e14624947da621b41ff464f47';
const apiUrl = 'https://api.openweathermap.org/data/2.5/';

// DOM Elements 

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const searchHistoryDiv = document.getElementById('search-history');

// Local Storgae 

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
displaySearchHistory();

// Event Listeners

searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeatherData(cityName);
        addToSearchHistory(cityName);
    }
    
});

// Functions 

// 1.
function getWeatherData(city) {
    fetch(`${apiUrl}weather?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const { name, coord } = data;

            displayCurrentWeather({
                name,
                date: new Date().toLocaleDateString(),
                icon: data.weather[0].icon,
                temp: kelvinToFahrenheit(data.main.temp),
                humidity: data.main.humidity,
                windSpeed: data.wind.speed
            });

            fetch(`${apiUrl}forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}`)
                .then(response => response.json())
                .then(forecastData => {
                    displayForecast(forecastData.list.filter((item, index) => index % 8 === 0));
                })
                .catch(error => console.error('Error fetching forecast:', error));
        })
        .catch(error => console.error('Error fetching coordinates:', error));
}

// 2.
function displayCurrentWeather({ name, date, icon, temp, humidity, windSpeed }) {
    const iconUrl = `http://openweathermap.org/img/w/${icon}.png`;
    currentWeatherDiv.innerHTML = `
        <h2>${name}</h2>
        <p>Date: ${date}</p>
        <img src="${iconUrl}" alt="Weather Icon">
        <p>Temperature: ${temp.toFixed(1)} &#8457;</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
    `;
    currentWeatherDiv.style.display = 'block';
}

// 3.
function displayForecast(forecastItems) {
    forecastDiv.innerHTML = forecastItems.map(item => {
        const iconUrl = `http://openweathermap.org/img/w/${item.weather[0].icon}.png`;
        return `
            <div class="forecast-item">
                <p>Date: ${new Date(item.dt_txt).toLocaleDateString()}</p>
                <img src="${iconUrl}" alt="Weather Icon">
                <p>Temperature: ${kelvinToFahrenheit(item.main.temp).toFixed(1)} &#8457;</p>
                <p>Humidity: ${item.main.humidity}%</p>
                <p>Wind Speed: ${item.wind.speed} m/s</p>
            </div>
        `;
    }).join('');
}

// 4.
function addToSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory = [city, ...searchHistory];
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    }
}

// 5.
function displaySearchHistory() {
    searchHistoryDiv.innerHTML = searchHistory.map(city => `<button class="history-btn" onclick="getWeatherData('${city}')">${city}</button>`).join('');
}

// 6.
function kelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9/5) + 32;
}