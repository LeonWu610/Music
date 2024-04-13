<template>
  <div class="search">
    <div class="search-input-wrapper">
      <div class="search-input">
        <svg-icon
          type="mdi"
          :path="mdiMagnify"
          class="icon-search"
          @click="search(searchText)"
        ></svg-icon>
        <input class="input-inner" v-model="searchText" placeholder="搜索歌曲、歌手" />
        <svg-icon
          v-show="songs.length > 0"
          type="mdi"
          :path="mdiClose"
          class="icon-dismiss"
          @click="clear"
        ></svg-icon>
      </div>
    </div>
    <scroll ref="scrollRef" class="search-content" v-show="!show">
      <div>
        <div class="hot-keys">
          <h1 class="title">热门搜索</h1>
          <ul>
            <li class="item" v-for="item in hotKeys" :key="item" @click="search(item.first)">
              <span>{{ item.first }}</span>
            </li>
          </ul>
        </div>
        <div class="search-history" v-show="searchHistory?.length">
          <div class="title">
            <span>搜索历史</span>
            <svg-icon type="mdi" :path="mdiClose" class="clear" @click="clearHistory"></svg-icon>
          </div>
          <div v-for="txt in searchHistory" :key="txt" class="text">
            <span>{{ txt }}</span>
          </div>
        </div>
      </div>
    </scroll>
    <div class="search-result" v-show="songs.length > 0 && show">
      <div
        v-for="(song, index) in songs"
        :key="song.id"
        class="song-item"
        @click="handleSongClick(song, index)"
      >
        {{ song.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import Scroll from '@/components/scroll/scroll.vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiMagnify, mdiClose } from '@mdi/js'
import { ref, computed } from 'vue'
import { fetchHotKeys, fetchSearchResult, fetchSongUrl, fetchLyric } from '@/api/api'
import { useSearchStore } from '@/stores/search'
import { useSongStore } from '@/stores/song.js'

const hotKeys = ref([])
const songs = ref([])
const Urls = ref([])
const searchText = ref()
const show = ref(false)
const scrollRef = ref(null)

const searchStore = useSearchStore()
const currentSong = useSongStore()
const searchHistory = computed(() => searchStore.searchHistory)

fetchHotKeys().then((res) => {
  hotKeys.value = res.data.result.hots
})

const clear = () => {
  searchText.value = ''
  show.value = false
}

const search = async (key) => {
  await fetchSearchResult(key).then((res) => {
    console.log(res)
    songs.value = res.data.result.songs
    res.data.result.songs.forEach((song) => {
      fetchSongUrl(song.id).then((res) => {
        Urls.value.push(res.data.data[0].url)
      })
    })
  })
  show.value = true
  searchStore.searchHistory.push(key)
}

const handleSongClick = async (song, index) => {
  currentSong.id = song.id
  currentSong.pic = song.artists[0].img1v1Url
  currentSong.index = index
  currentSong.fullScreen = true
  currentSong.playingState = true
  songs.value.forEach((song) => {
    currentSong.songList.push(song.name)
  })
  song.artists.forEach((ar) => {
    currentSong.singer += ar.name
  })
  Urls.value.forEach((url) => currentSong.urlList.push(url))
  await fetchLyric(currentSong).then((res) => {
    currentSong.lyric = res.data.lrc.lyric
  })
}

const clearHistory = () => {
  searchStore.searchHistory = []
}
</script>

<style lang="scss" scoped>
.search {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  .search-input-wrapper {
    margin: 20px;
    .search-input {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      padding: 0 6px;
      height: 38px;
      background: rgb(250, 250, 250);
      border-radius: 6px;
      .icon-search {
        font-size: 24px;
        color: rgb(71, 71, 71);
      }
      .input-inner {
        flex: 1;
        margin: 0 5px;
        line-height: 18px;
        background: rgb(250, 250, 250);
        font-size: 16px;
        outline: 0;
        &::placeholder {
          color: rgb(91, 91, 91);
        }
      }
      .icon-dismiss {
        font-size: 16px;
        color: gray;
      }
    }
  }
  .search-content {
    flex: 1;
    overflow: hidden;
    .hot-keys {
      margin: 0 20px 20px 20px;
      .title {
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: 500;
      }
      .item {
        display: inline-block;
        padding: 5px 10px;
        margin: 0 10px 10px 0;
        border-radius: 6px;
        color: #1c1c1c;
        background: rgba(165, 227, 248, 0.3);
        font-size: 15px;
      }
    }
    .search-history {
      position: relative;
      margin: 0 20px;
      .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 10px;
        .clear {
          width: 18px;
          height: 18px;
        }
      }
      .text {
        font-size: 16px;
        border-radius: 6px;
        color: #1c1c1c;
        background: rgba(165, 227, 248, 0.3);
        padding: 2px 10px;
        margin-bottom: 5px;
      }
    }
  }
  .search-result {
    flex: 1;
    overflow-y: scroll;
    height: 850px;
    .song-item {
      padding: 5px;
      margin-bottom: 5px;
      background-color: #f2f2f2b1;
      border-radius: 5px;
      font-size: 15px;
      cursor: pointer;
    }

    .song-item:hover {
      background-color: #9d9d9d;
    }
  }
}
</style>
