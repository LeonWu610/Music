<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccountCircleOutline } from '@mdi/js'
import PlayerView from '@/components/player/PlayerView.vue'

const route = useRoute()
const router = useRouter()
const active = ref(route.name)

const login = () => {
  router.push({
    name: 'login'
  })
}

watch(active, (nv) => {
  router.push({
    name: nv
  })
})
</script>

<template>
  <div class="fixed h-dvh bg-gradient-to-b from-yellow-100 via-red-100 to-pink-200" style="width: 100%;">
    <div class="flex flex-col">
      <div
        class="flex space-x-3 items-center justify-center mb-2"
        style="z-index: 999; height: 45px; top: 0; position: fixed; width: 100%;"
      >
        <img src="@/assets/logo.svg" style="height: 35px;"/>
        <div class="font-semibold text-amber-950" style="font-size: 25px;">Leon Music</div>
        <svg-icon type="mdi" :path="mdiAccountCircleOutline" class="login" @click="login"></svg-icon>
      </div>
      <v-tabs
        v-model="active"
        height="30"
        fixed-tabs
        color="brown-darken-2"
        style="position: fixed; top: 50px; width: 100%; z-index: 999; height: 30px;"
      >
        <v-tab value="recommend">推荐</v-tab>
        <v-tab value="singer">歌手</v-tab>
        <v-tab value="rate">排行</v-tab>
        <v-tab value="search">搜索</v-tab>
      </v-tabs>
      <RouterView style="width: 100%; position: fixed; top: 80px; height: 857px;"></RouterView>
      <PlayerView></PlayerView>
    </div>
  </div>
</template>

<style scoped>
.login {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>