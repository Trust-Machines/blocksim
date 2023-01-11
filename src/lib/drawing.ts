import { fabric } from "fabric";
import type { BlockType } from "./models/Block.ts";

export type DimensionsType = {
	width: number,
	height: number
};

const lineColors = ['#154c79', '#d66d35', '#7C3626', '#Ee0d10', '#81fb3f', '#76b5c5', '#642425', '#B3F3A4', '#81fb3f', '#065996', '#E4CD08', '#08D5E4', '#065996', '#C885F3', '#FB3FD3', '#FB3F77', '#642425', '#642425', '#642425', '#642425'];
const scalor = { x: 1.2, y: 1.5 };

function getRndInteger(min:number, max:number) {
	const str = (Math.random() * (max - min) + min).toFixed(2);
	return parseFloat(str);
  }

function getLineSegment(endX:number, endY:number, startX:number, startY:number, color:string, strokeWidth:number) {
    return new fabric.Line([endX, endY, startX, startY], {
        fill: 'red',
        stroke: color,
        strokeWidth: strokeWidth,
        selectable: false
    });
}

export function makeLines(block:BlockType, parent:BlockType, blockDimensions:DimensionsType) {
	const lines = [];
	const gap = blockDimensions.height / 10;
	let stroke = lineColors[block.parentId];
	if (!stroke) stroke = '#000';
	let startX = parent.coords.x + blockDimensions.width / 2;
	let startY = parent.coords.y + blockDimensions.width / 2;
	let endX = block.coords.x + blockDimensions.width / 2;
	let endY = block.coords.y + blockDimensions.width / 2;

	if (block.coords.x === parent.coords.x) {
		lines.push(getLineSegment(endX, endY, startX, startY, stroke, 2));
		return lines;
	}

	const rnd = 0; //getRndInteger(-5, 5);

	// 1st segment - drop down from parent into gap
	endX = startX;
	endY = startY + blockDimensions.width / 2 + gap * 2;
	if (parent.id % 2 === 0) endY += parent.id / 1.2;
	else endY -= parent.id / 1.2;
	lines.push(getLineSegment(startX + rnd, startY, endX + rnd, endY, stroke, 2));


	// 2nd segment - move left or right
	startX = endX;
	startY = endY;
	endY = startY;
	if (block.coords.x < parent.coords.x) {
		endX = block.coords.x + blockDimensions.width / 2
	} else {
		endX = block.coords.x + blockDimensions.width / 2
	}
	lines.push(getLineSegment(startX + rnd, startY, endX + rnd, endY, stroke, 2));

	// 3rd segment - drop down
	startX = endX;
	startY = endY;
	// endY = endY + blockDimensions.width / 2 + gap;
	// if (blockMode === 'bitcoin') 
	endY = block.coords.y + blockDimensions.width / 2 + gap;
	lines.push(getLineSegment(startX + rnd, startY, endX + rnd, endY, stroke, 2));
	
	return lines;
}

function getCircle(coords: { x:number, y:number }, config:any) {
	return new fabric.Circle({ 
		left: coords.x, 
		top: coords.y, 
		width: config.width, 
		height: config.height, 
		fill: config.fill, 
		strokeWidth: 1, 
		stroke: '#fff',
		radius: config.radius, 
	  });
  }

/**
 * Where to place the block on next row depends on the position of the parent,
 * whether its the first for this parent and whether any other parents
 * already have a block on this row - in this case the center is taken as the
 * x position of the first parent to have had a block on this row.
 * @param block 
 * @param dimensions 
 * @param blockDimensions 
 * @returns 
 */
 function getCenterXBitcoinMode(gap:number, subList:BlockType[], block:BlockType, width:number) {
	const parent = subList.find((o) => o.id === block.parentId);
	if (!parent) return 0; // the root node has already been handled.
	let siblings = subList.filter((o) => block.parentId === o.parentId).length;
	if (block.parentId === parent.id) siblings++;
	let x = 0;
	if (siblings === 0) {
		x = parent.coords.x + gap;
	} else if (block.parentId % 2 === 0) {
		x = parent.coords.x - ((width + gap) / 2) * siblings;
	} else  {
		x = parent.coords.x + ((width + gap) / 2) * siblings;
	}
	return x;
}

