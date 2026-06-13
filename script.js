const button=document.getElementById("locationButton");
const output=document.getElementById("output");

button.addEventListener("click", getLocation);

function getLocation(){
    navigator.geolocation.getCurrentPosition(showPosition, showError);
}

async function showPosition(position){
    const latitude=position.coords.latitude;
    const longitude=position.coords.longitude;

    output.textContent='Latitude:${latitude} Longitude:${longitude}';
    searchNearby(latitude, longitude);
}

function showError(error){
    output.textContent="Location access denied or unavailable";
}

async function searchNearby(lat, lon){
    const query =
        `https://nominatim.openstreetmap.org/search?q=pav+bhaji&format=jsonv2&limit=10`;

    try{
        const response= await fetch(query);
        const data =await response.json();
        displayPlaces(data);

    }
    catch(error){
        console.log(error);
    }
}

function displayPlaces(places){
    const PlaceList= document.getElementById("placesList");
    placesList.innerHTML="";
    places.forEach(place=>{
        const item= document.createElement("li");
        item.textContent=place.display_name;
        placesList.appendChild(item);
    })
}