import type { BlockType } from './models/Block.ts'
import type { EventType } from './models/Event.ts'

const STORAGE_KEY = 'block-store';

export function saveState(blocks:BlockType[], events:EventType[]) {
    const blockStore:[{ ts: number, blocks:BlockType[], events:EventType[] }] = [
		{
			blocks,
			events,
			ts: new Date().getTime()
		}
	];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blockStore));
	return true;
}

export function getLastState() {
	const state = localStorage.getItem(STORAGE_KEY)
	if (state) {
		return JSON.parse(state)[0];
	}
}

