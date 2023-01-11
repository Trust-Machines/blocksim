<script lang="ts">
import type { BlockType } from "$lib/models/Block";
import { createEventDispatcher } from "svelte";
import { BlockState } from '../models/Block'

const dispatch = createEventDispatcher();

export let block:BlockType;

const doUpdateState = (opcode:string) => {
  dispatch("doUpdateState", { opcode, block });
}

const allowedTransitions = () => {
  let states = [ { action: 'freeze', label: 'Freeze Node' }, { action: 'thaw', label: 'Thaw Node' }, { action: 'conceal', label: 'Conceal Node' }, { action: 'disclose', label: 'Disclose Node' } ];
  if (block.frozen) {
    states = states.splice(1, 2);
  } else if (!block.frozen) {
    states = [ { action: 'freeze', label: 'Freeze Node' }, { action: 'conceal', label: 'Conceal Node' } ];
  } else if (block.concealed) {
    states = [ { action: 'disclose', label: 'Disclose Node' } ];
  } else if (!block.concealed) {
    states = [ { action: 'conceal', label: 'Conceal Node' } ];
  }
  return states;
}

</script>

<div class="card text-white m-2 px-4 py-2">
  {#if block}
  <ul>
    <li class="dropdown" >
      <a class="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Block {block.id} : {BlockState[block.state]}
      </a>
      <div class="dropdown-menu" aria-labelledby="navbarDropdown">
        {#each allowedTransitions() as transition}
        <a class="dropdown-item" href="/" on:click|preventDefault={() => doUpdateState(transition.action)}>{transition.label}</a>
        {/each}
      </div>
  </li>
</ul>
  {:else}
  <div><span class="block-mode">No block selected</span></div>
  {/if}
</div>

<style>
  a:hover {
    color: #fff!important;
  }
  .card {
    background-color: #BFBCE2 !important;
  }
  ul {
    margin: 1px !important;
    padding: 1px !important;
  }
  ul li::marker {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  content: "";
}
.dropdown-menu {
  top: 15px!important;
  left: -30px!important;
  border: 1pt solid #000!important;
}
.dropdown-menu {
    background-color: #BFBCE2;
    border: none;
    border-radius: 5px;
    font-size: 0.8rem;
    padding: 0 0px;
    margin-top: 15px;
    font-family: Gilroy-Light;
}
.dropdown-item {
    font-size: 0.95rem !important;
    color: #fff!important;
}
.dropdown-item:hover {
    color: #333!important;
}
</style>