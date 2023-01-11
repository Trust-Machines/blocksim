export type BlockType = {
	id: number,
	parentId: number,
	frozen: boolean,
	concealed: boolean,
  level: number,
  coords: { x:number, y:number }
};

export enum BlockState {
  THAWED,
	FROZEN,
	CONCEALED,
  DISCLOSED
};

export class Block {
  id = 0;
	parentId = 0;
	level = 1;
	frozen = false;
	concealed = false;
  coords = { x: 0, y: 0 };

  constructor(parentId: number, id: number) {
    this.parentId = parentId;
    this.id = id;
    this.level = id;
  }

  // Extensions
  isGensis() {
    return this.id === 1;
  }

  freeze() {
    this.frozen = true;
  }

  thaw() {
    this.frozen = false;
  }

  conceal() {
    this.concealed = true;
  }

  disclose() {
    this.concealed = false;
  }
}
