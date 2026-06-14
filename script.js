const button=document.getElementById("locationButton");
const output=document.getElementById("output");
let map;

button.addEventListener("click", getLocation);

function getLocation(){
    navigator.geolocation.getCurrentPosition(showPosition, showError);
}

async function showPosition(position){
    const latitude=position.coords.latitude;
    const longitude=position.coords.longitude;
    initializeMap(latitude, longitude);
    output.textContent=`Latitude: ${latitude}, Longitude: ${longitude}`;
    searchNearby(latitude, longitude);
}

function showError(error){
    output.textContent="Location access denied or unavailable";
}

async function searchNearby(lat, lon) {

    const query = `
    [out:json];
    (
      node["amenity"="restaurant"](around:5000,${lat},${lon});
      way["amenity"="restaurant"](around:5000,${lat},${lon});
      relation["amenity"="restaurant"](around:5000,${lat},${lon});
    );
    out center;
    `;

    try {

        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                body: query
            }
        );

        const data = await response.json();

        displayPlaces(data.elements);

    } catch(error) {
        console.error(error);
    }
}

places.forEach(place => {

    const item = document.createElement("li");

    item.textContent =
        place.tags?.name || "Unnamed Restaurant";

    placesList.appendChild(item);

    const lat =
        place.lat || place.center?.lat;

    const lon =
        place.lon || place.center?.lon;

    if(lat && lon) {
        L.marker([lat, lon])
            .addTo(map)
            .bindPopup(
                place.tags?.name ||
                "Restaurant"
            );
    }

});

function initializeMap(latitude, longitude) {

    if(map){
        map.remove();
    }

    map = L.map("map").setView(
        [latitude, longitude],
        15
    );

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19
        }
    ).addTo(map);

    L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

    setTimeout(() => {
        map.invalidateSize();
    }, 500);
}
