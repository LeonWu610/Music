import { defineStore } from "pinia"
import { ref } from "vue"

export const useSongStore = defineStore('currentSong', () => {
  const songList = ref([])
  const singer = ref('')
  const urlList = ref([])
  const pic = ref('')
  const id = ref(0)
  const lyric = ref('')
  const favorite = ref(false)
  const playMode = ref('order')
  const index = ref(0)
  const fullScreen = ref(false)
  const playingState = ref(false)
  return { songList, singer, pic, id, lyric, fullScreen, urlList, playingState, index, playMode, favorite }
})