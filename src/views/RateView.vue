<script setup>
import Scroll from '@/components/scroll/scroll.vue'
import { fetchRateList } from '@/api/api'
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const topList = ref()
const router = useRouter()

const handleClick = (id) => {
  router.push({ path: `/rate/${id}` })
}

fetchRateList().then((res) => {
  topList.value = res.data.list
})
</script>

<template>
  <div class="top-list">
    <scroll class="top-list-content">
      <ul>
        <li class="item" v-for="item in topList" :key="item.id" @click="handleClick(item.id)">
          <div class="img">
            <v-img class="rounded-lg mb-5" width="90" height="90" :src="item.coverImgUrl">
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                </div>
              </template>
            </v-img>
          </div>
          <div class="info">
            <div class="text-s my-2 font-medium truncate">{{ item.description }}</div>
            <div class="flex text-xs">{{ item.updateFrequency }}</div>
          </div>
        </li>
      </ul>
    </scroll>
  </div>
</template>

<style lang="scss" scoped>
.top-list {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .top-list-content {
    height: 100%;
    overflow: hidden;
    .item {
      display: flex;
      flex-direction: row;
      margin: 0 10px;
      padding-top: 20px;
      height: 100px;
      &:last-child {
        padding-bottom: 20px;
      }
      .img {
        width: 90px;
        margin-right: 5px;
      }
      .info {
        display: flex;
        flex-direction: column;
        width: 300px;
        .description {
          font-size: 18px;
        }
        .update {
          font-size: 15px;
        }
      }
    }
  }
}
</style>
