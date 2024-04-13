<template>
  <div class="player">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.pic" />
        </div>
        <div class="top">
          <div class="back" @click="goBack()">返回</div>
          <h1 class="title">{{ currentSong.songList[currentSong.index] }}</h1>
          <h2 class="subtitle">{{ currentSong.singer }}</h2>
        </div>
        <div
          class="middle"
          @touchstart.prevent="onMiddleTouchStart"
          @touchmove.prevent="onMiddleTouchMove"
          @touchend.prevent="onMiddleTouchEnd"
        >
          <div class="middle-l" :style="middleLStyle">
            <div ref="cdWrapperRef" class="cd-wrapper">
              <div ref="cdRef" class="cd">
                <img ref="cdImageRef" class="image" :class="cdCls" :src="currentSong.pic" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricScrollRef" :style="middleRStyle">
            <div class="lyric-wrapper">
              <div v-if="currentLyric" ref="lyricListRef">
                <p
                  class="text"
                  :class="{ current: currentLineNum === index }"
                  v-for="(line, index) in currentLyric.lines"
                  :key="line.num"
                >
                  {{ line.txt }}
                </p>
              </div>
              <div class="pure-music" v-show="pureMusicLyric">
                <p>{{ pureMusicLyric }}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span class="dot" :class="{ active: currentShow === 'lyric' }"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ formatTime(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                ref="barRef"
                :progress="progress"
                @progress-changing="onProgressChanging"
                @progress-changed="onProgressChanged"
              ></progress-bar>
            </div>
            <span class="time time-r">{{ formatTime(duration) }}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <svg-icon type="mdi" :path="playModeIcon" @click="changePlayMode"></svg-icon>
            </div>
            <div class="icon i-left">
              <svg-icon type="mdi" :path="mdiSkipPreviousOutline" @click="prev"></svg-icon>
            </div>
            <div class="icon i-center">
              <svg-icon type="mdi" :path="playIcon" @click="togglePlay"></svg-icon>
            </div>
            <div class="icon i-right">
              <svg-icon type="mdi" :path="mdiSkipNextOutline" @click="next"></svg-icon>
            </div>
            <div class="icon i-right">
              <svg-icon type="mdi" :path="favoriteIcon" @click="toggleFavorite"></svg-icon>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <mini-player v-show="showMini" :progress="progress" :toggle-play="togglePlay"></mini-player>
    <audio ref="audioRef"></audio>
  </div>
</template>

<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import ProgressBar from './ProgressBar.vue'
import {
  mdiPlay,
  mdiPause,
  mdiSkipNextOutline,
  mdiSkipPreviousOutline,
  mdiRepeat,
  mdiRepeatOnce,
  mdiShuffle,
  mdiHeart,
  mdiHeartOutline
} from '@mdi/js'
import { formatTime } from '@/assets/js/util'
import { useSongStore } from '@/stores/song.js'
import { watch } from 'vue'
import { ref } from 'vue'
import { computed } from 'vue'
import { onMounted } from 'vue'
import useCd from './use-cd'
import useLyric from './use-lyric'
import useMiddleInteractive from './use-middle-interactive'
import Scroll from '@/components/scroll/scroll.vue'
import useAnimation from './use-animation'
import MiniPlayer from './MiniPlayer.vue'

const audioRef = ref()
const currentTime = ref()
const duration = ref()
const progress = ref(0)
const playMode = computed(() => currentSong.value.playMode)
const isPlayLogicRegistered = ref(false)
const currentSong = computed(() => useSongStore())
const fullScreen = computed(() => currentSong.value.fullScreen)
const playingState = computed(() => currentSong.value.playingState)
const playIcon = computed(() => {
  return playingState.value ? `${mdiPause}` : `${mdiPlay}`
})
const playModeIcon = computed(() => {
  return playMode.value === 'order'
    ? mdiRepeat
    : playMode.value === 'loop'
      ? mdiRepeatOnce
      : mdiShuffle
})
const favoriteIcon = computed(() => (currentSong.value.favorite ? mdiHeart : mdiHeartOutline))
const { cdCls, cdRef, cdImageRef } = useCd()
const {
  currentShow,
  middleLStyle,
  middleRStyle,
  onMiddleTouchStart,
  onMiddleTouchMove,
  onMiddleTouchEnd
} = useMiddleInteractive()
const {
  currentLyric,
  currentLineNum,
  pureMusicLyric,
  playingLyric,
  lyricScrollRef,
  lyricListRef,
  playLyric,
  stopLyric
} = useLyric({
  currentTime
})
const { cdWrapperRef, enter, afterEnter, leave, afterLeave } = useAnimation()
const showMini = computed(() =>
  currentSong.value.songList.length > 0 && fullScreen.value === false ? true : false
)

onMounted(() => {
  if (!isPlayLogicRegistered.value) {
    watchPlayMode()
    isPlayLogicRegistered.value = true
  }
  if (audioRef.value) {
    // 当音频元数据加载完成时获取 currentTime 和 duration
    audioRef.value.addEventListener('loadedmetadata', () => {
      duration.value = audioRef.value.duration
      // 监听音频元素的 timeupdate 事件定时更新 currentTime
      audioRef.value.addEventListener('timeupdate', () => {
        currentTime.value = audioRef.value.currentTime
        progress.value = currentTime.value / duration.value
      })
    })
  }
})
// console.log(currentLyric)

const goBack = () => {
  currentSong.value.fullScreen = false
}

// 进度条相关逻辑
const onProgressChanging = (progress) => {
  currentTime.value = progress * duration.value
}
const onProgressChanged = (progress) => {
  audioRef.value.currentTime = duration.value * progress
  if (!playingState.value) {
    currentSong.value.playingState = true
  }
}

// 播放模式相关逻辑
const changePlayMode = () => {
  switch (playMode.value) {
    case 'order':
      currentSong.value.playMode = 'loop'
      break
    case 'loop':
      currentSong.value.playMode = 'shuffle'
      break
    case 'shuffle':
      currentSong.value.playMode = 'order'
      break
  }
  watchPlayMode()
}
const watchPlayMode = () => {
  const audioEl = audioRef.value
  audioEl.removeEventListener('ended', playOrder)
  audioEl.removeEventListener('ended', playLoop)
  audioEl.removeEventListener('ended', playShuffle)

  switch (playMode.value) {
    case 'order':
      audioEl.addEventListener('ended', playOrder)
      break
    case 'loop':
      audioEl.addEventListener('ended', playLoop)
      break
    case 'shuffle':
      audioEl.addEventListener('ended', playShuffle)
      break
  }
}

const playOrder = () => {
  if (currentSong.value.index === currentSong.value.songList.length - 1) {
    currentSong.value.index = 0
  } else {
    ++currentSong.value.index
  }
}
const playLoop = () => {
  const audioEl = audioRef.value
  audioEl.currentTime = 0
  audioEl.play()
}
const playShuffle = () => {
  const audioEl = audioRef.value
  const nextIndex = Math.floor(Math.random() * currentSong.value.songList.length)
  currentSong.value.index = nextIndex
  audioEl.src = currentSong.value.urlList[nextIndex]
}

const togglePlay = () => {
  currentSong.value.playingState = !currentSong.value.playingState
}

const prev = () => {
  if (currentSong.value.index === 0) {
    currentSong.value.index = currentSong.value.songList.length - 1
  } else {
    --currentSong.value.index
  }
}
const next = () => {
  if (currentSong.value.index === currentSong.value.songList.length - 1) {
    currentSong.value.index = 0
  } else {
    ++currentSong.value.index
  }
}
const toggleFavorite = () => {
  currentSong.value.favorite = !currentSong.value.favorite
}

watch(currentSong.value, () => {
  const audioEl = audioRef.value
  if (!playingState.value) {
    audioEl.pause()
    return
  }
  if (!audioEl.src) {
    audioEl.src = currentSong.value.urlList[currentSong.value.index]
  }
  watchPlayMode()
  audioEl.play()
  currentSong.value.playingState = true
})
watch(playingState, (newPlaying) => {
  const audioEl = audioRef.value
  if (newPlaying) {
    audioEl.play()
    playLyric()
  } else {
    audioEl.pause()
    stopLyric()
  }
})
</script>

<style lang="scss" scoped>
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 9999;
    background: black;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);

      img {
        width: 100%;
        height: 100%;
      }
    }
    .top {
      position: relative;
      margin-bottom: 25px;
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
        width: 70%;
        margin: 0 auto;
        margin-top: 8px;
        line-height: 25px;
        text-align: center;
        color: white;
        font-weight: 500;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        color: white;
        font-size: 13px;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 100px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            img {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
            .playing {
              animation: rotate 20s linear infinite;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            &.current {
              font-size: 15px;
            }
          }
          .pure-music {
            padding-top: 50%;
            line-height: 32px;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: rgba(255, 255, 255, 0.881);
      .dot-wrapper {
        left: 50%; /* 居中 */
        transform: translateX(-50%); /* 水平居中 */
        position: absolute;
        top: -25px;
        font-size: 0;
        .dot {
          background-color: rgba(255, 255, 255, 0.826);
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          &.active {
            width: 20px;
            border-radius: 5px;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;
        .time {
          flex: 0 0 40px;
          line-height: 30px;
          width: 40px;
          font-size: 15px;
          &.time-l {
            text-align: left;
            margin-right: 5px;
          }
          &.time-r {
            text-align: right;
            margin-left: 5px;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        margin-bottom: 3px;
        .icon {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-around;
        }
      }
    }
    &.normal-enter-active,
    &.normal-leave-active {
      transition: all 0.6s;
      .top,
      .bottom {
        transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
      }
    }
    &.normal-enter-from,
    &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }
}
</style>
