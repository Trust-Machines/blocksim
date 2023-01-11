import { Block } from './models/Block.ts'
import { BlockState } from './models/Block.ts'
import type { BlockType } from './models/Block.ts'
import { setEvents, popEvent, getEvents, pushEvent, clearEvents } from './events.ts';
import { saveState, getLastState } from './blockStorage.ts';

let blockList:BlockType[]  = [];

// private functions
function getLevel(parentId:number) {
	const parent = blockList.find((o) => o.id === parentId);
	return (parent) ? parent.level + 1 : 1;
}

// public functions
export function getBlocks() {
	return blockList;
}

export function saveCurrentState() {
	saveState(blockList, getEvents());
  }

export function clearBlocks() {
	blockList = [];
	clearEvents();
}

export function restoreSavedState() {
	setEvents(getLastState().events);
	blockList = getLastState().blocks;
}

export function setBlocks(blocks:BlockType[]) {
	blockList = blocks;
}

export function redoLastOperation() {
	const storedEvents = getLastState().events;
	const events = getEvents();
	if (storedEvents.length === events.length) throw new Error('Nothing to redo');
	const event = storedEvents[events.length];
	if (event.from === event.to) {
		const b = new Block(event.parentId, blockList.length + 1);
		b.level = getLevel(event.parentId);
		blockList.push(b);
		pushEvent(event.blockId, event.parentId, event.from, event.to);
		//saveCurrentState();
	} else {
		const index = blockList.findIndex((o) => o.id === event.blockId);
		if (event.to === BlockState.FROZEN) blockList[index].frozen = true
		else if (event.to === BlockState.THAWED) blockList[index].frozen = false
		else if (event.to === BlockState.CONCEALED) blockList[index].concealed = true
		else if (event.to === BlockState.DISCLOSED) blockList[index].concealed = false
		pushEvent(event.blockId, event.parentId, event.to, event.from);
	}
	return event.blockId;
}

export function undoLastOperation() {
	const event = popEvent();
	if (!event) throw new Error('State change error - last event not found');
	const index = blockList.findIndex((o) => o.id === event.blockId);
	if (event.from === event.to) {
		blockList.splice(index, 1);
	} else {
		if (event.from === BlockState.FROZEN) blockList[index].frozen = true
		else if (event.from === BlockState.THAWED) blockList[index].frozen = false
		else if (event.from === BlockState.CONCEALED) blockList[index].concealed = true
		else if (event.from === BlockState.DISCLOSED) blockList[index].concealed = false
	}
	return event.blockId;
}

export function mineBlock(parentId:number) {
	const parent = blockList.find((b) => b.id === parentId);
	if (parent?.frozen) {
		throw new Error('Unable to mine - this block is frozen');
	} else {
		const b = new Block(parentId, blockList.length + 1);
		b.level = getLevel(parentId);
		blockList.push(b);
		setMinableBlocks();
		pushEvent(b.id, b.parentId, BlockState.THAWED, BlockState.THAWED);
		saveCurrentState();
		return b;
	}
}

export function freezeBlock(id:number) {
	const block = blockList.find((b) => b.id === id);
	if (!block) throw new Error('State change error - block not found for id=' + id);
	if (block.frozen) throw new Error('State change error - block is already frozen');
	block.frozen = true;
	pushEvent(block.id, block.parentId, BlockState.THAWED, BlockState.FROZEN);
	saveCurrentState();
}

export function thawBlock(id:number) {
	const block = blockList.find((b) => b.id === id);
	if (!block) throw new Error('State change error - block not found for id=' + id);
	if (!block.frozen) throw new Error('State change error - block is already thawed');
	block.frozen = false;
	pushEvent(block.id, block.parentId, BlockState.FROZEN, BlockState.THAWED);
	saveCurrentState();
}

export function concealBlock(id:number) {
	const block = blockList.find((b) => b.id === id);
	if (!block) throw new Error('State change error - block not found for id=' + id);
	if (block.concealed) throw new Error('State change error - block is already concealed');
	block.concealed = true;
	pushEvent(block.id, block.parentId, BlockState.DISCLOSED, BlockState.CONCEALED);
	saveCurrentState();
}

export function discloseBlock(id:number) {
	const block = blockList.find((b) => b.id === id);
	if (!block) throw new Error('State change error - block not found for id=' + id);
	if (!block.concealed) throw new Error('State change error - block is already disclosed');
	block.concealed = false;
	pushEvent(block.id, block.parentId, BlockState.CONCEALED, BlockState.DISCLOSED);
	saveCurrentState();
}

export function setMinableBlocks() {
	const numb = blockList.length;
	blockList.forEach((b) => {
		if (!b.frozen && b.id > numb - 2) b.frozen = false;
		else b.frozen = true;
	});
	//saveCurrentState();
}

window.mineBlock = mineBlock;
window.setMinableBlocks = setMinableBlocks;
window.setBlocks = setBlocks;
window.undoLastOperation = undoLastOperation;
window.clearBlocks = clearBlocks;
window.freezeBlock = freezeBlock;
window.thawBlock = thawBlock;
window.concealBlock = concealBlock;
window.discloseBlock = discloseBlock;
