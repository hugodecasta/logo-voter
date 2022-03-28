<template>
    <v-container v-if="poll">
        <h1 class='ma-3'>{{poll.name}}</h1>
        <voter
            v-if="!is_done && is_voter === true"
            :poll="poll"
            :voter_id="voter_id"
            :use_color="poll.tags.includes('color')"
            @voted="load_poll"
        ></voter>
        <template v-else-if="is_done && poll_results">
            <h2 class='ma-3'>Résultats</h2>
            <logo-results
                :grades="poll.grades"
                :results="poll_results.choices_results"
                :details="poll.tags.includes('color') ? poll_results.choices_votes_accumulated : null"
                :choice_order="poll_results.ordered_choices"
                :display_grades="true"
            ></logo-results>
        </template>
        <closed
            v-else-if="is_voter === false"
            :poll="poll"
        ></closed>
        <loader v-else></loader>
    </v-container>
    <v-container
        style="max-width:500px"
        class='pl-5'
        fill-height
        fluid
        v-else-if="poll === false"
    >
        <v-row
            align="center"
            justify="center"
        >
            <v-col>
                <h1>Hey you !</h1>
                <v-card-text>Welcome to hugo's logo-voter. It appears no valid poll has been selected. Contact your admin to recieve a proper voting link</v-card-text>
            </v-col>
        </v-row>
    </v-container>
    <loader v-else></loader>
</template>

<script>
import LogoResults from '@/components/logo-results.vue'
import Closed from './closed.vue'
import Voter from './voter.vue'
import Loader from '@/components/loader.vue'
export default {
    components: { Closed, Voter, LogoResults, Loader },
    data: () => ({
        poll: null,
        poll_results: null,
        ballot: {},
        is_voter: null,
    }),
    computed: {
        poll_id() {
            return location.pathname.split('/').filter(e => e)[0]
        },
        voter_id() {
            return location.pathname.split('/').filter(e => e)[1]
        },
        can_vote() {
            return Object.keys(this.ballot).length == this.poll.choices.length
        },
        is_done() {
            return (this.poll?.end ?? Infinity) < Date.now()
        }
    },
    methods: {
        grade_selected(choice, grade) {
            return this.ballot[choice] == grade
        },
        async load_poll() {
            this.is_voter = null
            this.poll = null
            try {
                this.poll = await this.$api.polls.get(this.poll_id)
                this.is_voter = await this.$api.polls.is_voter(this.voter_id, this.poll_id)
            } catch (e) {
                console.log('')
                this.poll = false
            }
            try {
                this.poll_results = await this.$api.polls.results(this.poll_id)
            } catch (e) {
                this.poll_results = false
            }
        }
    },
    mounted() {
        this.load_poll()
    }
}
</script>

<style scoped>
.unselected {
    opacity: 0.7;
}
</style>