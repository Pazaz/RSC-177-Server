import fs from 'fs';
import forge from 'node-forge';

const pub = forge.pki.publicKeyFromPem(fs.readFileSync('data/public.pem'));
const priv = forge.pki.privateKeyFromPem(fs.readFileSync('data/private.pem'));

export default class Packet {
    constructor(src) {
        if (src) {
            this.data = new Uint8Array(src);
        } else {
            this.data = new Uint8Array();
        }

        this.pos = 0;
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

    g1() {
        return this.data[this.pos++];
    }

    g2() {
        return (this.data[this.pos++] << 8) | this.data[this.pos++];
    }

    g4() {
        return (this.data[this.pos++] << 24) | (this.data[this.pos++] << 16) | (this.data[this.pos++] << 8) | this.data[this.pos++];
    }

    g8() {
        let high = BigInt(this.g4());
        let low = BigInt(this.g4());
        return (high << 32n) | low;
    }

    gdata(length) {
        let data = this.data.slice(this.pos, this.pos + length);
        this.pos += length;
        return data;
    }

    gPacket(length) {
        return new Packet(this.gdata(length));
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
}
