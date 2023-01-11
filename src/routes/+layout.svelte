<script lang="ts">
import "../app.scss";
import {tick, onMount} from 'svelte';
//import {bootstrap} from 'bootstrap';
export const prerender = false;
export const ssr = false;

let bootstrap: { Tooltip: new (arg0: any) => any; Dropdown: new (arg0: any) => any; };
let appInitialized:boolean = false;
onMount(async () => {
  try {
    // $network.setNetwork(import.meta.env.VITE_NETWORK);
    bootstrap = (await import('bootstrap'));
    await tick();
    setTimeout(function () {
      const tooltipTriggerList = window.document.querySelectorAll('[data-bs-toggle="tooltip"]');
      if (tooltipTriggerList) [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      const popoverTriggerList = window.document.querySelectorAll('[data-bs-toggle="dropdown"]');
      if (popoverTriggerList) [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Dropdown(popoverTriggerEl));
      appInitialized = true;
    }, 1000)
  } catch(error) {
        console.log(error);
  }
})
</script>
{#if appInitialized}
<slot></slot>
{/if}