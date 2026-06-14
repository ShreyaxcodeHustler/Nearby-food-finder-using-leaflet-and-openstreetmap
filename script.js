const button = document.getElementById("locationButton");
const output = document.getElementById("output");

let map;
let restaurantMarkers=[];

button.addEventListener("click", getLocation);

function getLocation() {
    navigator.geolocation.getCurrentPosition(
        showPosition,
        showError
    );
}

async function showPosition(position) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    output.textContent =
        `Latitude: ${latitude.toFixed(5)}
         Longitude: ${longitude.toFixed(5)}`;

    initializeMap(latitude, longitude);

    searchNearby(latitude, longitude);
}

function showError(error) {
    output.textContent =
        "Location access denied or unavailable";
}

async function searchNearby(lat, lon) {
    const radius=document.getElementById("radius").value;
    const query = `
    [out:json];
    (
      node["name"~"pav bhaji",i]
      (around:$radius,${lat},${lon});

      way["name"~"pav bhaji",i]
      (around:$radius,${lat},${lon});

      relation["name"~"pav bhaji",i]
      (around:$radius,${lat},${lon});
    );
    out center;
    `;

    try {

        const response =
            await fetch(
                "https://overpass-api.de/api/interpreter",
                {
                    method: "POST",
                    body: query
                }
            );
            const text=await response.text();
            console.log(text);
            return;
        
        const data =
            await response.json();

        const places =
            data.elements.map(place => {

                const placeLat =
                    place.lat ||
                    place.center?.lat;

                const placeLon =
                    place.lon ||
                    place.center?.lon;

                const distance =
                    calculateDistance(
                        lat,
                        lon,
                        placeLat,
                        placeLon
                    );

                return {
                    ...place,
                    distance
                };
            });

        places.sort(
            (a, b) =>
                a.distance - b.distance
        );

        displayPlaces(places);

    }
    catch(error) {

        console.error(error);

        output.textContent =
            "Failed to load nearby places";
        alert(error.message);
    }
}

function displayPlaces(places) {
        restaurantMarkers.forEach(marker => {
        map.removeLayer(marker);
    });

    restaurantMarkers = [];

    const placesList =
        document.getElementById("placesList");

    placesList.innerHTML = "";

    places.forEach(place => {

        const item =
            document.createElement("li");

        const name =
            place.tags?.name ||
            "Unnamed Place";

        const address =
            place.tags?.addr_street ||
            "Address unavailable";

        item.innerHTML = `
            <strong>${name}</strong><br>
            ${address}<br>
            ${place.distance.toFixed(2)} km away
        `;

        placesList.appendChild(item);

        const markerLat =
            place.lat ||
            place.center?.lat;

        const markerLon =
            place.lon ||
            place.center?.lon;

        if(markerLat && markerLon) {

            L.marker([
                markerLat,
                markerLon
            ])
            .addTo(map)
            .bindPopup(
                `${name}<br>
                 ${place.distance.toFixed(2)} km`
            );
            restaurantMarkers.push(marker);
        }
    });
}

function initializeMap(
    latitude,
    longitude
) {

    if(map) {
        map.remove();
    }

    map = L.map("map")
        .setView(
            [latitude, longitude],
            14
        );

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19
        }
    ).addTo(map);

    L.marker([
        latitude,
        longitude
    ])
    .addTo(map)
    .bindPopup("You are here")
    .openPopup();
}

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            lat1 * Math.PI / 180
        ) *

        Math.cos(
            lat2 * Math.PI / 180
        ) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}