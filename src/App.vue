<template>
    <v-app :class='$is_mobile ? "mobile" :"desktop"'>
        <admin v-if="is_admin"></admin>
        <poll v-else></poll>
    </v-app>
</template>

<script>
import Admin from './views/admin.vue'
import poll from './views/poll.vue'

export default {
    name: 'App',

    components: {
        Admin,
        poll
    },
    computed: {
        is_admin() {
            const last = location.pathname.split('/').filter(e => e)
            return last == 'admin'
        },

    },
};
</script>
