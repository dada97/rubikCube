<script lang="ts">
  import { onMount } from "svelte";
  import ThreeScene from "./three/ThreeScene";
 
  let scene: ThreeScene;

  onMount(() => {
    scene = new ThreeScene();
  });
</script>

<main>
  <div id="threeCanvas"></div>
</main>

<style>
  main {
    width: 100dvw;
    height: 100dvh;
  }
  #threeCanvas {
    width: 100%;
    height: 100%;
  }
</style>
