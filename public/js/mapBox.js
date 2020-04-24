/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations)
console.log(locations)

mapboxgl.accessToken = 'pk.eyJ1IjoiaDRrc3QzciIsImEiOiJjazlkMjRhbnIwN25iM2VrMjNpdTZmaHZ4In0.NoPADsCwdICTFlGqD0cSwQ'
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/h4kst3r/ck9d2eqfz14ji1ir0xof8c25k',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 10
})


const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    //Create marker
    const marker = document.createElement('div');
    marker.className = 'marker'
    // Add the marker
    new mapboxgl.Marker({
        element: marker,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map)

    // Add Popup 
    new mapboxgl.Popup({
        offset: 30,
    }).setLngLat(loc.coordinates).setText(`Day : ${loc.day} : ${loc.description}`).addTo(map)
    // extend map bounds to include current location
    bounds.extend(loc.coordinates)
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 200,
        left: 100,
        right: 100
    }
})