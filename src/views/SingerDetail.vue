<template>
  <div>
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
      <div class="container">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <div class="loading-text">加载中...</div>
        </div>
        <template v-else>
          <div
            v-for="(song, index) in songs"
            :key="song.id"
            class="song-item"
            @click="handleSongClick(song, index)"
          >
            {{ song.name }}
          </div>
        </template>
      </div>
    </div>
    <PlayerView></PlayerView>
  </div>
</template>

<script setup>
import { fetchSongs } from '@/api/api'
import { useRoute, useRouter } from 'vue-router'
import { useSingerStore } from '@/stores/singer.js'
import { useSongStore } from '@/stores/song.js'
import { fetchLyric } from '@/api/api'
import { ref } from 'vue'
import { computed } from 'vue'
import { watchEffect } from 'vue'
import { onMounted } from 'vue'
import PlayerView from '@/components/player/PlayerView.vue'

const route = useRoute()
const router = useRouter()
const singer = useSingerStore()
const currentSong = useSongStore()
const picUrl = ref(singer.picUrl)
const name = ref(singer.name)
const songs = ref([])
const loading = ref(true)
const { id } = route.params

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
const goBack = () => {
  router.back()
}
const handleSongClick = async (song, index) => {
  currentSong.singer = name
  currentSong.id = song.id
  currentSong.pic = picUrl
  currentSong.index = index
  currentSong.fullScreen = true
  songs.value.forEach((song) => {
    currentSong.urlList.push(song.url)
  })
  songs.value.forEach((song) => {
    currentSong.songList.push(song.name)
  })
  currentSong.playingState = true
  await fetchLyric(currentSong).then((res) => {
    currentSong.lyric = res.data.lrc.lyric
  })
}

const randomPlayAll = () => {
  const randomIndex = Math.floor(Math.random() * songs.value.length)

  currentSong.singer = name
  currentSong.pic = picUrl
  currentSong.index = randomIndex
  currentSong.fullScreen = true
  currentSong.playMode = 'shuffle'

  currentSong.urlList = []
  currentSong.songList = []
  songs.value.forEach((song) => {
    currentSong.urlList.push(song.url)
    currentSong.songList.push(song.name)
  })
  currentSong.playingState = true
}

// 使用 watchEffect 监听 songs 的变化
watchEffect(() => {
  if (songs.value.length > 0) {
    loading.value = false
  }
})

// 在 onMounted 钩子中调用 fetchSongs
onMounted(async () => {
  await fetchSongs(id).then(async (songDetail) => {
    songs.value = songDetail
    setTimeout(() => {
      loading.value = false
    }, 4000)
  })
})
</script>

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
  .container {
    position: relative;
    background-color: #f0f0f0;
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      position: absolute;
      top: 300px;
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
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .song-item {
    padding: 10px;
    margin-bottom: 5px;
    background-color: #d4d4d4;
    border-radius: 5px;
    font-size: 18px;
    color: #000000;
    cursor: pointer;
  }

  .song-item:hover {
    background-color: #9d9d9d;
  }
}
</style>
