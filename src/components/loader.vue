<template>
    <v-container fill-height>
        <v-row
            align="center"
            justify="center"
        >
            <v-col style="display:flex;flex-direction:row">
                <v-spacer></v-spacer>
                <div>
                    <v-img
                        src='/icon.png'
                        width="200px"
                        height="200px"
                        contain
                    ></v-img>
                    <v-progress-linear
                        indeterminate
                        color="primary"
                    ></v-progress-linear>
                </div>
                <v-spacer></v-spacer>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {

}
</script>

<style>
</style>