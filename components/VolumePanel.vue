<script lang="ts" setup>
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();

	const toggleMute = (event: MouseEvent) => {
		userSettings.Muted = !userSettings.Muted;
	};

  const showVolumePanel = ref(false);

  const handleMouseEnter = () => {
    if (showVolumePanel.value) return;
    showVolumePanel.value = true;
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      showVolumePanel.value = false;
    }, 200)
  };

  const muted = ref(false);
  onMounted(() => {
    if (userSettings.Muted) {
      muted.value = true;
    }
  });

  watch(() => userSettings.Muted, (newVal) => {
    muted.value = newVal;
  });
</script>

<template>
	<div class="volumeContainer"
      @mouseover="handleMouseEnter"
      @mouseleave="handleMouseLeave">
		<v-expand-x-transition>
			<v-card
      class="volumePanel pl-2"
      v-if="showVolumePanel && !userSettings.Muted"
      variant="flat"
      color="#121212"
      >
        <v-btn
        icon="mdi-theater"
        size="small"
        :color="userSettings.TheatreAudio ? 'deep-purple-darken-1' : 'grey-lighten-5'"
        :variant="userSettings.TheatreAudio ? 'flat' : 'plain'"
        @click="userSettings.TheatreAudio = !userSettings.TheatreAudio"
        class="mr-1 ml-1"
        title="Theatre Mode Audio Enables Audio Only For Expanded Stream"
        >

        </v-btn>
        <v-slider
          v-model="userSettings.Volume"
          color="grey-lighten-5"
          max="1"
          min="0"
          step=".01"
          class="volumeSlider pl-3 pr-3"
        ></v-slider>
			</v-card>
		</v-expand-x-transition>
		<v-btn
			:icon="muted ? 'mdi-volume-off' : 'mdi-volume-high'"
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
    transform: translateY(-5px);
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    overflow: visible;
    border-radius: 10px !important;
    /* outline: 2px solid red; */
  }
  .volumeSlider {
    width: 150px;
  }
</style>
