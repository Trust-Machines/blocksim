import { Event } from './models/Event.ts'
import type { EventType } from './models/Event.ts'
import { BlockState } from './models/Block.ts'

let eventList:EventType[]  = [];

export function pushEvent(blockId: number, parentId:number, from:BlockState, to:BlockState) {
	eventList.push(new Event(blockId, parentId, from, to));
}

export function setEvents(events:EventType[]) {
	eventList = events;
}

export function popEvent() {
	if (eventList.length === 1) throw new Error('Nothing to undo');
	return eventList.pop();
}

export function getEvents() {
	return eventList;
}

export function clearEvents() {
	eventList = [];
}

