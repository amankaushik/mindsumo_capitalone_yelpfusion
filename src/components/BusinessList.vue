<template>
    <v-card max-width="800" class="mx-auto">
        <v-container fluid>
            <v-data-iterator :items="businessObject.businesses"
                             :page.sync="currentPage"
                             :items-per-page="itemsPerPage"
                             hide-default-footer
                             @page-count="pageCount = $event">
                <template v-slot:default="props">
                    <v-row dense>
                        <v-col cols="12" v-for="(business, i) in props.items" :key="i">
                            <v-card dark color="#385F73">
                                <div class="d-flex flex-no-wrap justify-space-between">
                                    <div>
                                        <v-card-title
                                                class="headline"
                                                v-text="business.name"
                                        ></v-card-title>
                                        <div class="v-card__subtitle">
                                            <v-chip-group>
                                                <v-chip small v-for="(item, j) in business.categories" :key="j">
                                                    <v-avatar left>
                                                        <v-icon small>mdi-silverware-fork-knife</v-icon>
                                                    </v-avatar>
                                                    {{item.title}}
                                                </v-chip>
                                            </v-chip-group>
                                        </div>
                                    </div>
                                    <v-avatar
                                            class="profile"
                                            size="164"
                                            tile
                                    >
                                        <v-img :src="business.image_url"></v-img>
                                    </v-avatar>
                                </div>
                                <v-divider dark></v-divider>
                                <v-card-actions>
                                    <v-btn :href="business.url" target="_blank">View on Yelp</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn :href="business.url">Explore</v-btn>
                                </v-card-actions>
                                <v-expansion-panels>
                                    <v-expansion-panel>
                                        <v-expansion-panel-header>Details</v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <v-card-actions>
                                                <v-icon x-small>mdi-favorite</v-icon>
                                                <v-rating
                                                        v-model="business.rating"
                                                        background-color="white"
                                                        color="yellow accent-4"
                                                        dense
                                                        readonly
                                                        size="18"
                                                        empty-icon=""
                                                ></v-rating>
                                                <v-spacer></v-spacer>
                                                Price Point
                                                <v-rating
                                                        :v-model="2"
                                                        dense
                                                        readonly
                                                        size="18"
                                                        full-icon="mdi-currency-usd"
                                                        empty-icon=""
                                                ></v-rating>
                                            </v-card-actions>
                                            <v-divider></v-divider>
                                            <v-card-actions>
                                                <v-chip small v-for="(service, k) in business.transactions"
                                                        :key="k">
                                                    <v-avatar left>
                                                        <v-icon small>mdi-face-agent</v-icon>
                                                    </v-avatar>
                                                    {{service}}
                                                </v-chip>
                                            </v-card-actions>
                                            <v-divider></v-divider>
                                            <v-card-actions>
                                                <v-chip small @click="showMap = !showMap">
                                                    <v-avatar left>
                                                        <v-icon small>mdi-map-marker</v-icon>
                                                    </v-avatar>
                                                    {{business.location.address1}}
                                                </v-chip>
                                            </v-card-actions>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </v-card>
                        </v-col>
                    </v-row>
                </template>
            </v-data-iterator>
        </v-container>
        <v-card-actions>
            <v-row>
                <v-pagination v-model="currentPage" :length="pageCount"></v-pagination>
            </v-row>
        </v-card-actions>
        <v-container fluid v-if="showMap">
            <div id="miniMap">

            </div>
        </v-container>
    </v-card>
</template>

<script>
    import {Loader} from 'google-maps';

    export default {
        name: "BusinessList",
        props: {businessObject: Object},
        data: () => ({
            show: false,
            currencyIconFull: "mdi-currency-usd",
            itemsPerPage: 4,
            currentPage: 1,
            pageCount: 0,
            miniMapDialog: false,
            loader: new Loader(process.env.VUE_APP_GMAP_API_KEY, {}),
            showMap: false
        }),
        methods: {
            currencySymbolToNum: function (currency) {
                return currency.length;
            },
            getSinglePointGeoJSONData: function (singlePoint) {
                return {
                    "geometry": {
                        "type": "Point",
                        "coordinates": [singlePoint.coordinates["latitude"], singlePoint.coordinates["longitude"]]
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
        updated: async function () {
            const google = await this.loader.load();
            let parentThis = this;
            let center = this.businessObject['region']['center'];
            const miniMap = new google.maps.Map(document.getElementById('miniMap'), {
                center: {lat: center.latitude, lng: center.longitude},
                zoom: 10,
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
            let marker = new google.maps.Marker({
                position: {lat: center.latitude, lng: center.longitude},
                map: miniMap
            });
        }
    }
</script>

<style scoped>
    #miniMap {
        width: 100%;
        height: 400px;
        background-color: grey;
    }
</style>