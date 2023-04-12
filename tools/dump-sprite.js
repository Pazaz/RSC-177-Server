import fs from 'fs';
import Config from '#cache/Config.js';
import Pix from '#cache/Pix.js';
import Jagfile from '#cache/Jagfile.js';

fs.mkdirSync('dump/obj', { recursive: true });

Config.load('release/config85.jag');

let media = Jagfile.fromFile('release/media58.jag');

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
    media.read('objects13.dat'),
    media.read('objects14.dat'),
    media.read('objects15.dat')
];

for (let i = 0; i < Config.obj.length; i++) {
    let obj = Config.obj[i];

    if (obj.sprite > 0) {
        let objectIndex = Math.floor(obj.sprite / 30);

        let pix = new Pix(objects[objectIndex], index, obj.sprite - (objectIndex * 30));
        let png = await pix.convert();

        if (png) {
            fs.writeFileSync(`dump/obj/${obj.id}.png`, png);
        } else {
            console.log('Failed to save', obj.id, obj.name, obj.sprite, objectIndex, obj.sprite - (objectIndex * 30));
        }
    }
}
