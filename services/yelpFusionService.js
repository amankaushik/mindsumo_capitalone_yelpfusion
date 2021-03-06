import axios from 'axios'

axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';

const axiosClient = axios.create(
    {
        baseURL: process.env.VUE_APP_YELP_API_BASE,
        withCredentials: false,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VUE_APP_YELP_API_KEY}`
        }
    }
)

export default {
    // get a list of businesses near the specified location
    getBusinessMatches(location, isLocatedByString) {
        // user entered location
        if (isLocatedByString) {
            return axiosClient.get(`${process.env.VUE_APP_YELP_API_BASE}${process.env.VUE_APP_YELP_API_SEARCH}?location=${location["locationString"]}`)
        } else {
            return axiosClient.get(`${process.env.VUE_APP_YELP_API_BASE}${process.env.VUE_APP_YELP_API_SEARCH}?latitude=${location["latitude"]}&longitude=${location["longitude"]}`)
        }
    },
    getBusinessDetails(id) {
        return axiosClient.get(`${process.env.VUE_APP_YELP_API_BASE}${process.env.VUE_APP_YELP_API_DETAILS}/${id}`);
    }
}

