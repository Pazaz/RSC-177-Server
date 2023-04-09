import fs from 'fs';
import forge from 'node-forge';
import zlib from 'zlib';

const pub = forge.pki.publicKeyFromPem(fs.readFileSync('data/public.pem'));
const priv = forge.pki.privateKeyFromPem(fs.readFileSync('data/private.pem'));

const BITMASK = [
    0,
    0x1, 0x3, 0x7, 0xF,
    0x1F, 0x3F, 0x7F, 0xFF,
    0x1FF, 0x3FF, 0x7FF, 0xFFF,
    0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF,
    0x1FFFF, 0x3FFFF, 0x7FFFF, 0xFFFFF,
    0x1FFFFF, 0x3FFFFF, 0x7FFFFF, 0xFFFFFF,
    0x1FFFFFF, 0x3FFFFFF, 0x7FFFFFF, 0xFFFFFFF,
    0x1FFFFFFF, 0x3FFFFFFF, 0x7FFFFFFF, 0xFFFFFFFF
];

export default class Packet {
    data = null;
    pos = -1;
    bitPos = -1;

    constructor(src) {
        this.data = new Uint8Array(src ?? 0);
        this.pos = 0;
        this.bitPos = 0;
    }

    static fromFile(path) {
        return new Packet(fs.readFileSync(path));
    }

    static fromGz(path) {
        return new Packet(zlib.gunzipSync(fs.readFileSync(path)));
    }

    toFile(path) {
        fs.writeFileSync(path, this.data);
    }

    toString() {
        return Buffer.from(this.data).toString();
    }

    toHex() {
        return Buffer.from(this.data).toString('hex');
    }

    static rsadec(data) {
        let length = data.g1();
        let encrypted = data.gdata(length);

        // .modpow(...)
        if (encrypted.length > 16) {
            // Java BigInteger prepended a 0 to indicate it fits in 64-bytes
            while (encrypted.length > 16) {
                encrypted = encrypted.slice(1);
            }
        } else if (encrypted.length < 16) {
            // Java BigInteger didn't prepend 0 because it fits in less than 64-bytes
            while (encrypted.length < 16) {
                encrypted = new Uint8Array([0, ...encrypted]);
            }
        }

        let decrypted = new Uint8Array(Buffer.from(priv.decrypt(encrypted, 'RAW', 'NONE'), 'ascii'));
        let pos = 0;

        // .toByteArray()
        // skipping RSA padding
        while (decrypted[pos] == 0) {
            pos++;
        }
        decrypted = decrypted.subarray(pos);

        return decrypted;
    }

    // ----

    get length() {
        return this.data.length;
    }

    get available() {
        return this.data.length - this.pos;
    }

    front() {
        this.pos = 0;
        this.bitPos = 0;
    }

    back() {
        this.pos = this.data.length;
        this.bitPos = this.pos * 8;
    }

    resize(size) {
        if (this.data.length < size) {
            let newData = new Uint8Array(size);
            newData.set(this.data);
            this.data = newData;
        }
    }

    ensure(capacity) {
        if (this.data.length - this.pos < capacity) {
            let diff = capacity - (this.data.length - this.pos);
            this.resize(this.data.length + diff);
        }
    }

    // ----

    // get 8-bit integer
    g1() {
        return this.data[this.pos++];
    }

    // get signed 8-bit integer
    g1b() {
        return this.data[this.pos++] << 24 >> 24;
    }

    // get 16-bit integer
    g2() {
        return ((this.data[this.pos++] << 8) | this.data[this.pos++]) >>> 0;
    }

    // get 32-bit integer
    g4() {
        return ((this.data[this.pos++] << 24) | (this.data[this.pos++] << 16) | (this.data[this.pos++] << 8) | this.data[this.pos++]) >>> 0;
    }

    // get signed 32-bit integer
    g4s() {
        return this.data[this.pos++] << 24 | this.data[this.pos++] << 16 | this.data[this.pos++] << 8 | this.data[this.pos++];
    }

    // get 64-bit integer
    g8() {
        let high = BigInt(this.g4());
        let low = BigInt(this.g4());
        return (high << 32n) | low;
    }

    gdata(length, offset = this.pos, advance = true) {
        let data = this.data.slice(offset, offset + length);
        if (advance) {
            this.pos += length;
        }
        return data;
    }

    gPacket(length) {
        return new Packet(this.gdata(length));
    }

    gstr() {
        return Buffer.from(this.gdata(this.available)).toString();
    }

    // ----

    p1(value) {
        this.ensure(1);
        this.data[this.pos++] = value;
    }

    p2(value) {
        this.ensure(2);
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p4(value) {
        this.ensure(4);
        this.data[this.pos++] = value >> 24;
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p8(value) {
        this.ensure(8);
        this.p4(Number(value >> 32n));
        this.p4(Number(value & 0xFFFFFFFFn));
    }

    pdata(src) {
        if (src instanceof Packet) {
            src = src.data;
        }

        this.ensure(src.length);
        this.data.set(src, this.pos);
    }

    psize1(length) {
        this.data[this.pos - length - 1] = length;
    }

    psize2(length) {
        this.data[this.pos - length - 2] = length >> 8;
        this.data[this.pos - length - 1] = length;
    }

    pstr(str) {
        this.pdata(Buffer.from(str));
    }

    rotate() {
        if (this.data.length <= 1) {
            return;
        }

        // move last byte to front
        let last = this.data[this.data.length - 1];
        for (let i = this.data.length - 1; i > 0; i--) {
            this.data[i] = this.data[i - 1];
        }
        this.data[0] = last;
    }

    rotateBack() {
        if (this.data.length <= 1) {
            return;
        }

        // move first byte to back
        let first = this.data[0];
        for (let i = 0; i < this.data.length - 1; i++) {
            this.data[i] = this.data[i + 1];
        }
        this.data[this.data.length - 1] = first;
    }

    // ----

    accessBits() {
        this.bitPos = this.pos * 8;
    }

    accessBytes() {
        this.pos = (this.bitPos + 7) >>> 3;
    }

    gBit(n) {
        let bytePos = this.bitPos >> 3;
        let remaining = 8 - (this.bitPos & 7);
        let value = 0;
        this.bitPos += n;

        for (; n > remaining; remaining = 8) {
            value += (this.data[bytePos++] & BITMASK[remaining]) << (n - remaining);
            n -= remaining;
        }

        if (n == remaining) {
            value += this.data[bytePos] & BITMASK[remaining];
        } else {
            value += (this.data[bytePos] >> (remaining - n)) & BITMASK[n];
        }

        return value;
    }

    pBit(n, value) {
        let bytePos = this.bitPos >>> 3;
        let remaining = 8 - (this.bitPos & 7);
        this.bitPos += n;

        // grow if necessary
        this.resize(bytePos + 1);

        for (; n > remaining; remaining = 8) {
            this.data[bytePos] &= ~BITMASK[remaining];
            this.data[bytePos++] |= (value >>> (n - remaining)) & BITMASK[remaining];
            n -= remaining;

            // grow if necessary
            this.resize(bytePos + 1);
        }

        if (n == remaining) {
            this.data[bytePos] &= ~BITMASK[remaining];
            this.data[bytePos] |= value & BITMASK[remaining];
        } else {
            this.data[bytePos] &= ~BITMASK[n] << (remaining - n);
            this.data[bytePos] |= (value & BITMASK[n]) << (remaining - n);
        }
    }
}
