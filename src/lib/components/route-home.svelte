<script lang="ts">
import { restoreSavedState, saveCurrentState, getBlocks, redoLastOperation, undoLastOperation, clearBlocks, freezeBlock, thawBlock, concealBlock, discloseBlock } from '../blocks';
import logo from '$lib/assets/logo.png';
import { getEvents } from '../events';
import Canvas from './canvas/Canvas.svelte';
import { ArrowUpRightCircleFill, ArrowsFullscreen, CloudDownloadFill, ZoomIn, Grid3x2GapFill, ArrowRepeat, ArrowUpLeftCircleFill, FileBarGraphFill } from "svelte-bootstrap-icons";
import { onDestroy } from 'svelte';
import type { BlockType } from "$lib/models/Block";
import { blockStore } from '$lib/stores.js';

let displayMode = 'both';
let displays = 2;
let componentKey1 = 0;
let componentKey2 = 0;
let errorMessage: string|undefined;
const startWidth = (window.innerWidth - 60) / displays;
const startHeight = window.innerHeight + 800;

let dimensions = {
    width: startWidth,
    height: startHeight
};

let blockSize:number = 80;
let blockDimensions = { width: 80, height: 80 };

/**
 * Event handler for canvas rendering
 * @param e
 */
const handleUpdateCanvas = (e: { detail: any; }) => {
  errorMessage = undefined;
  const data = e.detail;
  switch(data.opcode) {
    case 'downloadCanvas':
      downloadCanvas(data.canv);
      break;
    case 'resetLayout':
      resetLayout();
      break;
    case 'addBlock':
      errorMessage = undefined;
      componentKey2++;
      break;
    case 'toggleConcealed':
      registerNewState(data.block, 'toggleConcealed');
      break;
    case 'toggleFrozen':
      registerNewState(data.block, 'toggleFrozen');
      break;
    case 'stateChangeError':
      errorMessage = data.e
    default:
      //saveCurrentState();
  }
}

const registerNewState = (block:BlockType, action:string) => {
  try {
    errorMessage = undefined;
    if (action === 'toggleFrozen') {
      if (block.frozen) thawBlock(block.id);
      else freezeBlock(block.id);
    } else if (action === 'toggleConcealed') {
      if (block.concealed) discloseBlock(block.id);
      else concealBlock(block.id);
    }
    $blockStore = { opcode: 'newState', blockId: block.id };
    componentKey2++;
  } catch(err:any) {
    errorMessage = err;
  }
}

const updateBlockSize = (value:number) => {
  blockSize = value;
  //const scaleRatio = Math.min(dimensions.width/blockSize, dimensions.height/blockSize);
  blockDimensions = { width: (80 * blockSize) / 100, height: (80 * blockSize) / 100 };
  //dimensions = { width: dimensions.width * scaleRatio, height: dimensions.height * scaleRatio };
  componentKey1++;
}

const resetLayout = () => {
  //dimensions.width = dimensions.width * 1.5;
  errorMessage = undefined;
  dimensions.height = dimensions.height * 2;
  $blockStore = { opcode: 'resetLayout', blockId: 0 };
}

const redraw = () => {
  errorMessage = undefined;
  componentKey1++;
  componentKey2++;
}
window.redraw = redraw;

const redoLastBlock = () => {
  try {
    errorMessage = undefined;
    const blockId = redoLastOperation();
    $blockStore = { opcode: 'redo', blockId: blockId };
    componentKey2++;
  } catch(err:any) {
    errorMessage = err;
  }
}

const undoLastBlock = () => {
  try {
    errorMessage = undefined;
    const blockId = undoLastOperation();
    $blockStore = { opcode: 'undo', blockId: blockId };
    componentKey2++;
  } catch(err:any) {
    errorMessage = err;
  }
}

const updateDisplayMode = (value:string) => {
  errorMessage = undefined;
  displayMode = value;
  displays = 1;
  if (displayMode !== 'both') {
      displays = 2;
      dimensions = {
          width: (window.innerWidth - 60),
          height: (window.innerHeight - 200)
      }
  } else {
      dimensions.width = (window.innerWidth - 60) / 2;
  }
  componentKey1++;
  componentKey2++;
}

const restore = () => {
  errorMessage = undefined;
  dimensions = {
    width: startWidth,
    height: startHeight
  };
  restoreSavedState();
  $blockStore = { opcode: 'loadSavedState', blockId: 0 };
}

const restart = (opcode:string) => {
  if (opcode === 'reset') {
    errorMessage = undefined;
    dimensions = {
      width: startWidth,
      height: startHeight
    };
    clearBlocks();
    componentKey1++;
    componentKey2++;
  } else {
    restore();
  }
}

const download = (filename:string, data:any) => {
  // const canv = e.detail.canv;
  const link = document.createElement('a');
  link.download = filename;
  link.href = data;
  link.target = '_blank'
  link.click();
  //document.body.removeChild(link);
}
const downloadCanvas = (canv:any) => {
  let rawDataUrl = canv.toDataURL({
    format: 'png',
    quality: 0.8
  })
  download('Block Simulation.png', rawDataUrl);
}

