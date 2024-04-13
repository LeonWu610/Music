<template>
  <transition name="mini">
    <div class="mini-player" v-show="!fullScreen">
      <div class="cd-wrapper">
        <div ref="cdRef" class="cd">
          <img ref="cdImageRef" :src="currentSong.pic" :class="cdCls" @click="showNormalPlayer" />
        </div>
      </div>
      <div class="control">
        <progress-circle :radius="32" :progress="progress">
          <svg-icon
            class="icon-mini"
            type="mdi"
            :path="playIcon"
            @click.stop="togglePlay"
          ></svg-icon>
        </progress-circle>
      </div>
      <div class="control">
        <svg-icon
          class="icon-playlist"
          type="mdi"
          :path="mdiPlaylistMusic"
          @click="showPlaylist"
        ></svg-icon>
      </div>
      <transition name="mini"> <playlist v-show="playlistRef"></playlist></transition>
    </div>
  </transition>
</template>

<script setup>
import { useSongStore } from '@/stores/song.js'
import { computed, ref } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlay, mdiPause, mdiPlaylistMusic } from '@mdi/js'
import useCd from './use-cd'
import ProgressCircle from './ProgressCircle.vue'
import Playlist from './PlaylistView.vue'

const playlistRef = ref(false)
const { progress, togglePlay } = defineProps({
  progress: Number,
  togglePlay: Function
})

const currentSong = computed(() => useSongStore())
const fullScreen = computed(() => currentSong.value.fullScreen)
const playingState = computed(() => currentSong.value.playingState)

const { cdCls, cdRef, cdImageRef } = useCd()

const playIcon = computed(() => {
  return playingState.value ? `${mdiPause}` : `${mdiPlay}`
})

function showNormalPlayer() {
  currentSong.value.fullScreen = true
}

function showPlaylist() {
  playlistRef.value = !playlistRef.value
}
</script>

<style lang="scss" scoped>
.mini-player {
  display: flex;
  align-items: center;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 180;
  width: 100%;
  height: 60px;
  background: white;
  .cd-wrapper {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    padding: 0 10px 0 20px;
    margin-right: 20px;
    .cd {
      width: 40px;
      height: 40px;
      img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        &.playing {
          animation: rotate 10s linear infinite;
        }
        &.pause {
          animation-play-state: paused;
        }
      }
    }
  }
  .control {
    flex: 0 0 30px;
    width: 30px;
    padding: 0 10px;
    color: rgb(50, 50, 50);
    .icon-playlist {
      position: absolute;
      top: 16px;
      right: 20px;
      width: 30px;
      height: 30px;
    }
    .icon-mini {
      position: absolute;
      left: 4px;
      top: 4px;
    }
  }
  .mini-enter-active,
  .mini-leave-active {
    transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
  }
  .mini-enter-from,
  .mini-leave-to {
    opacity: 0;
    transform: translate3d(0, 80%, 0);
  }
}
</style>
