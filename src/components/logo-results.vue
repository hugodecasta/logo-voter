<template>
    <v-container style="max-width:800px">
        <v-row
            v-for="grade in used_grades"
            :key="grade"
            align="center"
            justify="center"
            class='mb-10'
        >
            <v-col
                cols="12"
                sm="4"
                v-if="display_grades"
            >
                <v-card-title
                    class='grade'
                    large
                >{{grade}}</v-card-title>
            </v-col>
            <v-col>
                <v-row>
                    <v-col
                        v-for="choice in grade_choices[grade]"
                        :key="choice"
                        align="center"
                        justify="center"
                    >
                        <v-img
                            :src="choice"
                            contain
                            :width="choice_sizes[choice]+'px'"
                            :height="choice_sizes[choice]+'px'"
                        />
                        <v-card-subtitle v-if="details && grade_choices[grade].length > 1">
                            {{details[choice][grade]}}
                        </v-card-subtitle>
                        <v-btn
                            icon
                            v-if="reloadable"
                            @click="$emit('reload',choice)"
                        >
                            <v-icon>mdi-restore</v-icon>
                        </v-btn>
                        <v-btn
                            fab
                            small
                            v-if="validable"
                            color="primary"
                            @click="$emit('validate',choice)"
                        >
                            <v-icon>mdi-check</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <template v-if="details">
            <v-divider class='mt-10 mb-10'></v-divider>
            <v-card-title
                class='grade'
                large
            >Plus de détails</v-card-title>
            <v-row>
                <v-col
                    v-for="choice in choice_order"
                    :key="choice"
                    style="display:flex"
                    class='mb-10 mt-10'
                >
                    <v-spacer></v-spacer>
                    <div>

                        <v-img
                            :src="choice"
                            contain
                            width="100px"
                            height="100px"
                            style="flex:auto"
                        />
                        <v-card-subtitle>{{results[choice]}}</v-card-subtitle>
                        <div class='grade_scale'>
                            <div class='grade_median'></div>
                            <div
                                class='grade_part'
                                v-for="(ammount,grade) in details[choice]"
                                :key="grade"
                                :style="{
                            height:((ammount/vote_count)*100)+'%',
                            background:grade_color(grade)
                        }"
                            >
                                {{grade.split(' ').map(t=>t[0].toUpperCase()).join('')}}
                            </div>
                        </div>
                    </div>
                    <v-spacer></v-spacer>
                </v-col>
            </v-row>
        </template>
    </v-container>
</template>

<script>
export default {
    props: ['grades', 'results', 'details', 'choice_order', 'reloadable', 'validable', 'display_grades'],
    data: () => ({
        max_size: 200,
        min_size: 40,
        absolute_size: true,
    }),
    computed: {
        results_ids() {
            return Object.fromEntries(Object.entries(this.results).map(([c, g]) => [c, this.grades.indexOf(g)]))
        },
        max_grade_id() {
            return Math.min(...Object.values(this.results_ids))
        },
        min_grade_id() {
            return Math.max(...Object.values(this.results_ids))
        },
        choice_sizes() {
            return Object.fromEntries(
                Object.entries(this.results)
                    .map(([c, grade]) => [c, this.logo_size(grade)])
                    .sort(([, s1], [, s2]) => s2 - s1)
            )
        },
        grade_choices() {
            console.log(this.details)
            const results_entries = Object.entries(this.results)
            return Object.fromEntries(this.grades.map(g => [
                g,
                results_entries.filter(([, gd]) => gd == g).map(([c]) => c)
                    .sort((c1, c2) => {
                        if (!this.details || !this.choice_order) return (Math.random() - 0.5) * 2
                        const s1 = this.details[c1][g] + this.choice_order.indexOf(c1) * 0.2 + Math.random() * 0.02
                        const s2 = this.details[c2][g] + this.choice_order.indexOf(c2) * 0.2 + Math.random() * 0.02
                        return s1 - s2
                    })
            ]))
        },
        used_grades() {
            const results_values = Object.values(this.results)
            return this.grades.filter(g => results_values.includes(g))
        },
        vote_count() {
            return Object.values(Object.values(this.details)[0]).reduce((a, b) => a + b, 0)
        }
    },
    methods: {
        grade_percent(grade) {
            const gid = this.grades.indexOf(grade)
            return 1 - (gid / (this.grades.length - 1))
        },
        logo_size(grade) {
            const perc = this.grade_percent(grade)
            return perc * (this.max_size - this.min_size) + this.min_size
        },
        grade_color(grade) {
            const from = 0
            const to = 120
            const index = this.grades.indexOf(grade)
            const ratio = 1 - (index / (this.grades.length - 1))
            const hue = parseInt(ratio * (to - from) + from)
            const color = 'white'
            return [color, 'hsl(' + hue + ', 60%, 50%)']
        },
    }
}
</script>

<style scoped>
.grade {
    position: relative;
    opacity: 0.5;
}

.grade_scale {
    position: relative;
    width: 100px;
    height: 400px;
    background: #f00;
}
.grade_part {
    width: inherit;
    color: rgba(0, 0, 0, 0.2);
    font-size: 20px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.grade_median {
    position: absolute;
    width: 150%;
    height: 1px;
    top: 50%;
    left: -25%;
    background: #000;
    opacity: 0.5;
}

.mobile .grade::before {
    position: absolute;
    content: " ";
    width: 30px;
    height: 1.5px;
    top: 32px;
    left: -25px;
    opacity: 0.1;
    background: var(--v-primary-base);
}
</style>