<script lang="ts" setup>
import { useTheme } from 'vuetify'
import QrcodeVue, { type Level, type RenderAs } from 'qrcode.vue'
import { useMouse } from '@vueuse/core'
// import { VueDraggableNext } from 'vue-draggable-next'
import draggable from 'vuedraggable'

const theme = useTheme()
function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const items = [
  { title: 'Click Me' },
  { title: 'Click Me' },
  { title: 'Click Me' },
  { title: 'Click Me 2' },
]

const octoStore = useOctoStore(); // Using the store

const listExpand = ref<boolean>(false)
type ActionType = NonNullable<'toggle' | 'open' | 'close'>
const handleFavsMenu = (action: ActionType) => {
  if (action === 'toggle') {
    listExpand.value = !listExpand.value
    return
  }

  if (action === 'open') {
    listExpand.value = true
    return
  }

  if (action === 'close') {
    listExpand.value = false
    return
  }
}

const isIdle = ref(false)
let idleTimer: NodeJS.Timeout | null = null
let isBtnsBoxHovered = false
const IDLE_DURATION = 3000
const handleMouseMove = () => {
  if (isIdle.value && !isBtnsBoxHovered) {
    isIdle.value = false
    resetIdleTimer()
  }
}
const handleMouseEnter = () => {
  isBtnsBoxHovered = true
}
const handleMouseLeave = () => {
  isBtnsBoxHovered = false
  isIdle.value = true
}
const resetIdleTimer = () => {
  if (idleTimer) {
    clearTimeout(idleTimer)
  }
  idleTimer = setTimeout(() => {
    if (!isBtnsBoxHovered) {
      isIdle.value = true
    }
  }, IDLE_DURATION) // Idle duration in milliseconds (adjust as needed)
}
const handleMainClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // Check if the click occurred outside the octo-ui element
  if (!target.closest('.octo-ui')) {
    isIdle.value = true
    listExpand.value = false
  }

  if (isMobile.value) {
    isIdle.value = !isIdle.value
  }
}

const isMobile = ref(false)
const updateIsMobile = (event: MediaQueryListEvent) => {
  isMobile.value = event.matches
}

const editMode = ref(false)

const toggleEditMode = () => {
  editMode.value = !editMode.value
}

const removeShareItem = (item: string, event: MouseEvent) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  octoStore.removeMatchingStringFromOctoData(item)
  activeStreamers.value = activeStreamers.value.filter((streamer) => streamer !== item)
  inactiveStreamers.value = inactiveStreamers.value.filter((streamer) => streamer !== item)
}

const loading = ref(true)
const shareLoading = ref(false)
const startSearch = () => {
  console.log('start search')
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

const embedsListStore = useEmbedsListStore()

const addEmbed = (streamer: string) => {
  if (embedsListStore.embedsList.includes(streamer)) return
  embedsListStore.addEmbed(streamer)
}

const removeEmbed = (streamer: string) => {
  console.log(embedsListStore.embedsList)

  embedsListStore.removeEmbed(streamer)

  console.log(embedsListStore.embedsList)
}

const errorMsg = ref<string>("")
const isError = ref<boolean>(false)

const activeStreamers = ref<string[]>([])
const inactiveStreamers = ref<string[]>(octoStore.octoData)

const addAllStreams = () => {
  activeStreamers.value.forEach((streamer) => {
    embedsListStore.addEmbed(streamer)
  })
}

const checkStreamerStatus = async (streamer: string[] = octoStore.octoData) => {
  if (octoStore.octoData.length === 0) return
  try {
    loading.value = true
    // throw new Error("Test error")
    const response = await $fetch(`/api/twitch-streamer-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { streamer_list: JSON.stringify(streamer) },
    })
    // Check if the response is valid
    if (!response) {
      console.log("No data received")
      isError.value = true
      errorMsg.value = "Something went wrong with the request"
      return
    }

    // Check if the response is valid data
    if (!('data' in response) || typeof response.data !== 'object') {
      console.log("Invalid data format")
      isError.value = true
      errorMsg.value = "Invalid data format. Please contact the developer. (Error code: 81)"
      return
    }

    // Check if the response is an error
    if ('error' in response) {
      console.log("Invalid data format")
      isError.value = true
      errorMsg.value = "Invalid data format. Please contact the developer. (Error code: 81)"
      return
    }

    const { offline, online } = response.data as { offline: string[]; online: OnlineData[] };

    console.log(offline, online)

    let onlineNames = []
    for (let i = 0; i < online.length; i++) {
      onlineNames.push(online[i].user_name)
    }

    activeStreamers.value = onlineNames
    inactiveStreamers.value = offline
    loading.value = false

    // console.log(onlineNames);
  } catch (error) {
    // Handle any unexpected errors here
    console.error('An unexpected error occurred:', error)
    errorMsg.value = "There was an issue getting streamer status, Please contact the developer. (Error code: 47)"
    isError.value = true
    loading.value = false
  }
}
interface OnlineData {
  user_name: string,
  viewer_count: number,
}


const QRvalue = ref('')
const level = ref<Level>('M')
const renderAs = ref<RenderAs>('canvas')
const showShare = ref(false)

const isSuccess = ref(false)
const successMsg = ref("")
const url = ref("")

const shareList = async () => {
  shareLoading.value = true

  try {
    const response = await $fetch(`/api/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { shared_data: JSON.stringify(octoStore.octoData) },
    })
    console.log(response)

    if (!response) {
      console.log("No data received")
      isError.value = true
      shareLoading.value = false
      errorMsg.value = "Something went wrong with the request"
      return
    }

    if ('error' in response && response.error) {
      console.log("Invalid data format")
      isError.value = true
      shareLoading.value = false
      errorMsg.value = "Invalid data format. Please contact the developer. (Error code: 81)"
      return
    }

    const data = response.data;
    const shared_link = data && data[0] ? data[0].shared_link : null;
    url.value = `${window.location.href}share/${shared_link}`
    console.log(url)

    QRvalue.value = url.value

    shareLoading.value = false
    loading.value = false
    showShare.value = true


    navigator.clipboard.writeText(url.value).then(function () {
      /* clipboard successfully set */
      isSuccess.value = true
      successMsg.value = "Link copied to clipboard!"
    }, function () {
      /* clipboard write failed */
      errorMsg.value = `Failed to copy link to clipboard: ${url.value}`
      isError.value = true
    });

  } catch (error) {
    // Handle any unexpected errors here
    console.error('An unexpected error occurred:', error)
    errorMsg.value = "There was an issue sharing your list, Please contact the developer. (Error code: 47)"
    isError.value = true
    shareLoading.value = false
    loading.value = false
  }

}

