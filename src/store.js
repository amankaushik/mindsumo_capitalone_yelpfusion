import Vue from 'vue'
import Vuex from 'vuex'
import centralStore from "@/store/centralStore";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {},
    modules: {
        centralStore
    },
})