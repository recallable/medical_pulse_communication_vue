<template>
    <div>
        <h1>Home</h1>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute()
console.log(route.query);

</script>

<style scoped></style>