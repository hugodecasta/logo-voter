<template>
    <v-container>
        <h1>Admin</h1>
        <v-text-field
            v-model="auth_key"
            label="auth_key"
            type="password"
        ></v-text-field>

        <v-card-title>Polls <v-btn
                icon
                color="primary"
                @click="create_new_poll"
            >
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-card-title>

        <v-alert
            v-if="global_error"
            type="error"
        >{{global_error}}</v-alert>

        <!-- ------------------------------------------------- POLLS -->

        <v-expansion-panels>
            <v-row>
                <v-col
                    v-for="(poll,id) in polls"
                    :key="id"
                    cols="12"
                    sm="6"
                >
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <v-card-title>{{poll.name}}</v-card-title>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-list dense>
                                <!-- ---------------------------- PROP LISTS -->
                                <v-list-item>
                                    <v-list-item-icon>
                                        <v-icon>mdi-link</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title>
                                            <a
                                                :href="'/'+poll.id"
                                                target="_blank"
                                            >{{poll.name}}</a>
                                        </v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item
                                    v-for="(prop_data, i) in poll_disp_props"
                                    :key="i"
                                >
                                    <v-list-item-icon>
                                        <v-icon>mdi-{{prop_data.icon}}</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title class='admin_poll_item'>
                                            {{prop_data.transform ? prop_data.transform(poll[prop_data.prop]) : poll[prop_data.prop]}}
                                        </v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                            <!-- ---------------------------- ACTIONS -->
                            <v-card-actions>
                                <v-btn
                                    v-if="!poll.start"
                                    color="success"
                                    @click="start(poll)"
                                >start</v-btn>
                                <v-btn
                                    v-else-if="poll.start && !poll.end"
                                    color="orange"
                                    @click="close(poll)"
                                >close</v-btn>
                                <v-btn
                                    v-else
                                    disabled
                                    color="error"
                                    @click="repoen(poll)"
                                >closed</v-btn>
                                <v-btn
                                    icon
                                    color="primary"
                                    @click="load_polls"
                                >
                                    <v-icon>mdi-refresh</v-icon>
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    icon
                                    color="primary"
                                    @click="add_new_voters(poll)"
                                >
                                    <v-icon>mdi-account-plus</v-icon>
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    icon
                                    @click="copy(poll)"
                                >
                                    <v-icon>mdi-content-copy</v-icon>
                                </v-btn>
                                <v-btn
                                    icon
                                    @click="delete_poll(poll)"
                                >
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </v-card-actions>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-col>
            </v-row>
        </v-expansion-panels>

        <!-- ------------------------------------------------- ADD VOTERS DIALOG -->
        <v-dialog v-model="add_voters_dialog">
            <v-card
                v-if="add_voters_form"
                :disabled="adding_voters"
            >
                <v-card-title>Add voters to poll "{{polls[add_voters_form.add_voters_on].name}}"</v-card-title>
                <v-card-text>
                    <v-form v-model="add_voters_form_valid">
                        <type-tags
                            name="Voters phones"
                            :rules="[choices_rule]"
                            v-model="add_voters_form.voters_phones"
                        ></type-tags>
                        <v-alert
                            v-if="add_voters_error"
                            type="error"
                        >{{add_voters_error}}</v-alert>
                        <v-btn
                            color="primary"
                            :disabled="!add_voters_form_valid || adding_voters"
                            :loading="adding_voters"
                            @click="add_voters"
                        >Create</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- ------------------------------------------------- CREATE DIALOG -->

        <v-dialog v-model="create_dialog">
            <v-card
                v-if="create"
                :disabled="creating_pool"
            >
                <v-card-title>Create pool</v-card-title>
                <v-card-text>
                    <v-form v-model="create_form_valid">
                        <v-text-field
                            v-model="create.name"
                            label="Name"
                            :rules="[v=>!!v || 'name must not be empty']"
                            autofocus
                        >
                        </v-text-field>
                        <v-textarea
                            v-model="create.description"
                            label="Description"
                        >
                        </v-textarea>
                        <type-tags
                            name="Tags"
                            v-model="create.tags"
                        ></type-tags>
                        <type-tags
                            name="Choices"
                            :rules="[choices_rule]"
                            v-model="create.choices"
                        ></type-tags>
                        <type-tags
                            name="Grades"
                            :rules="[grades_rule]"
                            v-model="create.grades"
                        ></type-tags>
                        <v-alert
                            v-if="create_error"
                            type="error"
                        >{{create_error}}</v-alert>
                        <v-btn
                            color="primary"
                            :disabled="!create_form_valid || creating_pool"
                            :loading="creating_pool"
                            @click="create_poll"
                        >Create</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import typeTags from '@/components/type-tags.vue'
