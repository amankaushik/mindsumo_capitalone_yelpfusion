<template>
    <v-container>
        <v-sheet max-height="800" class="overflow-y-auto" id="scroll-sheet">
            <v-container fluid>
                <v-row v-if="bottomNavigation['mapView']['active']">
                    <BusinessMap :business-object="processedBusinessObject"></BusinessMap>
                </v-row>
                <v-row v-if="bottomNavigation['listView']['active']">
                    <v-card max-width="800" id="listView" class="mx-auto">
                        <v-data-iterator :items="processedBusinessObject.businesses"
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
                                                            <v-chip small
                                                                    v-for="(item, j) in business.categories"
                                                                    :key="j">
                                                                <v-avatar left>
                                                                    <v-icon small>mdi-silverware-fork-knife
                                                                    </v-icon>
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
                                                            <v-icon large>mdi-seal</v-icon>
                                                            {{business.rating}}
                                                            <v-rating
                                                                    v-model="business.rating"
                                                                    background-color="white"
                                                                    dense
                                                                    readonly
                                                                    half-increments
                                                                    size="18"
                                                            ></v-rating>
                                                            <v-spacer></v-spacer>
                                                            <v-icon large>mdi-cash-usd</v-icon>
                                                            <v-rating
                                                                    v-model="business.price"
                                                                    background-color="white"
                                                                    dense
                                                                    readonly
                                                                    size="18"
                                                                    full-icon="mdi-currency-usd"
                                                                    empty-icon="mdi-currency-usd-off"
                                                            ></v-rating>
                                                        </v-card-actions>
                                                        <v-divider></v-divider>
                                                        <v-card-actions>
                                                            <v-chip-group>
                                                                <v-chip small>
                                                                    <v-avatar left>
                                                                        <v-icon small>mdi-map-marker</v-icon>
                                                                    </v-avatar>
                                                                    {{business.location.address1}}
                                                                </v-chip>
                                                                <v-chip small
                                                                        v-for="(service, k) in business.transactions"
                                                                        :key="k">
                                                                    <v-avatar left>
                                                                        <v-icon small>mdi-face-agent</v-icon>
                                                                    </v-avatar>
                                                                    {{service}}
                                                                </v-chip>
                                                            </v-chip-group>
                                                        </v-card-actions>
                                                    </v-expansion-panel-content>
                                                </v-expansion-panel>
                                            </v-expansion-panels>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </template>
                        </v-data-iterator>
                        <v-card-actions>
                            <v-row>
                                <v-pagination v-model="currentPage" :length="pageCount"></v-pagination>
                            </v-row>
                        </v-card-actions>
                    </v-card>
                </v-row>
            </v-container>
        </v-sheet>
        <v-bottom-navigation color="purple lighten-1" @change="updateVisible" absolute>
            <v-btn v-for="(button, i) of bottomNavigation" :key="i" :value="button">
                <span>{{button.span}}</span>
                <v-icon>{{button.icon}}</v-icon>
            </v-btn>
        </v-bottom-navigation>
    </v-container>
</template>

<script>

    import BusinessMap from "@/components/BusinessMap";

    export default {
        name: "ExploreBusiness",
        components: {BusinessMap},
        props: {businessObject: Object},
        data: () => ({
            show: false,
            currencyIconFull: "mdi-currency-usd",
            itemsPerPage: 4,
            currentPage: 1,
            pageCount: 0,
            mapView: "mapView",
            listView: "listView",
            parallelView: "parallelView",
            isMapViewVisible: true,
            isListViewVisible: false,
            isParallelViewVisible: false,
            bottomNavigation: {
                listView: {span: 'List View', icon: 'mdi-view-list', active: true},
                mapView: {span: 'Map View', icon: 'mdi-map', active: false},
            }
        }),
        computed: {
            processedBusinessObject: function () {
                let processed = {};
                for (let key in this.businessObject) {
                    if (key === "businesses") {
                        for (let business of this.businessObject[key]) {
                            business.price = this.currencySymbolToNum(business.price);
                        }
                    }
                    processed[key] = this.businessObject[key];
                }
                return processed;
            }
        },
        methods: {
            currencySymbolToNum: function (currency) {
                return currency.length * 1.0;
            },
            updateVisible: function (view) {
                // reset visible
                for (let button in this.bottomNavigation) {
                    this.bottomNavigation[button]['active'] = false;
                }
                view.active = true;
            },
        },
    }
</script>
