<script setup>
import { fetchBanner, fetchRecommends, fetchNewSong } from '@/api/api'
import { ref } from 'vue'
import { useSongStore } from '@/stores/song.js'
import { fetchLyric } from '@/api/api'
import { fetchSongUrl } from '@/api/api'
import ErrorView from '@/components/basic/ErrorView.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css/pagination'
import 'swiper/css'
import { useRouter } from 'vue-router'

const banners = ref()
const playlistInfo = ref()
const albumInfo = ref()
const currentSong = useSongStore()
const showAlert = ref(false)
const modules = [Pagination, Autoplay]
const router = useRouter()

const handlePlaylistClick = (id) => {
  router.push({ path: `/playlist/${id}` })
}

const closeError = () => {
  showAlert.value = !showAlert.value
}

const handleSongClick = async (album) => {
  console.log(album)
  await fetchSongUrl(album.id).then((res) => {
    if (res.data.data[0].url === null) {
      showAlert.value = true
    } else {
      currentSong.urlList.push(res.data.data[0].url)
      currentSong.fullScreen = true
      currentSong.playingState = true
    }
  })
  album.artists.forEach((artist) => {
    currentSong.singer = artist.name + ',' + currentSong.singer
  })
  currentSong.songList.push(album.name)
  currentSong.pic = album.picUrl
  await fetchLyric(currentSong).then((res) => {
    currentSong.lyric = res.data.lrc.lyric
    console.log(currentSong.lyric)
  })
}

fetchBanner().then((res) => {
  banners.value = res.data.banners
})
fetchRecommends().then((res) => {
  playlistInfo.value = res.data.playlists
})
fetchNewSong().then((res) => {
  albumInfo.value = res.data.albums
})
</script>

<template>
  <div>
    <swiper
      :pagination="{
        clickable: true,
        dynamicBullets: true
      }"
      :modules="modules"
      :loop="true"
      :autoplay="{
        delay: 2500,
        disableOnInteraction: false
      }"
      class="mx-3 rounded-lg"
    >
      <swiper-slide v-for="(slide, index) in banners" :key="index">
        <img :src="slide.imageUrl" />
      </swiper-slide>
    </swiper>

    <div>
      <div class="m-3 text-left text-amber-950 text-sm font-semibold">甄选歌单</div>
      <div class="overflow-x-scroll flex ml-3">
        <div
          class="flex flex-col"
          v-for="(playlist, index) in playlistInfo"
          :key="index"
          @click="handlePlaylistClick(playlist.id)"
        >
          <div class="mr-5">
            <v-img
              class="rounded-lg"
              width="90"
              height="90"
              lazy-src=""
              :src="playlist.coverImgUrl"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                </div>
              </template>
            </v-img>
          </div>
          <div class="w-20">
            <div class="text-xs mt-2 font-medium truncate">
              {{ playlist.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <error-view :showAlert="showAlert" :closeError="closeError"></error-view>

    <div>
      <div class="m-3 text-left text-amber-950 text-sm font-semibold">新歌新碟</div>
      <div class="overflow-y-scroll" style="height: 504px; padding-bottom: 110px">
        <div>
          <div
            v-for="(album, i) in albumInfo"
            :key="i"
            class="flex"
            @click="handleSongClick(album)"
          >
            <div>
              <v-img
                class="rounded-lg mx-3 mb-5"
                width="50"
                height="50"
                lazy-src=""
                :src="album.picUrl"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </div>
            <div class="flex flex-col">
              <div class="text-xs mt-2 font-medium truncate">{{ album.name }}</div>
              <div class="flex">
                <div style="font-size: 11px" v-for="artist in album.artists" :key="artist">
                  {{ artist.name }}&nbsp;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.swiper {
  width: 100%;
  height: 152px;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;

  /* Center slide text vertically */
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>