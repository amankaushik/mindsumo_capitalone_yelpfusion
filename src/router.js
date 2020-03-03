import Vue from 'vue'
import Router from 'vue-router'
import Landing from "@/views/Landing";
import BusinessGraph from "@/views/BusinessGraph"

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'landing',
            component: Landing
        },
        {
            path: '/explore/:bid',
            name: 'explore',
            component: BusinessGraph
        }
    ]
})