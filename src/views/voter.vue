<template>
    <v-container :style="'max-width:'+(next_choice ? 500 : 800)+'px'">
        <template v-if="next_choice">
            <!-- ----------------------------------NEXT CHOICE -->
            <v-row v-if="next_choice">
                <v-col
                    align="center"
                    justify="center"
                >
                    <v-img
                        class="ma-5"
                        contain
                        max-width="200"
                        max-height="200"
                        :src="next_choice"
                        position="center center"
                        center
                    />
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <!-- ---------------------------------- Validate -->
                    <template v-if="pre_ballot[next_choice]">
                        <v-card-title
                            class='grade'
                            large
                        >
                            <v-spacer></v-spacer>
                            {{pre_ballot[next_choice]}}
                            <v-btn
                                icon
                                class='ml-5 mr-2'
                                @click="$delete(pre_ballot,next_choice)"
                            >
                                <v-icon>mdi-restore</v-icon>
                            </v-btn>
                            <v-btn
                                fab
                                color="primary"
                                @click="validate_choice(next_choice)"
                            >
                                <v-icon>mdi-check</v-icon>
                            </v-btn>
                            <v-spacer></v-spacer>
                        </v-card-title>

                    </template>
                    <!-- ---------------------------------- GRADES -->
                    <template v-else>
                        <v-btn
                            v-for="(grade,gi) in poll.grades"
                            class="mb-3"
                            block
                            elevation="0"
                            :key="gi"
                            :outlined="!grade_selected(next_choice,grade)"
                            @click="$set(pre_ballot,next_choice,grade)"
                            :style="use_color ? `background:${grade_color(grade)[1]};color:${grade_color(grade)[0]}`:''"
                            :color="grade_selected(next_choice, grade) ? 'primary':''"
                        >
                            {{grade}}
                        </v-btn>
                    </template>
                </v-col>
            </v-row>
        </template>
        <template v-else-if="!allow_start">
            <div v-html="poll.description.replace(/\n/g,'<br/><br/>')"></div>
            <v-btn
                color="primary"
                block
                class='mt-5'
                @click="allow_start=true"
            >Start<v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
        </template>
        <template v-else>
            <h2>Verifiez votre vote</h2>
            <logo-results
                :grades="poll.grades"
                :results="ballot"
                :reloadable="true"
                :display_grades="true"
                @reload="choice=>$delete(ballot,choice)"
            ></logo-results>
            <v-btn
                @click="vote"
                :disabled="!can_vote || is_voting"
                :loading="is_voting"
                color="primary"
                large
                block
            >
                Envoyer le vote<v-icon class='ml-3'>mdi-check</v-icon>
            </v-btn>
        </template>
    </v-container>
</template>

<script>
import logoResults from '@/components/logo-results.vue'
export default {
    components: { logoResults },
    props: ['poll', 'voter_id', 'use_color'],
    data: () => ({
        pre_ballot: {},
        ballot: {},
        is_voting: false,
        allow_start: false,
    }),
    computed: {
        next_choice() {
            if (!this.allow_start) return null
            return this.poll.choices.sort(() => (Math.random() - 0.5) * 2).find(choice => !(choice in this.ballot))
        },
        can_vote() {
            return Object.keys(this.ballot).length == this.poll.choices.length
        },
        final_ballot() {
            return this.poll.choices.map(choice => ({ choice, grade: this.ballot[choice] }))
        }
    },
    methods: {
        grade_color(grade) {
            const from = 0
            const to = 120
            const index = this.poll.grades.indexOf(grade)
            const ratio = 1 - (index / (this.poll.grades.length - 1))
            const hue = parseInt(ratio * (to - from) + from)
            const color = 'white'
            return [color, 'hsl(' + hue + ', 60%, 50%)']
        },
        validate_choice(choice) {
            const grade = this.pre_ballot[choice]
            this.$delete(this.pre_ballot, choice)
            this.$set(this.ballot, choice, grade)
            localStorage.setItem('vote', JSON.stringify({ poll_id: this.poll.id, voter_id: this.voter_id, vote: this.ballot }))
        },
        grade_selected(choice, grade) {
            return this.pre_ballot[choice] == grade
        },
        async vote() {
            this.is_voting = true
            await this.$api.polls.vote(this.voter_id, this.poll.id, this.final_ballot)
            localStorage.removeItem('vote')
            this.is_voting = false
            this.$emit('voted')
        }
    },
    mounted() {
        const { poll_id, voter_id, vote } = JSON.parse(localStorage.getItem('vote') ?? '{}')
        if (poll_id == this.poll.id && voter_id == this.voter_id) {
            this.ballot = vote
            this.allow_start = true
        }
    }
}
</script>

<style>
</style>