<script lang="ts" setup>
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();

	const toggleMute = (event: MouseEvent) => {
		globalStore.muted = !globalStore.muted;
	};

  const showVolumePanel = ref(false);

  const handleMouseEnter = () => {
    if (showVolumePanel.value) return;
    showVolumePanel.value = true;
  };

  const handleMouseLeave = () => {
    setTimeout(()=>{
      showVolumePanel.value = false;
    }, 200)
  };
</script>

<template>
	<div class="volumeContainer"
      @mouseover="handleMouseEnter"
      @mouseleave="handleMouseLeave">
		<v-expand-x-transition>
			<v-card
      class="volumePanel"
      v-if="showVolumePanel && !globalStore.muted"
      variant="text"
      >
        <v-btn
        icon="mdi-theater"
        size="small"
        :color="userSettings.TheatreAudio ? 'deep-purple-darken-1' : 'grey-lighten-5'"
        :variant="userSettings.TheatreAudio ? 'flat' : 'plain'"
        @click="userSettings.TheatreAudio = !userSettings.TheatreAudio"
        class="mr-2"
        title="Theatre Mode Audio Enables Audio Only For Expanded Stream"
        >

        </v-btn>
        <v-slider
          v-model="userSettings.Volume"
          color="grey-lighten-5"
          max="1"
          min="0"
          step=".01"
          class="volumeSlider ml-4 mr-3"
        ></v-slider>
			</v-card>
		</v-expand-x-transition>
		<v-btn
			:icon="globalStore.muted ? 'mdi-volume-off' : 'mdi-volume-high'"
			variant="plain"
			color="grey-lighten-5"
			class="volumeBtn"
			@click="toggleMute"
		>
		</v-btn>
	</div>
</template>

<style scoped>
	.volumeContainer {
		display: flex;
	}
  .volumePanel {
    height: 50px;
    width: 300px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    overflow: visible;
    /* outline: 2px solid red; */
  }
  .volumeSlider {
    max-width: 150px;
  }
</style>
