import Packet from '#util/Packet.js';
import { decompressBz2 } from '#util/Bzip2.js';

function genHash(name) {
    let hash = new DataView(new ArrayBuffer(4));
    name = name.toUpperCase();
    for (let i = 0; i < name.length; ++i) {
        hash.setInt32(0, hash.getInt32() * 61 + name.charCodeAt(i) - 32);
    }
    return hash.getUint32();
}

export default class Jagfile {
    data = null;

    files = [];
    isCompressedWhole = false;

    static fromFile(path) {
        return new Jagfile(Packet.fromFile(path));
    }

    constructor(src) {
        this.data = src;

        let uncompressedSize = this.data.g3();
        let compressedSize = this.data.g3();

        if (uncompressedSize != compressedSize) {
            this.isCompressedWhole = true;
        }

        if (this.isCompressedWhole) {
            this.data = new Packet(decompressBz2(this.data.gdata(compressedSize)));
        }

        let count = this.data.g2();
        let offset = this.data.pos + (count * 10);

        for (let i = 0; i < count; ++i) {
            let hashName = this.data.g4();

            let file = {
                hashName,
                uncompressedSize: this.data.g3(),
                compressedSize: this.data.g3(),
                offset
            };

            offset += file.compressedSize;
            this.files.push(file);
        }
    }

    read(name, decompress = true) {
        let file = this.files.find(x => x.hashName == genHash(name));
        if (!file) {
            return null;
        }

        this.data.pos = file.offset;
        let data = this.data.gdata(file.compressedSize);

        if (decompress && file.compressedSize != file.uncompressedSize) {
            data = new Packet(decompressBz2(data));
        }

        return data;
    }
}
