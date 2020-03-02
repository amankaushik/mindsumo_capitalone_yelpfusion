<template>
    <v-container class="grey lighten-5">
        <v-card class="mx-auto" id="miniMap">
        </v-card>
    </v-container>
</template>

<script>
    import {Loader} from 'google-maps';

    export default {
        name: "ExploreBusiness",
        props: {businessObject: Object},
        data: () => ({
            show: false,
            currencyIconFull: "mdi-currency-usd",
            itemsPerPage: 4,
            currentPage: 1,
            pageCount: 0,
            miniMapDialog: false,
            loader: new Loader(process.env.VUE_APP_GMAP_API_KEY, {}),
        }),
        methods: {
            currencySymbolToNum: function (currency) {
                return currency.length;
            },
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
                console.log(data);
                return data;
            },
        },
        created: async function () {
            console.log('Created Hook Called');
            console.log(this.businessObject);
            const google = await this.loader.load();
            let parentThis = this;
            let center = this.businessObject['region']['center'];
            const miniMap = new google.maps.Map(document.getElementById('miniMap'), {
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
            // eslint-disable-next-line no-unused-vars
        },
        updated() {
            console.log('Updated Hook Called');
            console.log(this.businessObject)
        },
        beforeUpdate() {
            console.log('beforeUpdate Hook Called');
            console.log(this.businessObject)
        }
    }
</script>

<style scoped>
    #miniMap {
        width: 100%;
        height: 600px;
        background-color: grey;
    }
</style>