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
                        "image": singlePoint["image_url"]
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
        },
        mounted: function () {
            console.log("Mounted Hook");
            let loader = new Loader(process.env.VUE_APP_GMAP_API_KEY, {});
            let parentThis = this;
            let center = this.businessObject['region']['center'];
            loader.load().then(function (google) {
                const miniMap = new google.maps.Map(document.getElementById('businessMapMiniMap'), {
                    center: {lat: center.latitude, lng: center.longitude},
                    zoom: 14,
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
            });
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