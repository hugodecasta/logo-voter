<template>
    <v-container
        style="max-width:500px"
        class='pl-5'
        fill-height
        fluid
        v-if="poll"
    >
        <v-row
            align="center"
            justify="center"
        >
            <v-col>
                <v-card-text>Vote terminé, les résultats seront disponibles prochainement.</v-card-text>
                <v-card-text>Vous pouvez régulièrement ré-ouvrir votre lien de vote afin de vérifier les résultats.</v-card-text>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    props: ['poll']
}
</script>

<style>
</style>