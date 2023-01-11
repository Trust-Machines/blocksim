<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fabric } from "fabric";
  import { Download } from "svelte-bootstrap-icons";
  import { createEventDispatcher } from "svelte";
  import { mineBlock, getBlocks } from '$lib/blocks'
  import { isFamily, makeLines, addRect, addMenuItem, calculateBlockCoords } from '$lib/drawing'
  import type { DimensionsType } from "../../drawing";
  import type { BlockType } from "../../models/Block";
  import { blockStore } from '$lib/stores.js';

  const dispatch = createEventDispatcher();

  export let blockMode:string;
  export let blockDimensions:DimensionsType = { width: 100, height: 100 };
  export let dimensions = {
    width: (window.innerWidth - 60) / 2,
    height: (window.innerHeight + 800)
  };
  let canvas: HTMLCanvasElement;
  let canv: any;
  let moving = false;
  let userCoords: { blockId: number; coords: { x:number, y: number }; }[] = [];

  let localOp: { opcode:string, blockId:number };
  blockStore.subscribe((value: { opcode:string, blockId:number }) => localOp = value);

  $: {
    try {
      //if (!rendering()) {
        if (localOp.opcode === 'highlightTree') {
          //console.log('highlightTree: ' + $blockStore.blockId + ', ' + blockMode + ', $blockStore=', $blockStore);
          const block = getBlocks().find((o) => o.id === localOp.blockId);
          rerender(block);
        } else if (localOp.opcode === 'loadSavedState' || localOp.opcode === 'newState' || localOp.opcode === 'unhighlightTree' || localOp.opcode === 'addBlock') {
          rerender(null);
        } else if (localOp.opcode === 'resetLayout') {
          userCoords = [];
          rerender(null);
        } else if (localOp.opcode === 'undo' || localOp.opcode === 'redo') {
          canv.clear()
          rerender(null);
          canv.renderAll();
        }
      //}
    } catch(err) {
      console.log(err);
    }
	}
  const pallette = {
      background: '#E0E0E0',
      familyFill: '#c64ae8',
      readyFill: '#7d6bd6',
      readyStroke: '#98d9ed',
      frozenFill: '#98d9ed',
      frozenStroke: '#98d9ed',
      concealedFill: '#fff',
      concealedStroke: '#000',
      darkStroke: '#000',
      lightStroke: '#fff',
    }
    
    onDestroy(() => {
      if (canv) canv.dispose();
    })

    const rerender = function (block:BlockType|null) {
      //if (rendering()) return;
      try {
        canv.clear();
      } catch (err) {
        console.log('Err: ' + err + ' ' + block);
      }
      const blocks = getBlocks();
      calculateBlockCoords(userCoords, getBlocks(), blockMode, dimensions, blockDimensions);
      blocks.forEach((b) => {
        const coords = b.coords;
        let fill = pallette.readyFill;
        let stroke = pallette.darkStroke;
        //if (b.frozen && b.concealed) {
        //  fill = pallette.frozenFill;
        //  stroke = pallette.darkStroke;
        //}
        if (b.frozen) {
          fill = pallette.frozenFill;
          stroke = pallette.darkStroke;
        }
        if (b.concealed) {
          fill = pallette.concealedFill;
          stroke = pallette.darkStroke;
        }
        if (block && isFamily(getBlocks(), block, b.id)) {
          fill = pallette.familyFill;
          stroke = pallette.lightStroke;
        }
        const group = addRect(canv, b.id, coords, blockDimensions, fill, stroke);
        
        let menuGroup = addMenuItem(1, canv, group, b);
        
        menuGroup.on({'mousedblclick' : toggleHighlight});
        menuGroup.on({'mousedown' : highlightTree});
        menuGroup.on({'mouseup' : unhighlightTree});
        
        menuGroup = addMenuItem(2, canv, group, b);
        menuGroup.on({'mouseup' : toggleFrozen});
        
        menuGroup = addMenuItem(3, canv, group, b);
        menuGroup.on({'mouseup' : toggleConcealed});

        menuGroup = addMenuItem(4, canv, group, b);
        menuGroup.on({'mouseup' : addBlock});

        group.on({'mousedown': mouseDown});
        group.on({'mousemove': mouseMove});
        group.on({'mouseup': mouseUp});
      });
      renderLines(blockDimensions);
    };

    let highlighted = false;
    const unhighlightTree = function (evt: any) {
      const id = evt.target.toObject().id;
      $blockStore = { opcode: 'unhighlightTree', blockId: id };
      highlighted = false;
    };

    const highlightTree = function (evt: any) {
      const id = evt.target.toObject().id;
      $blockStore = { opcode: 'highlightTree', blockId: id };
      highlighted = true;
    };

    const mouseUp = function (evt: any) {
      moving = false;
      rerender(null);
    };

    let startingPoint:{ x:number, y:number};
    const mouseDown = function (evt: any) {
      startingPoint = canv.getPointer();
      // console.log('Starting point: ' + startingPoint.x + ' ' + startingPoint.y);    // Log to console
      moving = true;
    };

    const mouseMove = function (evt: any) {
      if (!moving) return;
      const canvasCoords = { x: canv.getPointer().x, y: canv.getPointer().y };
      if (Math.abs(canvasCoords.x - startingPoint.x) < 20 && Math.abs(canvasCoords.y - startingPoint.y) < 20) {
        // console.log('Ending point: ' + canvasCoords.x + ' ' + canvasCoords.y);    // Log to console
        return
      }
      canvasCoords.y = evt.target.aCoords.tl.y;
      const uc = userCoords.find((o) => o.blockId === evt.target.toObject().id);
      if (uc) {
        uc.coords = canvasCoords;
      } else {
        userCoords.push({ blockId: evt.target.toObject().id, coords: canvasCoords });
      }
      rerender(null);
    };

    const toggleHighlight = function (evt: any) {
      if (highlighted) unhighlightTree(evt);
      else highlightTree(evt);
    };

    const renderLines = function (blockDimensions:DimensionsType) {
      const blocks = getBlocks();
      blocks.forEach((b) => {
        if (b.parentId > 0) {
          const p = blocks.find((o) => o.id === b.parentId);
          const lines = makeLines(b, p, blockDimensions);
          lines.forEach(line => {
            canv.add(line);
            canv.sendToBack(line);
          })
        }
      })
    };

    const toggleFrozen = function (evt: any) {
      const id = evt.target.toObject().id;
      const block = getBlocks().find((o) => o.id === id);
      dispatch("doUpdateCanvas", { blockMode, opcode: 'toggleFrozen', block });
    };

    const toggleConcealed = function (evt: any) {
      const id = evt.target.toObject().id;
      const block = getBlocks().find((o) => o.id === id);
      dispatch("doUpdateCanvas", { blockMode, opcode: 'toggleConcealed', block });
    };

    const addBlock = function (evt: any) {
      try {
        moving = false;
        const block = mineBlock(evt.target.toObject().id);
        $blockStore = { opcode: 'addBlock', blockId: block.id };
        dispatch("doUpdateCanvas", { blockMode, opcode: 'addBlock', canv, block });
      } catch (e) {
        dispatch("doUpdateCanvas", { blockMode, opcode: 'stateChangeError', e });
        console.log(e);
      }
    };

    const handleGenesis = function () {
      const block = mineBlock(0);
      $blockStore = { opcode: 'addBlock', blockId: block.id };
      dispatch("doUpdateCanvas", { blockMode, opcode: 'addBlock', canv, dimensions, block });
    };

    const mountCanvas = async function () {
      canv = new fabric.Canvas(canvas, {
        preserveObjectStacking: true
      });
      canv.setDimensions({width: dimensions.width, height: dimensions.height})
      const blocks = getBlocks();
      if (blocks.length > 0) {
        rerender(null);
      } else {
        handleGenesis();
      }
    };

    onMount(async () => {
      await mountCanvas();
    });

</script>

<div class="d-flex justify-content-between py-1">
  <div><span class="block-mode">Mode: {blockMode}</span></div>
  <div class=" px-5">
    <span class=""><a href="/" on:click|preventDefault={() => dispatch("doUpdateCanvas", { blockMode, opcode: 'downloadCanvas', canv })}><Download width={20} height={20}/></a></span>
  </div>
</div>
<div>
  <canvas bind:this={canvas} width="400" height="400"/>
</div>

<style>
  canvas {
    border: 1pt solid #bf6bd6;
    border-radius: 15px;
  }
  .block-mode {
    text-transform: capitalize;
  }
</style>