const downloadJson = () => {
	// get zip file from endpoint
  let objJsonStr = "data:json," + JSON.stringify(getBlocks());
  //let objJsonB64 = base64.encode(utf8.encode(JSON.stringify(getBlocks())));
  //let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
  download('Block Simulation.json', objJsonStr);
}

onDestroy(() => saveCurrentState());

</script>
<nav class="navbar navbar-expand-lg navbar-light bg-light" style="width: 100%;">
  <div class="container">
    <a class="navbar-brand" href="/blocksim">
        <img width="50px" src={logo} alt="stacks ecosystem dao logo" />
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
  
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item active">
          <a title="Download json" class="nav-link" href="/" on:click|preventDefault={downloadJson}><CloudDownloadFill width={20} height={20}/></a>
        </li>
        <li class="nav-item">
          <a title="Undo last operation" class="nav-link" href="/" on:click|preventDefault={undoLastBlock}><ArrowUpLeftCircleFill width={20} height={20}/></a>
        </li>
        <li class="nav-item">
          <a title="Redo last operation" class="nav-link" href="/" on:click|preventDefault={redoLastBlock}><ArrowUpRightCircleFill width={20} height={20}/></a>
        </li>
        <!--
        <li class="nav-item">
          <a title="Reset layout" class="nav-link" href="/" on:click|preventDefault={resetLayout}><ArrowsFullscreen width={20} height={20}/></a>
        </li>
        -->
        <li class="nav-item dropdown">
          <a title="Change layout" class="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <ArrowRepeat width={20} height={20}/>
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <!-- <a class="dropdown-item" href="/" on:click|preventDefault={() => restart('restart')}>Load Saved State</a>-->
            <a class="dropdown-item" href="/" on:click|preventDefault={() => restart('reset')}>Reset to Genesis</a>
          </div>
        </li>
        <li class="nav-item dropdown">
          <a title="Change layout" class="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <Grid3x2GapFill width={20} height={20} />
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <a class="dropdown-item" href="/" on:click|preventDefault="{() => {updateDisplayMode('both') }}">Dual</a>
            <a class="dropdown-item" href="/" on:click|preventDefault="{() => {updateDisplayMode('stacks') }}">Stacks</a>
            <a class="dropdown-item" href="/" on:click|preventDefault="{() => {updateDisplayMode('bitcoin') }}">Bitcoin</a>
          </div>
        </li>
        <li class="nav-item dropdown">
            <a title="Zoom in/out" class="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <ZoomIn width={20} height={20} />
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="/" on:click|preventDefault="{() => {updateBlockSize(60) }}">60%</a>
              <a class="dropdown-item" href="/" on:click|preventDefault="{() => {updateBlockSize(80) }}">80%</a>
              <a class="dropdown-item" href="/" on:click|preventDefault="{() => {updateBlockSize(100) }}">100%</a>
              <a class="dropdown-item" href="/" on:click|preventDefault="{() => {updateBlockSize(120) }}">120%</a>
              <a class="dropdown-item" href="/" on:click|preventDefault="{() => {updateBlockSize(140) }}">140%</a>
            </div>
        </li>
    </ul>
    <!--
    <form class="form-inline my-2 my-lg-0">
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
      </form>
      -->
    </div>
  </div>
</nav>
<!--
<div class="mx-2 d-flex justify-content-around">
  <BlockMenu block={targetBlock} on:doUpdateState={handleUpdateCanvas}/>
</div>
-->
<div class="">

<div class="mx-2 d-flex justify-content-around text-danger" style="height: 30px;">
  {#if errorMessage}  {errorMessage} {/if}
</div>

{#key componentKey1}
<div id="frame" class="d-flex justify-content-start">
    {#if displayMode === 'both' || displayMode === 'stacks'}
    <div class="mx-2">
      <Canvas on:doUpdateCanvas={handleUpdateCanvas} blockMode={'stacks'} {dimensions} {blockDimensions}/>
    </div>
    {/if}
    {#if displayMode === 'both' || displayMode === 'bitcoin'}
    <div class="mx-2">
        <Canvas on:doUpdateCanvas={handleUpdateCanvas} blockMode={'bitcoin'} {dimensions} {blockDimensions}/>
    </div>
    {/if}
</div>
{/key}
<!--
{#key componentKey2}
<div class="row">
  <div class="col-6">
    <h2>Blocks</h2>
    {#each getBlocks() as block}
    <div>id: {block.id}, parent: {block.parentId}, level: {block.level}, coords: {block.coords.x + ', ' + block.coords.y}</div>
    {/each}
  </div>
  <div class="col-6">
    <h2>Events</h2>
    {#each getEvents() as event}
    <div>id: {event.blockId}, parent: {event.parentId}, from: { event.from }, to: { event.to }</div>
    {/each}
  </div>
</div>
{/key}
-->
</div>