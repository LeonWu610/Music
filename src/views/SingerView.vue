<template>
  <div class="overflow-y-scroll" ref="scrollContainer" @scroll="handleScroll">
    <div ref="groupRef">
      <!-- 热门歌手 -->
      <div v-if="hotArtists && hotArtists.length">
        <div class="mb-2 pl-5 text-sm" style="background-color: pink">
          {{ hotArtists[0].title }}
        </div>
        <div
          v-for="artist in hotArtists[0].list"
          :key="artist.id"
          class="flex align-center"
          @click="handleSingerClick(artist.id, artist.picUrl, artist.name)"
        >
          <div class="mx-3 mb-2 w-16 h-16 overflow-hidden rounded-full">
            <v-img
              width="40"
              height="40"
              lazy-src=""
              :src="artist.picUrl"
              cover
              style="border-radius: 50%"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                </div>
              </template>
            </v-img>
          </div>
          <div class="flex-1 mt-2 text-xs">{{ artist.name }}</div>
        </div>
      </div>

      <!-- 歌手列表 -->
      <div v-for="group in Artists" :key="group.title">
        <div class="mb-2 pl-5 text-sm" style="background-color: pink">{{ group.title }}</div>
        <div
          v-for="artist in group.list"
          :key="artist.id"
          class="flex align-center"
          @click="handleSingerClick(artist.id, artist.picUrl, artist.name)"
        >
          <div class="mx-3 mb-2 w-16 h-16 overflow-hidden rounded-full">
            <v-img
              width="40"
              height="40"
              lazy-src=""
              :src="artist.picUrl"
              cover
              style="border-radius: 50%"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                </div>
              </template>
            </v-img>
          </div>
          <div class="flex-1 mt-2 text-xs">{{ artist.name }}</div>
        </div>
      </div>
    </div>

    <!-- 固定标题 -->
    <div v-if="fixedTitle" class="mb-2 pl-5 text-sm fixed-title" style="background-color: pink">
      {{ fixedTitle }}
    </div>
  </div>
</template>

<script setup>
import { fetchArtistList } from '@/api/api'
import { useRouter } from 'vue-router'
import { useSingerStore } from '@/stores/singer.js'
import { ref } from 'vue'

const hotArtists = ref()
const Artists = ref([])
const router = useRouter()
const singer = useSingerStore()

const handleSingerClick = (id, url, name) => {
  router.push({ path: `/singer/${id}` })
  singer.picUrl = url
  singer.name = name
}

fetchArtistList().then(async ({ hot, letter }) => {
  hotArtists.value = hot
  Artists.value = letter
})

const groupRef = ref(null) // 用于引用 DOM 元素
const scrollContainer = ref(null) // 用于引用滚动容器
const fixedTitle = ref(null) // 用于引用固定标题

const handleScroll = () => {
  const container = scrollContainer.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const fixedOffset = rect.top // 获取容器相对于视口顶部的偏移量

  const groups = groupRef.value.children
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    const groupRect = group.getBoundingClientRect()
    const groupTop = groupRect.top - fixedOffset // 获取分组标题相对于容器顶部的偏移量

    if (groupTop <= 0 && groupTop + groupRect.height > 0) {
      // 分组标题进入视口
      // 在这里触发逻辑以固定标题
      fixedTitle.value = group.innerText
      fixedTitle.value = fixedTitle.value[0]
    }
  }
}
</script>

<style scoped>
.fixed-title {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  height: 25px;
}
</style>
