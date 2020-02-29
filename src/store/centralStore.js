export default {
    namespaced: true,
    state: {
        // has the user been located using the geolocation API
        // or the user has entered location manually
        isLocated: false,
        locatedByString: true,
        location: {
            locationString: null,
            latitude: null,
            longitude: null
        }
    },
    getters: {
        getIsLocated: state => {
            return state.isLocated;
        },
        getLocation: state => {
            return state.location;
        },
        getLocatedByString: state => {
            return state.locatedByString;
        }
    },
    actions: {
        setIsLocated: ({commit}, payload) => {
            commit('setIsLocated', payload);
        },
        setLocation: ({commit}, payload) => {
            commit('setLocation', payload);
        },
        setLocatedByString: ({commit}, payload) => {
            commit('setLocatedByString', payload);
        }
    },
    mutations: {
        setIsLocated: (state, value) => {
            state.isLocated = value;
        },
        setLocation: (state, value) => {
            state.location = value;
        },
        setLocatedByString: (state, value) => {
            state.locatedByString = value;
        }
    }
}