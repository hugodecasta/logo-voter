<template>
    <v-combobox
        v-if="this_data"
        v-model="this_data"
        :items="[]"
        :label="name"
        :rules="rules"
        append-icon=""
        multiple
    >
        <template v-slot:selection="{ attrs, item, select, selected }">
            <v-chip
                v-bind="attrs"
                :input-value="selected"
                close
                @click="select"
                @click:close="remove(item)"
            >
                <strong>{{ item }}</strong>
            </v-chip>
        </template>
    </v-combobox>
</template>

<script>
export default {
    props: ["value", "name", "rules"],
    data: () => ({
        this_data: null,
    }),
    watch: {
        this_data(change) {
            this.$emit("input", change)
        },
        value(new_value) {
            this.$set(this, "this_data", this.value)
        },
    },
    methods: {
        remove(elm) {
            this.this_data.splice(this.this_data.indexOf(elm), 1)
        },
    },
    mounted() {
        this.$set(this, "this_data", this.value)
    },
};
</script>

<style>
</style>