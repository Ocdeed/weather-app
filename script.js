// API Configuration
const API_KEY = "26f1f9a1ca92f55d916faa706761cf0a"; // Replace with your OpenWeather API key
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const celsiusBtn = document.getElementById("celsius-btn");
const fahrenheitBtn = document.getElementById("fahrenheit-btn");
const cityName = document.getElementById("city-name");
const currentDate = document.getElementById("current-date");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weather-description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const suggestionText = document.getElementById("suggestion-text");
const forecastCards = document.querySelectorAll(".forecast-card");
const container = document.querySelector(".container");

// Global Variables
let currentUnit = "celsius"; // Default unit
let currentTemp = null; // Store current temperature in Celsius
let forecastTemps = []; // Store forecast temperatures in Celsius

// Fetch Weather Data by City Name
async function fetchWeatherData(city) {
  try {
    // Fetch current weather
    const currentWeatherResponse = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const currentWeatherData = await currentWeatherResponse.json();

    // Fetch 5-day forecast (OpenWeather API provides 5-day forecast in 3-hour intervals)
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    // Update UI with fetched data
    updateCurrentWeather(currentWeatherData);
    updateForecast(forecastData);
    updateBackground(currentWeatherData.weather[0].main); // Update background based on weather condition
    updateSuggestion(currentWeatherData.weather[0].main); // Update weather suggestion
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

// Fetch Weather Data by Latitude and Longitude
async function fetchWeatherDataByCoords(lat, lon) {
  try {
    // Fetch current weather
    const currentWeatherResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const currentWeatherData = await currentWeatherResponse.json();

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    // Update UI with fetched data
    updateCurrentWeather(currentWeatherData);
    updateForecast(forecastData);
    updateBackground(currentWeatherData.weather[0].main); // Update background based on weather condition
    updateSuggestion(currentWeatherData.weather[0].main); // Update weather suggestion
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch weather data. Please try again.");
  }
}

// Get User's Current Location
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherDataByCoords(latitude, longitude); // Fetch weather for current location
      },
      (error) => {
        console.error("Error getting location:", error);
        fetchWeatherData("London"); // Default to London if location access is denied
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    fetchWeatherData("London"); // Default to London if Geolocation is not supported
  }
}

// Update Current Weather
function updateCurrentWeather(data) {
  cityName.textContent = data.name;
  currentDate.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherDescription.textContent = data.weather[0].description;
  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${data.wind.speed} km/h`;

  // Store current temperature in Celsius
  currentTemp = data.main.temp;

  // Update temperature based on selected unit
  updateTemperature(currentTemp);
}

// Update Forecast
function updateForecast(data) {
  const forecastList = data.list;

  // Filter forecast data to get one entry per day
  const dailyForecast = forecastList.filter(
    (forecast, index) => index % 8 === 0
  );

  // Store forecast temperatures in Celsius
  forecastTemps = dailyForecast.map((forecast) => forecast.main.temp);

  forecastCards.forEach((card, index) => {
    const forecast = dailyForecast[index];
    card.querySelector(".forecast-date").textContent = new Date(
      forecast.dt * 1000
    ).toLocaleDateString("en-US", { weekday: "short" });
    card.querySelector(
      ".forecast-icon"
    ).src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
    card.querySelector(".forecast-temp").textContent = `${Math.round(
      forecast.main.temp
    )}°C`;
    card.querySelector(".forecast-condition").textContent =
      forecast.weather[0].description;
  });
}

// Update Temperature Unit
function updateTemperature(temp) {
  if (currentUnit === "celsius") {
    temperature.textContent = `${Math.round(temp)}°C`;
    updateForecastTemps(forecastTemps); // Update forecast temperatures in Celsius
  } else {
    temperature.textContent = `${Math.round((temp * 9) / 5 + 32)}°F`;
    updateForecastTemps(forecastTemps.map((t) => (t * 9) / 5 + 32)); // Update forecast temperatures in Fahrenheit
  }
}

// Update Forecast Temperatures
function updateForecastTemps(temps) {
  forecastCards.forEach((card, index) => {
    const temp = temps[index];
    card.querySelector(".forecast-temp").textContent = `${Math.round(temp)}°${
      currentUnit === "celsius" ? "C" : "F"
    }`;
  });
}

// Update Background Based on Weather Condition
function updateBackground(weatherCondition) {
  let background = "";

  switch (weatherCondition.toLowerCase()) {
    case "clear":
      background = "linear-gradient(135deg, #6dd5ed, #2193b0)";
      break;
    case "clouds":
      background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
      break;
    case "rain":
      background = "linear-gradient(135deg, #4ca1af, #2c3e50)";
      break;
    case "snow":
      background = "linear-gradient(135deg, #e6e6e6, #b3cde0)";
      break;
    case "thunderstorm":
      background = "linear-gradient(135deg, #283048, #859398)";
      break;
    default:
      background = "linear-gradient(135deg, #6dd5ed, #2193b0)";
  }

  container.style.background = background;
}

// Update Weather Suggestion
function updateSuggestion(weatherCondition) {
  let suggestion = "";

  switch (weatherCondition.toLowerCase()) {
    case "clear":
      suggestion = "It's sunny! Perfect for a walk or outdoor activities.";
      break;
    case "clouds":
      suggestion = "It's cloudy. A good day for a light jacket.";
      break;
    case "rain":
      suggestion = "It's raining. Don't forget your umbrella!";
      break;
    case "snow":
      suggestion = "It's snowing. Time to bundle up and enjoy the snow!";
      break;
    case "thunderstorm":
      suggestion = "There's a thunderstorm. Stay indoors and stay safe!";
      break;
    default:
      suggestion = "Enjoy your day!";
  }

  suggestionText.textContent = suggestion;
}

// Handle Unit Toggle
celsiusBtn.addEventListener("click", () => {
  currentUnit = "celsius";
  celsiusBtn.classList.add("active");
  fahrenheitBtn.classList.remove("active");
  updateTemperature(currentTemp); // Update current and forecast temperatures
});

fahrenheitBtn.addEventListener("click", () => {
  currentUnit = "fahrenheit";
  fahrenheitBtn.classList.add("active");
  celsiusBtn.classList.remove("active");
  updateTemperature(currentTemp); // Update current and forecast temperatures
});

// Handle Search Button Click
searchButton.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) {
    fetchWeatherData(city);
  } else {
    alert("Please enter a city name.");
  }
});

// Handle Enter Key Press in Search Input
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) {
      fetchWeatherData(city);
    } else {
      alert("Please enter a city name.");
    }
  }
});

// Initialize App with User's Current Location
getCurrentLocation();