/**
 * Where to place the block on next row depends on the position of the parent,
 * whether its the first for this parent and whether any other parents
 * already have a block on this row - in this case the center is taken as the
 * x position of the first parent to have had a block on this row.
 * @param block 
 * @param dimensions 
 * @param blockDimensions 
 * @returns 
 */
 function getCenterXStacksMode(gap:number, blocksAtLevel:number, subList:BlockType[], block:BlockType, dimensions:DimensionsType, blockDimensions:DimensionsType) {
	const firstBlockAtLevel = subList.filter((o) => o.level === block.level)[0];
	const parent = subList.find((o) => o.id === block.parentId);
	const w = blockDimensions.width;
	let centerX = (dimensions.width - w) / 2;
	if (firstBlockAtLevel) {
		centerX = firstBlockAtLevel.coords.x;
	} else if (parent) {
		centerX = parent.coords.x;
	}
	let x;
	if (!blocksAtLevel) {
		x = centerX;
	} else if (blocksAtLevel % 2 === 0) {
		// numb block to right of center
		const blockRight = Math.floor((blocksAtLevel) / 2)
		x = centerX + ((w + gap) * blockRight);
	} else {
		let blockLeft = blocksAtLevel;
		//if ((blocksAtLevel % 2 > 0) && blockLeft > 2) blockLeft = blockLeft - (blocksAtLevel / 2);
		/**
		 */
		if (blocksAtLevel === 3) blockLeft = blockLeft - 1;
		if (blocksAtLevel === 5) blockLeft = blockLeft - 2;
		if (blocksAtLevel === 7) blockLeft = blockLeft - 3;
		if (blocksAtLevel === 9) blockLeft = blockLeft - 4;
		if (blocksAtLevel === 11) blockLeft = blockLeft - 5;
		if (blocksAtLevel === 13) blockLeft = blockLeft - 6;
		if (blocksAtLevel === 15) blockLeft = blockLeft - 7;
		x = centerX - ((w + gap) * blockLeft);
	}
	return x;
}


function getCenterY(blockList:BlockType[], block:BlockType, gap:number, height:number) {
	const parent = blockList.find((o) => o.id === block.parentId);
	const y = (parent) ? parent.coords.y : 0;
	return y + height + gap;
}

  function getCoordsStacks(blockList:BlockType[], subList:BlockType[], block:BlockType, dimensions:DimensionsType, blockDimensions:DimensionsType, gap:number) {
	const coords = { x: 0, y: 0 };
	coords.y = getCenterY(blockList, block, gap, blockDimensions.height);
	const blocksAtLevel = subList.filter((o) => o.level === block.level).length;
	coords.x = getCenterXStacksMode(gap, blocksAtLevel, subList, block, dimensions, blockDimensions);
	// if none add below parent else add even to right and odd to left
	return coords;
}

