<script lang="ts">
  import { onMount } from "svelte";
  import ThreeScene from "./three/ThreeScene";

  let scene: ThreeScene;
  let startGame = false;
  onMount(() => {
    scene = new ThreeScene();
  });

  function onClickHandle() {
    startGame = true;
    scene.startGame();
  }
</script>

<main>
  <div id="threeCanvas"></div>

  <div class="title">Rubik's Cube Game</div>

  {#if startGame == false}
    <div class="uiLayer">
      <button
        on:click={() => {
          onClickHandle();
        }}
        class="btn">StartGame</button
      >
    </div>
  {/if}
</main>

<style>
  .title {
    font-family: "Squada One", sans-serif;
    position: absolute;
    top: 10%;
    font-size: 40px;
    width: 100%;
    text-align: center;
    pointer-events: none;
  }
  .uiLayer {
    position: absolute;
    bottom: 10%;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 10;
    pointer-events: none;
  }

  button {
    pointer-events: auto;
  }

  main {
    width: 100dvw;
    height: 100dvh;
  }
  #threeCanvas {
    width: 100%;
    height: 100%;
  }
</style>
