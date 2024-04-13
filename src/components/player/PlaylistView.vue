<template>
  <div class="playlist">
    <div class="title">
      <div>播放列表</div>
      <div class="clear" @click="clear">清空</div>
    </div>
    <ul>
      <li v-for="(song, index) in playlist" :key="index" @click="selectSong(index)">
        {{ song }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useSongStore } from '@/stores/song.js'
import { computed } from 'vue'

const currentSong = useSongStore()
const playlist = computed(() => currentSong.songList)

const clear = () => {
  currentSong.songList = []
  currentSong.playingState = false
}

const selectSong = (index) => {
  currentSong.index = index
  currentSong.playingState = true
}
</script>

<style scoped>
.playlist {
  position: fixed;
  top: 305px;
  right: 0;
  bottom: 60px;
  width: 300px;
  background-color: #f4f4f4c7;
  z-index: 999;
  padding: 10px;
  overflow-y: auto;
  border-radius: 5px 0 0 0;
}

.title {
  display: flex;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  .clear {
    font-size: 16px;
    margin-top: 3px;
    margin-left: 160px;
  }
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 5px 0;
  background-color: rgb(223, 223, 223);
  border-radius: 5px;
  margin-bottom: 3px;
  padding-left: 5px;
  cursor: pointer;
  font-size: 16px;
}

.close-btn {
  margin-top: 20px;
  text-align: center;
  cursor: pointer;
  color: #333;
}
</style>
