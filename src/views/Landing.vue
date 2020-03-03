<template>
    <v-container>
        <v-card v-if="gettingLocation">
            <v-progress-circular
                    :size="70"
                    :width="7"
                    color="purple"
                    indeterminate
            >
                {{progressMessage}}
            </v-progress-circular>
        </v-card>
        <v-card v-else-if="locationError">
            <v-alert type="error">
                Unable to get position because {{locationErrorString}}
            </v-alert>
            <v-form>
                <v-text-field v-model="formText" required label="Try 'Tempe'">
                </v-text-field>
                <v-btn :disabled="!hasInput" color="success" @click="getBusinesses()">
                    Find
                </v-btn>
            </v-form>
        </v-card>
        <ExploreBusiness v-else :business-object=responseData></ExploreBusiness>
    </v-container>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import yelpFusionService from "../../services/yelpFusionService";
    import ExploreBusiness from "@/components/ExploreBusiness"

    export default {
        name: "Landing",
        components: {ExploreBusiness},
        data: function () {
            return {
                gettingLocation: true,
                locationError: false,
                progressMessage: "Getting Location",
                locationErrorString: "",
                formText: "",
                response: null
            }
        },
        methods: {
            ...mapActions('centralStore', ['setIsLocated', 'setLocation', 'setLocatedByString']),
            getBusinesses: function () {
                // location entered by user
                if (this.getLocatedByString) {
                    this.gettingLocation = false;
                    this.locationError = false;
                    // set location state
                    this.setIsLocated(true);
                    this.setLocatedByString(true);
                    this.setLocation({
                        latitude: null,
                        longitude: null,
                        locationString: this.formText
                    });
                }
                let location = this.getLocation;
                let parentThis = this;
                yelpFusionService.getBusinessMatches(location, this.getLocatedByString).then(
                    response => {
                        parentThis.response = response.data;
                    }).catch(
                    error => {
                        console.log(error)
                    }).finally(function () {
                });
            },

        },
        computed: {
            ...
                mapGetters('centralStore', ['getIsLocated', 'getLocation', 'getLocatedByString']),
            hasInput:
                function () {
                    return this.locationErrorString.length > 0;
                },
            responseData: function () {
                return this.response;
            },
        },
        beforeCreate: function () {
            if (!this.getIsLocated) {
                navigator.geolocation.getCurrentPosition(
                    response => {
                        this.gettingLocation = false;
                        // set location state
                        this.setIsLocated(true);
                        this.setLocatedByString(false);
                        this.setLocation({
                            latitude: response.coords.latitude,
                            longitude: response.coords.longitude,
                            locationString: null
                        });
                        this.getBusinesses();
                    },
                    error => {
                        this.gettingLocation = false;
                        this.locationError = true;
                        if (error.PERMISSION_DENIED) {
                            this.locationErrorString = "Permission Denied";
                        } else if (error.TIMEOUT) {
                            this.locationErrorString = "Timeout";
                        } else if (error.POSITION_UNAVAILABLE) {
                            this.locationErrorString = "Position Unavailable";
                        } else {
                            this.locationErrorString = "Undefined Error";
                        }
                    });
            }
        }
    }
</script>
