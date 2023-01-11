# blocksim

## Introduction

**Blocksim** is a visualisation and teaching tool for the Stacks blockchain. It helps model the growth
of the Stacks Blockchain in one of two modes - one to one ratio of Bitcoin to Stacks blocks
and many or none Stacks Blocks per Bitcoin block.

The application has a set of functions which apply to the whole graph and a set of
controls per block - see the Documentation section below.

## Development

This is a Github Pages application. See the README on the main branch for build and
deployment details.

## Documentation

### Functions

The following function are available in the header;

- Download: download the chain state to a file in json format
- Undo: undo the last state change
- Redo: redo the previous state change
- Reset: reset chain state back to genesis
- Mode Toggle: switch between displaying Bitcoin, Stacks and Both modes
- Zoom: change the magnification of the tree

Blocks can be moved by click and drag. Movement is currently constrained to a
horizontal plane as moving the blocks vertically can break the fundamental principals, this
said a small vertical movement is allowed. Children nodes follow the movement of parents
but not the other way around.

### Block Controls

Button controls on each block;

- H - Highlight ancestors and descendant's - click once to highlight click twice to reset or click and hold - changes the subtree block colour to purple.
- T/F - click to toggle Freeze/Thaw block - mining is prevented when block is frozen - changes block colour to light blue / cyan.
- C/D - click to toggle Concealed/Disclosed - changes the block colour to white, does not change mining rules etc atm.
- M - click to mine a block. a block will be added to the tree. Throws error if business rules don't allow mining from this block.

These rules governing these states are subject to change. For current release;

1. By default mining is allowed from the two most recent blocks.
2. Concealing / disclosing has not yet been implemented (just a block colour change atm).
3. Freezing / thawing a block overrides the default mining behaviour.

Clean separation between business and UI logic allows the commands to be driven by simple API commands.

### Business Model API

See src/lib/blocks.ts

- window.mineBlock(id) // mines a new block given the given parent id or throws error
- window.freezeBlock(id) // freezes the given block or throws error
- window.thawBlock (id) // thaws the given block or throws error
- window.concealBlock (id) // conceals the given block or throws error
- window.discloseBlock(id) // discloses the given block or throws error
- window.setMinableBlocks() // resets the the mining rules to the default - overwrites existing state
- window.setBlocks([]:BlockType) // sets the block state from a list of blocks
- window.undoLastOperation // undo last operation
- window.redoLastOperation // not yet implemented
- window.clearBlocks() // clears blocks

### User Interface API

See src/lib/components/route-home.svelte

- window.redraw() - e.g. syncs the ui state with the model
