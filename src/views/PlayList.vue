<script setup>
import { fetchRateDetail, fetchSongUrl, fetchLyric } from '@/api/api'
import { onMounted } from 'vue'
import { watchEffect } from 'vue'
import { computed } from 'vue'
import { useSongStore } from '@/stores/song.js'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PlayerView from '@/components/player/PlayerView.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const currentSong = useSongStore()
const loading = ref(true)
const songs = ref([])
const Urls = ref([])
const name = ref()
const picUrl = ref()

const goBack = () => {
  router.back()
}

const RESERVED_HEIGHT = 40
const imageHeight = ref(0)
const scrollY = ref(0)
const maxTranslateY = ref(0)
const bgImageStyle = computed(() => {
  const scrollYVal = scrollY.value
  let zIndex = 0
  let paddingTop = '70%'
  let height = 0
  let translateZ = 0

  if (scrollYVal > maxTranslateY.value) {
    zIndex = 10
    paddingTop = 0
    height = `${RESERVED_HEIGHT}px`
    translateZ = 1
  }

  let scale = 1
  if (scrollYVal < 0) {
    scale = 1 + Math.abs(scrollYVal / imageHeight.value)
  }

  return {
    zIndex,
    paddingTop,
    height,
    backgroundImage: `url(${picUrl.value})`,
    transform: `scale(${scale})translateZ(${translateZ}px)`
  }
})
const filterStyle = computed(() => {
  let blur = 0
  const scrollYVal = scrollY.value
  const imageHeightVal = imageHeight.value
  if (scrollYVal >= 0) {
    blur = Math.min(maxTranslateY.value / imageHeightVal, scrollYVal / imageHeightVal) * 20
  }
  return { backdropFilter: `blur(${blur}px)` }
})

const randomPlayAll = () => {
  const randomIndex = Math.floor(Math.random() * songs.value.length)

  currentSong.index = randomIndex
  currentSong.fullScreen = true
  currentSong.playMode = 'shuffle'

  currentSong.urlList = []
  currentSong.songList = []
  songs.value.forEach((song) => {
    currentSong.songList.push(song.al.name)
    song.ar.forEach((ar) => (currentSong.singer = ar.name))
    currentSong.pic = song.al.picUrl
  })
  Urls.value.forEach((url) => currentSong.urlList.push(url))
  currentSong.playingState = true
}

const handleSongClick = async (song, index) => {
  song.ar.forEach((ar) => (currentSong.singer = ar.name))
  currentSong.id = song.al.id
  currentSong.pic = song.al.picUrl
  currentSong.index = index
  currentSong.fullScreen = true
  Urls.value.forEach((url) => currentSong.urlList.push(url))
  songs.value.forEach((song) => {
    currentSong.songList.push(song.name)
  })
  currentSong.playingState = true
  await fetchLyric(currentSong).then((res) => {
    currentSong.lyric = res.data.lrc.lyric
  })
}

watchEffect(() => {
  if (songs.value.length > 0) {
    loading.value = false
  }
})

onMounted(async () => {
  await fetchRateDetail(id).then((res) => {
    songs.value = res.data.playlist.tracks
    name.value = res.data.playlist.name
    picUrl.value = res.data.playlist.coverImgUrl
    res.data.playlist.tracks.forEach((song) => {
      fetchSongUrl(song.id).then((res) => {
        Urls.value.push(res.data.data[0].url)
      })
    })
    setTimeout(() => {
      loading.value = false
    }, 4000)
  })
})
</script>

<template>
  <div>
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>
    <div class="music-list">
      <div class="back" @click="goBack">返回</div>
      <h1 class="title">{{ name }}</h1>
      <div class="bg-image" :style="bgImageStyle" ref="bgImage">
        <div class="play-btn-wrapper">
          <div class="play-btn" @click="randomPlayAll">
            <i class="icon-play"></i>
            <span class="text">随机播放全部</span>
          </div>
        </div>
        <div class="filter" :style="filterStyle"></div>
      </div>
      <div class="overflow-y-scroll" style="height: 700px; padding-bottom: 110px">
        <div>
          <div v-for="(song, i) in songs" :key="i" class="flex" @click="handleSongClick(song, i)">
            <div>
              <v-img
                class="rounded-lg mx-3 mb-5"
                width="50"
                height="50"
                lazy-src=""
                :src="song.al.picUrl"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </div>
            <div class="flex flex-col">
              <div class="text-xs mt-2 font-medium truncate">{{ song.al.name }}</div>
              <div class="flex">
                <div style="font-size: 11px" v-for="artist in song.ar" :key="artist">
                  {{ artist.name }}&nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PlayerView></PlayerView>
  </div>
</template>

<style lang="scss" scoped>
.music-list {
  position: relative;
  height: 100%;
  .back {
    position: fixed;
    top: 8px;
    left: 10px;
    padding: 1px 5px;
    z-index: 20;
    transform: translateZ(2px);
    font-size: 12px;
    border-radius: 5px;
    background-color: rgb(51, 49, 49);
    color: white;
  }
  .title {
    position: fixed;
    top: 0;
    left: 10%;
    width: 80%;
    z-index: 20;
    transform: translateZ(2px);
    text-align: center;
    line-height: 40px;
    font-size: 18px;
    color: white;
  }
  .bg-image {
    position: relative;
    width: 100%;
    transform-origin: top;
    background-size: cover;
    margin-bottom: 5px;
    .play-btn-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 10;
      width: 100%;
      .play-btn {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid white;
        border-radius: 100px;
        font-size: 0;
        color: white;
      }
      .icon-play {
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
        font-size: 15px;
      }
      .text {
        display: inline-block;
        vertical-align: middle;
        font-size: 15px;
      }
    }
    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }
}
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: absolute;
  top: 500px;
  left: 50%;
  transform: translate(-50%, -50%);

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: rgb(75, 75, 75);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 10px;
    font-size: 16px;
    color: #555;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