const copySharedLink = () => {
  navigator.clipboard.writeText(url.value).then(function () {
    /* clipboard successfully set */
    isSuccess.value = true
    successMsg.value = "Link copied to clipboard!"
  }, function () {
    /* clipboard write failed */
    errorMsg.value = `Failed to copy link to clipboard: ${url.value}`
    isError.value = true
  });
}

const searchedStreamer = ref('')

const addNewStreamer = async () => {
  if (!searchedStreamer.value) {
    return
  }
  loading.value = true

  searchedStreamer.value = searchedStreamer.value.trim()

  // check if streamer is in list with any casing
  const streamer = octoStore.octoData.find((streamer) => streamer.toLowerCase() === searchedStreamer.value.toLowerCase())
  if (streamer) {
    isError.value = true
    errorMsg.value = "Streamer already in list"
    loading.value = false
    return
  }

  try {
    const response = await $fetch(`/api/streamer-exist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { streamerName: searchedStreamer.value },
    })
    console.log(response)
    // Check if the response is valid
    if (!response) {
      console.log("No data received")
      isError.value = true
      loading.value = false
      errorMsg.value = "Something went wrong please try again"
      return
    }

    const data: string | boolean = response.data;
    console.log(data)

    const streamerExist = data
    if (!streamerExist || typeof streamerExist !== 'string') {
      console.log("Streamer does not exist")
      isError.value = true
      loading.value = false
      errorMsg.value = "Streamer does not exist"
      return
    }

    console.log("Streamer exist, adding to list")
    octoStore.addStringToOctoData(streamerExist)
    checkStreamerStatus()
    searchedStreamer.value = ""

  }
  catch (error) {
    // Handle any unexpected errors here
    console.error('An unexpected error occurred:', error)
    errorMsg.value = "There was an issue adding the streamer, Please contact the developer. (Error code: 47)"
    isError.value = true
    loading.value = false
    return
  }

  setTimeout(() => {
    loading.value = false
  }, 2000)
}

onMounted(() => {
  resetIdleTimer()
  const mediaQuery = window.matchMedia('(pointer: coarse)')
  // Check if the media query matches (common for touch-based devices)
  isMobile.value = mediaQuery.matches

  // Additionally, you can listen for changes in the media query (if supported by the browser)
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', updateIsMobile)
  }
  checkStreamerStatus()

  setTimeout(() => {
    loading.value = false
  }, 2000)


  const updateTimer = setInterval(() => {
    checkStreamerStatus()
  }, 300000) // 5 minutes in milliseconds

})




onUnmounted(() => {
  if (idleTimer) {
    clearTimeout(idleTimer)
  }

  const mediaQuery = window.matchMedia('(pointer: coarse)')
  if (mediaQuery.removeEventListener) {
    mediaQuery.removeEventListener('change', updateIsMobile)
  }
})

const list = embedsListStore.embedsList.map((name, index) => {
  return { name, order: index + 1 };
})

const drag = ref(false)

const dragOptions = computed(() => ({
  animation: 200,
  group: "description",
  disabled: false,
  ghostClass: "ghost"
}));
</script>

<template>
  <main @mousemove="handleMouseMove" @mouseleave="handleMouseLeave" @mouseup="handleMainClick">
    <div class="octo-ui" :class="{ 'hidden': isIdle, 'show': listExpand, 'edit-mode': editMode }"
      @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <!-- <div class="qrcode-container" v-if="QRvalue"> -->
      <v-expand-transition>
        <v-card v-if="listExpand && url" variant="elevated" class="share-card">
          <v-row class="d-flex justify-space-between align-center ma-0">
            <v-col cols="5" class="pa-5">
              <qrcode-vue class="qrcode" :value="QRvalue" :level="level" :render-as="renderAs" />
            </v-col>
            <v-col cols="7" class="pa-5 pl-0">
              <v-text-field :value="url" variant="solo-filled" append-inner-icon="mdi-content-copy"
                @click:append-inner="copySharedLink" @keydown.enter="copySharedLink" hide-details
                class="copy-url"></v-text-field>
            </v-col>
            <!-- <div class="copy-url">
            <a :href=url>{{ url !== "" ? url : 'Shared URL' }}</a>
            <v-btn icon="mdi-content-copy" variant="flat" color="grey-darken-3" @click="copySharedLink"></v-btn>
          </div> -->
          </v-row>
        </v-card>
      </v-expand-transition>
      <v-expand-transition>
        <v-card v-if="listExpand" variant="elevated" class="favs-menu mx-auto" :loading="loading">
          <v-row no-gutters class="align-center">
            <v-col cols="12" class="pa-5">
              <v-text-field label="Search" variant="solo-filled" append-inner-icon="mdi-magnify"
                @click:append-inner="addNewStreamer" @keydown.enter="addNewStreamer" v-model="searchedStreamer"
                hide-details></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters class="pl-5 pr-5 pb-5">
            <v-col cols="12" v-if="octoStore.octoData.length !== 0"
              style="display: flex; justify-content: space-between;">
              <v-btn prepend-icon="mdi-pencil" variant="flat" color="grey-darken-3" @click="toggleEditMode"
                class="edit-btn">
                edit
              </v-btn>

              <v-tooltip v-model="showShare" location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn prepend-icon="mdi-share" variant="flat" color="grey-darken-3" @click="shareList"
                    :loading="shareLoading" v-if="octoStore.octoData.length !== 0" v-bind="props">
                    share
                  </v-btn>
                </template>
                <span>Share</span>
              </v-tooltip>

              <v-btn prepend-icon="mdi-plus" variant="flat" color="grey-darken-3" @click="addAllStreams">
                Add all
              </v-btn>
            </v-col>
          </v-row>
          <v-row no-gutters class="pl-5 pr-5 favs-list-container">
            <v-col cols="12">
              <v-list>
                <h4 v-if="activeStreamers.length >= 1">Streaming</h4>
                <v-list-item v-for="(actStreamer, index) in activeStreamers" :key="index" @click="addEmbed(actStreamer)">
                  <v-btn class="deletebtn" :class="{ 'deletebtn-hide': !editMode }" variant="plain" icon="mdi-delete"
                    color="red-accent-2" @click="(event: MouseEvent) => removeShareItem(actStreamer, event)"
                    v-auto-animate>
                  </v-btn>
                  {{ actStreamer }}
                </v-list-item>
                <v-divider class="ma-5" v-if="activeStreamers.length >= 1"></v-divider>
                <h4 v-if="inactiveStreamers.length >= 1">Not Streaming</h4>
                <v-list-item v-for="(nonActStreamer, index) in inactiveStreamers" :key="index">
                  <v-btn class="deletebtn" :class="{ 'deletebtn-hide': !editMode }" variant="plain" icon="mdi-delete"
                    color="red-accent-2" @click="(event: MouseEvent) => removeShareItem(nonActStreamer, event)"
                    v-auto-animate>
                  </v-btn>
                  {{ nonActStreamer }}
                </v-list-item>
                <div v-if="octoStore.octoData.length === 0" class="mt-3" style="display: block;">
                  <h2>Your list is empty :(</h2>
                  <br>
                  <span>You can add streamers by searching for them</span>
                </div>
              </v-list>
            </v-col>
          </v-row>
        </v-card>
      </v-expand-transition>

      <div class="btns-box">
        <v-btn icon="mdi-menu" variant="elevated" color="deep-purple-darken-1" @click="handleFavsMenu('toggle')">
        </v-btn>
      </div>
    </div>
    <div class="embeds-container">
      <!-- <div class="embed-twitch-item" v-for="(streamer) in embedsListStore.embedsList" :key="streamer">
        <EmbedTwitch :creator="streamer" />
        <v-btn icon="mdi-close" @click="removeEmbed(streamer)" class="close-btn" color="deep-purple-darken-1"></v-btn>
        <span class="stream-title">{{ streamer }}</span>
      </div> -->
    </div>
    <draggable v-model="embedsListStore.embedsList" item-key="id" class="embeds-container" drag-class="drag"
      ghost-class="ghost">
      <template #item="{ element }">
        <keep-alive>
          <div class="embed-twitch-item">
            <EmbedTwitch :creator="element" :key="element" />
            <v-btn icon="mdi-close" @click="removeEmbed(element)" class="close-btn" color="deep-purple-darken-1"></v-btn>
            <span class="stream-title">{{ element }}</span>
          </div>
        </keep-alive>
      </template>
    </draggable>
  </main>

  <v-snackbar :timeout="3000" color="yellow-darken-3" variant="tonal" v-model="isError" rounded="pill">
    <span class="pr-md-5">{{ errorMsg }}</span>
    <v-btn color="yellow-lighten-3" variant="text" @click="isError = false">
      Close
    </v-btn>
  </v-snackbar>

  <v-snackbar :timeout="3000" color="green-darken-2" variant="tonal" v-model="isSuccess" rounded="pill">
    <span class="pr-md-5">{{ successMsg }}</span>
    <v-btn color="green-accent-4" variant="text" @click="isSuccess = false">
      Close
    </v-btn>
  </v-snackbar>
</template>

<style scoped>
main {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* justify-content: center; */
  padding: 20px 5px;
  /* position: relative; */
  /* height: 100vh; */
}

.octo-ui {
  position: fixed;
  bottom: 20px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 20px;
  z-index: 1000;
  /* outline: 2px solid red; */
  transform-origin: bottom right;
  transition: all 0.3s ease-in-out;
}

.hidden {
  opacity: 0;
  /* Hide the UI by setting opacity to 0 */
  pointer-events: none;
  /* Disable pointer events on hidden UI */
}

.show {
  opacity: 1;
  pointer-events: auto;
}

.btns-box {
  display: flex;
  gap: 10px;
}

.favs-menu {
  width: 400px;
  height: 400px;
  /* height: clamp(200px, 40vh, 400px); */
}

.deletebtn {
  height: 25px !important;
  width: 25px !important;
  margin-right: 10px !important;
  transition: all 0.2s ease-in-out;
}

.deletebtn-hide {
  opacity: 0;
  width: 0px !important;
  margin-right: 0px !important;
  pointer-events: none;
  /* outline: 2px solid red; */
}

.favs-list-container {
  height: 61%;
  overflow-y: auto;
  /* outline: 2px solid red; */
}

.share-card {
  width: 400px;
}

.qrcode {
  width: 100% !important;
  height: 100% !important;
  aspect-ratio: 1 / 1 !important;
  /* border: 2px solid red; */
}

.copy-url {
  /* border: 2px solid blue; */
  width: 100%;
}


.embeds-container {
  width: 100%;
  display: grid;

  padding: 20px;
  grid-template-columns: repeat(auto-fill, minmax(33vw, 1fr));
  gap: 10px;

}

.embed-twitch-item {
  margin: 0 auto;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 7px;
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease-in-out;
  /* border: 2px solid orange; */
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0;
  transform: translate(100%, -100%) scale(0.5);
}

.embed-twitch-item:hover .close-btn {
  opacity: 1;
  transform: translate(0, 0) scale(0.7);
  transition: all 0.2s ease-in-out;
}

.close-btn:hover {
  filter: hue-rotate(80deg);
}

.stream-title {
  position: absolute;
  top: 10px;
  right: 80px;
  border-radius: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 20px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 1px 1px 2px black;
  backdrop-filter: blur(5px);
  opacity: 0;
  user-select: none;
  cursor: grab;
  transition: all 0.2s ease-in-out;
  /* border: 2px solid red; */
}

.embed-twitch-item:hover .stream-title {
  opacity: 1;
}

.drag div {
  /* transform: rotate(5deg); */
  /* border: 5px solid rgb(55, 0, 255); */
  /* box-shadow: 0 0 10px 5px rgb(55, 0, 255); */
  border-radius: 20px;
  background-color: darkgray;
}

.ghost {
  opacity: 0.5;
  border: 5px solid orange;
}



/* Responsive adjustments */
@media (max-width: 1280px) {
  .embeds-container {
    grid-template-columns: 1fr;
  }
}
</style>
