<template>
    <v-card max-width="800" class="mx-auto">
        <v-container fluid>
            <v-data-iterator :items="businessList.businesses"
                             :page.sync="currentPage"
                             :items-per-page="itemsPerPage"
                             hide-default-footer
                             @page-count="totalItems = $event">
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
                                    <v-btn :href="business.url">View on Yelp</v-btn>
                                    <v-btn :href="business.url">Explore</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn icon @click="show = !show">
                                        <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                                    </v-btn>
                                </v-card-actions>
                                <v-expand-transition>
                                    <div v-show="show">
                                        <v-divider></v-divider>
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
                                        <v-card-text>
                                            <v-chip small v-for="(service, k) in business.transactions" :key="k">
                                                <v-avatar left>
                                                    <v-icon small>mdi-face-agent</v-icon>
                                                </v-avatar>
                                                {{service}}
                                            </v-chip>
                                        </v-card-text>
                                        <v-divider></v-divider>
                                        <v-card-text>
                                            <v-chip large>
                                                <v-avatar left>
                                                    <v-icon large>mdi-map-marker</v-icon>
                                                </v-avatar>
                                                {{business.location.address1}}
                                            </v-chip>
                                        </v-card-text>
                                    </div>
                                </v-expand-transition>
                            </v-card>
                        </v-col>
                    </v-row>
                </template>
            </v-data-iterator>
        </v-container>
        <v-card-actions>
            <v-row>
                <v-pagination v-model="currentPage" :length="totalItems"></v-pagination>
            </v-row>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        name: "BusinessList",
        props: {businessList: Object},
        data: () => ({
            show: false,
            currencyIconFull: "mdi-currency-usd",
            itemsPerPage: 4,
            currentPage: 1
        }),
        methods: {
            currencySymbolToNum: function (currency) {
                return currency.length;
            },
            totalItems: function () {
                return this.businessList.businesses.length;
            }
        }
    }
</script>
