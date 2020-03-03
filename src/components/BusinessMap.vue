<template>
    <v-card class="mx-auto" id="businessMapMiniMap">
    </v-card>
</template>

<script>
    import {Loader} from 'google-maps';

    export default {
        name: "BusinessMap",
        props: {businessObject: Object},
        methods: {
            getSinglePointGeoJSONData: function (singlePoint) {
                return {
                    "geometry": {
                        "type": "Point",
                        "coordinates": [singlePoint.coordinates["longitude"], singlePoint.coordinates["latitude"]]
                    },
                    "type": "Feature",
                    "properties": {
                        "description": singlePoint.alias,
                        "name": singlePoint.name,
                        "phone": singlePoint.phone,
                        "storeid": singlePoint.id,
                        "image": singlePoint["image_url"],
                        "address": singlePoint["location"]["address1"] + singlePoint["location"]["city"] +
                            singlePoint["location"]["zip_code"]
                    }
                };
            },
            getGeoJSONData: function () {
                let data = {
                    "type": "FeatureCollection",
                    "features": []
                };
                for (const business of this.businessObject["businesses"]) {
                    data["features"].push(this.getSinglePointGeoJSONData(business));
                }
                return data;
            },
            /*
            Taken from: https://developers.google.com/maps/solutions/store-locator/simple-store-locator
             */
            sanitizeHTML: function (strings) {
                const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;'};
                let result = strings[0];
                for (let i = 1; i < arguments.length; i++) {
                    result += String(arguments[i]).replace(/[&<>'"]/g, (char) => {
                        return entities[char];
                    });
                    result += strings[i];
                }
                return result;
            }
        },
        mounted: function () {
            /*
            Based on code from: https://developers.google.com/maps/solutions/store-locator/simple-store-locator
             */
            let loader = new Loader(process.env.VUE_APP_GMAP_API_KEY, {});
            let parentThis = this;
            let center = this.businessObject['region']['center'];
            loader.load().then(function (google) {
                    const miniMap = new google.maps.Map(document.getElementById('businessMapMiniMap'), {
                        center: {lat: center.latitude, lng: center.longitude},
                        zoom: 12,
                    });
                    miniMap.data.addGeoJson(parentThis.getGeoJSONData(), {idPropertyName: 'storeid'})
                    miniMap.data.setStyle((feature) => {
                        return {
                            icon: {
                                url: `${feature.getProperty('image')}`,
                                scaledSize: new google.maps.Size(32, 32)
                            }
                        };
                    });
                    const infoWindow = new google.maps.InfoWindow();

                    // Show the information for a store when its marker is clicked.
                    miniMap.data.addListener('click', (event) => {
                        const name = event.feature.getProperty('name');
                        const description = event.feature.getProperty('description');
                        const phone = event.feature.getProperty('phone');
                        const image = event.feature.getProperty('image');
                        const address = event.feature.getProperty('address');
                        const position = event.feature.getGeometry().get();
                        const content = parentThis.sanitizeHTML`
                        <img style="float:left; width:200px; margin-top:30px" src="${image}"><div style="margin-left:220px; margin-bottom:20px;">
                            <h2>${name}</h2><p>${description}</p><p><b>Address:</b> ${address}</p><br/><b>Phone:</b> ${phone}</p>
                <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${process.env.VUE_APP_GMAP_API_KEY}"></p>
                      </div>`;
                        infoWindow.setContent(content);
                        infoWindow.setPosition(position);
                        infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});
                        infoWindow.open(miniMap);
                    });
                }
            )
            ;
        },
    }
</script>

<style scoped>
    #businessMapMiniMap {
        width: 100%;
        height: 600px;
        background-color: grey;
    }
</style>