import io from "socket.io-client";
import {
	NEW_PLAYER,
	ALL_PLAYERS,
	CHAT,
	KEY_PRESS,
	MOVE,
	STOP,
	REMOVE,
} from "../../shared/constants/actions/player";
import { UP, LEFT, DOWN, RIGHT } from "../../shared/constants/directions";
import { IMAGE_PLAYER } from "../constants/assets";
import { SPEED } from "../constants/player";
import { FADE_DURATION } from "../constants/config";
import Phaser from "phaser";

class Player {
	constructor(scene, room, position) {
		this.scene = scene;
		this.room = room;
		this.position = position;
		this.socket = io();
		this.players = {};
	}

	create() {
		this.socket.emit(NEW_PLAYER, this.room, this.position);

		this.socket.on(NEW_PLAYER, (data) => {
			this.addPlayer(data.id, data.x, data.y, data.direction);
			console.log(data.x, data.y);
		});
		this.socket.on(ALL_PLAYERS, (data) => {
			this.scene.cameras.main.fadeFrom(FADE_DURATION);
			this.scene.scene.setVisible(true, this.room);

			for (let i = 0; i < data.length; i++) {
				this.addPlayer(data[i].id, data[i].x, data[i].y, data[i].direction);
			}

			this.scene.physics.world.setBounds(
				0,
				0,
				this.scene.map.widthInPixels,
				this.scene.map.heightInPixels
			);
			this.scene.cameras.main.setBounds(
				0,
				0,
				this.scene.map.widthInPixels,
				this.scene.map.heightInPixels
			);
			this.scene.cameras.main.startFollow(
				this.players[this.socket.id].container,
				true
			);

			this.socket.on(MOVE, (data) => {
				this.players[data.id].x = data.x;
				this.players[data.id].y = data.y;
				this.players[data.id].name.x = data.x - 25;
				this.players[data.id].name.y = data.y + 35;
				this.players[data.id].anims.play(data.direction, true);
			});

			this.socket.on(STOP, (data) => {
				this.players[data.id].x = data.x;
				this.players[data.id].y = data.y;
				this.players[data.id].anims.stop();
			});

			this.socket.on(REMOVE, (id) => {
				this.players[id].destroy();
				this.players[id].name.destroy();
				delete this.players[id];
			});

			// this.registerChat();
		});
	}

	addPlayer(id, x, y, direction) {
		this.players[id] = this.scene.physics.add.sprite(x, y, IMAGE_PLAYER);
		this.players[id].name = this.scene.add.text(x - 25, y + 20, id.slice(0, 5));
		this.players[id].body.setSize(20, 30);
		this.players[id].anims.play(direction);
		this.players[id].anims.stop();
		this.players[id].container = this.scene.add.container(800, 690, [
			this.players[id],
			this.players[id].name,
		]);
		this.players[id].container.setSize(10, 10);
		this.scene.physics.world.enable(
			this.players[id].container,
			Phaser.Physics.Arcade.DYNAMIC_BODY
		);
		this.players[id].container.body.setCollideWorldBounds(true);
	}

	left() {
		this.players[this.socket.id].name.x = this.players[this.socket.id].x - 30;
		this.players[this.socket.id].name.x = this.players[this.socket.id].x - 30;
		this.players[this.socket.id].container.body.setVelocityX(-SPEED);
		this.players[this.socket.id].container.body.setVelocityY(0);
		this.players[this.socket.id].anims.play(LEFT, true);
		this.socket.emit(KEY_PRESS, LEFT, {
			x: this.players[this.socket.id].container.body.x,
			y: this.players[this.socket.id].container.body.y,
		});
	}

	right() {
		this.players[this.socket.id].name.x = this.players[this.socket.id].x - 22;
		this.players[this.socket.id].container.body.setVelocityX(SPEED);
		this.players[this.socket.id].container.body.setVelocityY(0);
		this.players[this.socket.id].anims.play(RIGHT, true);
		this.socket.emit(KEY_PRESS, RIGHT, {
			x: this.players[this.socket.id].container.body.x,
			y: this.players[this.socket.id].container.body.y,
		});
	}

	up() {
		this.players[this.socket.id].name.y = this.players[this.socket.id].y + 20;
		this.players[this.socket.id].container.body.setVelocityX(0);
		this.players[this.socket.id].container.body.setVelocityY(-SPEED);
		this.players[this.socket.id].anims.play(UP, true);
		this.socket.emit(KEY_PRESS, UP, {
			x: this.players[this.socket.id].container.body.x,
			y: this.players[this.socket.id].container.body.y,
		});
	}

	down() {
		this.players[this.socket.id].name.y = this.players[this.socket.id].y + 20;
		this.players[this.socket.id].container.body.setVelocityX(0);
		this.players[this.socket.id].container.body.setVelocityY(SPEED);
		this.players[this.socket.id].anims.play(DOWN, true);
		this.socket.emit(KEY_PRESS, DOWN, {
			x: this.players[this.socket.id].container.body.x,
			y: this.players[this.socket.id].container.body.y,
		});
	}

	stop() {
		this.players[this.socket.id].container.body.setVelocityX(0);
		this.players[this.socket.id].container.body.setVelocityY(0);
		this.players[this.socket.id].anims.stop();
		this.socket.emit(STOP, {
			x: this.players[this.socket.id].container.body.x,
			y: this.players[this.socket.id].container.body.y,
		});
	}

	update(direction) {
		const { isUp, isDown, isLeft, isRight } = direction;

		if (isUp) {
			this.up();
		} else if (isDown) {
			this.down();
		} else if (isLeft) {
			this.left();
		} else if (isRight) {
			this.right();
		} else {
			this.stop();
		}
	}

	// registerChat() {
	// 	let chat = document.getElementById(CHAT);
	// 	let messages = document.getElementById("messages");

	// 	chat.onsubmit = (e) => {
	// 		e.preventDefault();
	// 		let message = document.getElementById("message");

	// 		this.socket.emit(CHAT, message.value);
	// 		message.value = "";

	// 		const activeElement = document.activeElement;

	// 		if (activeElement !== document.body) {
	// 			activeElement.setAttribute("readonly", "readonly");
	// 			activeElement.setAttribute("disabled", "true");

	// 			setTimeout(function () {
	// 				activeElement.blur();
	// 				activeElement.removeAttribute("readonly");
	// 				activeElement.removeAttribute("disabled");
	// 			}, 100);
	// 		}
	// 	};

	// 	this.socket.on(CHAT, (name, message) => {
	// 		messages.innerHTML += `${name}: ${message}<br>`;
	// 		messages.scrollTo(0, messages.scrollHeight);
	// 	});
	// }
}

export default Player;