import { format } from 'date-fns'
export default {
    components: { typeTags },
    data: () => ({
        auth_key: localStorage.getItem('auth_token') ?? '',
        polls: {},

        global_error: null,

        poll_disp_props: [
            { prop: 'id', icon: 'android' },
            { prop: 'name', icon: 'format-title' },
            { prop: 'description', icon: 'text' },
            { prop: 'tags', icon: 'tag-multiple' },
            { prop: 'choices', icon: 'account-group', transform: (d) => d.length + ' choices' },
            { prop: 'grades', icon: 'star' },
            { prop: 'remaining_voters', icon: 'email-open-outline', transform: (d) => d + ' remaining voters' },
            { prop: 'votes_count', icon: 'email-lock', transform: (d) => d + ' votes' },
            { prop: 'start', icon: 'contain-start', transform: (d) => d ? format(new Date(d), 'dd/MM/yyyy HH:mm') : '---' },
            { prop: 'end', icon: 'contain-end', transform: (d) => d ? format(new Date(d), 'dd/MM/yyyy HH:mm') : '---' },
        ],

        add_voters_dialog: false,
        add_voters_form_valid: false,
        adding_voters: false,
        add_voters_error: null,
        base_add_voters: {
            add_voters_on: null,
            voters_phones: []
        },
        add_voters_form: null,

        create_dialog: false,
        create_form_valid: false,
        creating_pool: false,
        create_error: null,
        choices_rule: (choices) => choices.length > 0 || 'must have at least 1 choice',
        grades_rule: (grades) => grades.length >= 5 || 'must have at least 5 grades',
        base_create: {
            name: '',
            description: 'This is a poll',
            tags: [],
            choices: [],
            grades: ['excellent', 'very good', 'good', 'acceptable', 'poor', 'to reject']
        },
        create: null,

    }),
    watch: {
        'create': {
            handler() {
                this.create_error = null
            },
            deep: true,
        }
    },
    methods: {
        create_new_poll() {
            this.create = JSON.parse(JSON.stringify(this.base_create))
            this.create_dialog = true
        },
        add_new_voters(poll) {
            this.add_voters_form = JSON.parse(JSON.stringify(this.base_add_voters))
            this.add_voters_form.add_voters_on = poll.id
            this.add_voters_dialog = true
        },
        async create_poll() {
            this.creating_pool = true
            try {
                await this.$api.polls.admin.create(this.create)
                await this.load_polls()
                this.create_dialog = false
                this.create = null
            } catch (e) {
                this.create_error = 'An error occured on poll creation, make sure the poll name is unique.'
            }
            this.creating_pool = false
        },
        async add_voters() {
            const poll_id = this.add_voters_form.add_voters_on
            const map_phone_voter_token = Object.fromEntries(this.add_voters_form.voters_phones
                .map(phone => [phone, Math.random().toString(36).slice(-8)]))
            this.adding_voters = true
            try {
                Object.entries(map_phone_voter_token).forEach(([name, token]) => {
                    const link = location.origin + '/' + poll_id + '/' + token
                    prompt('Voter url for ' + name, link)
                })
                await Promise.all(Object.values(map_phone_voter_token)
                    .map(token => this.$api.polls.admin.voters.add(poll_id, { token })))
                await this.load_polls()
                this.add_voters_dialog = false
                this.add_voters_form = null
            } catch (e) {
                this.add_voters_error = 'An error occured on adding voters.'
            }
            this.adding_voters = false
        },
        async load_polls() {
            this.global_error = null
            try {
                const polls_list = await this.$api.polls.admin.list()
                this.polls = Object.fromEntries(await Promise.all(polls_list.map(async id => [
                    id,
                    await this.$api.polls.get(id)
                ])))
            } catch (e) {
                this.global_error = e.message
            }
        },
        async start(poll) {
            await this.$api.polls.admin.start(poll.id)
            await this.load_polls()
        },
        async close(poll) {
            await this.$api.polls.admin.close(poll.id)
            await this.load_polls()
        },
        async copy(poll) {
            const create = JSON.parse(JSON.stringify(poll))
            create.name = create.name + ' - copy'
            delete create.start
            delete create.end
            delete create.votes
            this.create = create
            this.create_dialog = true
        },
        async delete_poll(poll) {
            if (!confirm('delete poll ?')) return
            await this.$api.polls.admin.delete(poll.id)
            await this.load_polls()
        }
    },
    mounted() {
        this.load_polls()
    }
}
</script>

<style>
.admin_poll_item {
    white-space: normal;
}
</style>