function getCoordsBitcoin(subList:BlockType[], block:BlockType, blockDimensions:DimensionsType, gap:number) {
	const coords = { x: 0, y: 0 };
	coords.x = getCenterXBitcoinMode(gap, subList, block, blockDimensions.width);
	const numbBlocks = subList.length - 1;
	coords.y =  subList[numbBlocks].coords.y + blockDimensions.height + 5; // - (gap * 0.2);
	return coords
}

  export function calculateBlockCoords(userCoords: { blockId: number; coords: { x:number, y: number }; }[], blockList:BlockType[], blockMode:string, dimensions:DimensionsType, blockDimensions:DimensionsType) {
	const gap = blockDimensions.height / 2;
	for (let i = 0; i < blockList.length; i++) {
		const block = blockList[i];
		const uc = userCoords.find((u) => u.blockId === block.id);
		if (uc) {
			block.coords = uc.coords;
		} else {
			const sublist = blockList.slice(0, i);
			if (block.id === 1) {
				block.coords = { x: (dimensions.width - blockDimensions.width) / 2, y: gap }
			} else if (blockMode === 'stacks') {
				block.coords = getCoordsStacks(blockList, sublist, block, dimensions, blockDimensions, gap);
			} else {
				block.coords = getCoordsBitcoin(sublist, block, blockDimensions, gap);
			}
		}
	}
	return blockList;
}

  export function getTextProps(coords: { x:number, y:number }, color:string|undefined, fontSize:number) {
	return {
		left: coords.x - 5,
		top: coords.y - 10,
		strokeWidth: 1,
		stroke:"#fff",
		paintFirst: "stroke",
		fontFamily: 'sans-serif',
		fill: (color) ? color : '#fff',
		fontSize: fontSize,
	};
  }

  export function  addRect(canv:any, id:number, coords: { x:number, y:number }, blockDimensions:DimensionsType, fill:string, stroke:string) {
	const rect = new fabric.Rect({
		left: coords.x + 5,
		top: coords.y,
		width: blockDimensions.width,
		height: blockDimensions.height,
		fill,
		strokeWidth: 2,
		stroke,
	  });
	  //canv.add(rect);
	  const text = new fabric.Text('' + id, getTextProps(rect.getCenterPoint(), stroke, 18));
	  const group = new fabric.Group([rect, text], { lockMovementX: false, lockMovementY: false, selectable: true });
	  group.hoverCursor = 'pointer';
	  canv.add(group);
	  group.toObject = function() {
			  return {
				id
			  };
		  };
	  //canv.sendToBack(rect);
	  return group;
  }

  export function addMenuItem(position:number, canv:any, parent:any, block:BlockType) {
	const coords = {
		x: parent.aCoords.bl.x,
		y: parent.aCoords.bl.y - 4,
	}
	let symbol = 'H';
	if (position === 1) {
		coords.x = coords.x + 15;
	} else if (position === 2) {
		symbol = 'F';
		if (block.frozen) symbol = 'T';
		coords.x = coords.x + 35.5;
	} else if (position === 3) {
		symbol = 'D';
		if (!block.concealed) symbol = 'C';
		coords.x = coords.x + 55;
	} else if (position === 4) {
		symbol = 'M';
		coords.x = coords.x + 75;
	}
	//const config = { radius: 3, width: 30, height: 20, fill: '#3e3e3e', stroke: '#3e3e3e', drawer: { height: 30, width: 146, fill: '#C5edee', stroke: '#C5edee' } };
	let stroke = '#fff';
	if (block.frozen || block.concealed) stroke = '#000';
	const rect = new fabric.Circle({
		radius: 7.5, 
		left: coords.x - 11,
		top: coords.y - 15,
		width: 14,
		height: 14,
		fill: 'transparent',
		strokeWidth: 1,
		stroke,
	  });
	const text = new fabric.Text(symbol, getTextProps({ x: coords.x - 2, y: coords.y - 2}, stroke, 9));
	const group = new fabric.Group([rect, text], { lockMovementX: false, lockMovementY: true, selectable: false });

	//const c1 = getCircle({ x: coords.x, y: coords.y }, config);
	//const c2 = getCircle({ x: coords.x, y: coords.y + 6 }, config);
	//const c3 = getCircle({ x: coords.x, y: coords.y + 12 }, config);
	//const group = new fabric.Group([c1, c2, c3], { lockMovementX: false, lockMovementY: true, selectable: false });
	group.hoverCursor = 'crosshairs';
	canv.add(group);
	group.toObject = function() {
		return {
			id: block.id,
			menuItem: position
		};
	};
	return group;
  }

export function scaleCanvas(document:any, canv:any, dimensions:DimensionsType, blocks:number) {
	// switch off auto scaling
	if (blocks % 1000 !== 0) return dimensions;
	const scaleFactor = Math.floor((blocks / 10)) + 1;
	if (scaleFactor <= 1) return dimensions;
	scalor.x += scaleFactor / 10;
	scalor.y += scaleFactor / 10;
	const frameEl = document.getElementById('frame');
	if (frameEl && frameEl.style) frameEl.style.width = scalor.x * dimensions.width * 2.5 + 'px';
	dimensions = {width: scalor.x * dimensions.width, height: scalor.y * dimensions.height}
	canv.setDimensions({width: dimensions.width, height: dimensions.height});
	return dimensions;
}

export function isFamily(blockList:BlockType[], block:BlockType, id:number) {
	if (block.id === id) {
		return true;
	}
	// check ancestors
	if (block.id > 1) {
		let parent = blockList.find((o) => o.id === block.parentId);
		while (parent && parent.id > 0) {
			if (parent?.id === id) return true;
			parent = blockList.find((o) => o.id === parent?.parentId);
		}
	}
	// check descendent
	const children = blockList.filter((o) => o.parentId === block.id);
	if (children.filter((o) => o.id === id).length > 0) {
		return true;
	}
	let result = false;
	children.forEach((child) => {
		const children = blockList.filter((o) => o.parentId === child.id);
		if (children.filter((o) => o.id === id).length > 0) {
			result = true;
		} else {
			children.forEach((child) => {
				const children = blockList.filter((o) => o.parentId === child.id);
				if (children.filter((o) => o.id === id).length > 0) {
					result = true;
				} else {
					children.forEach((child) => {
						const children = blockList.filter((o) => o.parentId === child.id);
						if (children.filter((o) => o.id === id).length > 0) {
							result = true;							
						} else {
							children.forEach((child) => {
								const children = blockList.filter((o) => o.parentId === child.id);
								if (children.filter((o) => o.id === id).length > 0) {
									result = true;							
								} else {
									children.forEach((child) => {
										const children = blockList.filter((o) => o.parentId === child.id);
										if (children.filter((o) => o.id === id).length > 0) {
											result = true;							
										}
									})
								}
							})
						}
					})
				}
			})
		}
	})
	return result;
}
