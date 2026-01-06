<template>

</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { dingTalkLogin } from "@/api/auth";
import { onMounted } from 'vue';

const route = useRoute()
const router = useRouter()

onMounted(() => {
    dingTalkLogin({ code: route.query.code as string }).then(res => {
        if (res.data.data && res.data.data.token) {
            localStorage.setItem('token', res.data.data.token.access_token)
            localStorage.setItem('refresh_token', res.data.data.token.refresh_token)
            localStorage.setItem('userInfo', JSON.stringify(res.data.data.user))
        }
        if (res.data.code === 200) {
            router.push('/app/home')
        }
    })
})
</script>

<style scoped></style>