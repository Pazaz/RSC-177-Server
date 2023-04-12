import fs from 'fs';

import Packet from '#util/Packet.js';
import Jagfile from '#util/Jagfile.js';
import Pix from './Pix.js';

let config = Jagfile.fromFile('release/163/config74.jag');
let string = new Packet(config.read('string.dat'));
let integer = new Packet(config.read('integer.dat'));

let items = [];
let totalSpriteCount = 0;

let count = integer.g2();
for (let i = 0; i < count; ++i) {
    items[i] = {};
}

for (let i = 0; i < count; ++i) {
    items[i].name = string.gjstr();
}

for (let i = 0; i < count; ++i) {
    items[i].desc = string.gjstr();
}

for (let i = 0; i < count; ++i) {
    items[i].command = string.gjstr();
}

for (let i = 0; i < count; ++i) {
    items[i].sprite = integer.g2();
    totalSpriteCount = Math.max(totalSpriteCount, items[i].sprite);
}

for (let i = 0; i < count; ++i) {
    items[i].cost = integer.g2();
}

for (let i = 0; i < count; ++i) {
    items[i].stackable = integer.g1();
}

for (let i = 0; i < count; ++i) {
    items[i].mask = integer.g4();
}

for (let i = 0; i < count; ++i) {
    items[i].special = integer.g1();
}

for (let i = 0; i < count; ++i) {
    items[i].members = integer.g1();
}

let media = Jagfile.fromFile('release/163/media48.jag');

let index = media.read('index.dat');
let objects = [
    media.read('objects1.dat'),
    media.read('objects2.dat'),
    media.read('objects3.dat'),
    media.read('objects4.dat'),
    media.read('objects5.dat'),
    media.read('objects6.dat'),
    media.read('objects7.dat'),
    media.read('objects8.dat'),
    media.read('objects9.dat'),
    media.read('objects10.dat'),
    media.read('objects11.dat'),
    media.read('objects12.dat'),
];

for (let i = 0; i < items.length; i++) {
    let item = items[i];

    if (item.sprite > 0) {
        let objectIndex = Math.floor(item.sprite / 30);

        let pix = new Pix(objects[objectIndex], index, item.sprite - (objectIndex * 30));
        let png = await pix.convert();

        if (png) {
            fs.writeFileSync(`dump/${item.name}.png`, png);
        } else {
            console.log('Failed to save', item.name, item.sprite, objectIndex, item.sprite - (objectIndex * 30));
        }
    }
}
