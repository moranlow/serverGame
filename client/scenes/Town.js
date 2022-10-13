import io from "socket.io-client";
import BaseScene from "../utilities/base-scene";
import { DOWN } from "../../shared/constants/directions";
import { HOUSE_1, HOUSE_2, TOWN } from "../../shared/constants/scenes";
import { MAP_TOWN, IMAGE_TOWN } from "../constants/assets";

class Town extends BaseScene {
	constructor() {
		super(TOWN);
	}

	init(data) {
		super.init(this.getPosition(data));
	}

	create() {
		super.create(MAP_TOWN, IMAGE_TOWN, false);
	}

	registerCollision() {
		for (let i = 0; i < this.map.layers.length; i++) {
			this.layers[i].setCollisionByProperty({ ge_collide: true });
			let player = this.player.players[this.player.socket.id].container;
			this.physics.add.collider(player, this.layers[i]);
		}
	}

	getPosition(data) {
		if (data === HOUSE_1 || Object.getOwnPropertyNames(data).length === 0) {
			return { x: 0, y: 0, direction: DOWN };
		} else if (data === HOUSE_2) {
			return { x: 655, y: 470, direction: DOWN };
		}
	}
}

export default Town;
