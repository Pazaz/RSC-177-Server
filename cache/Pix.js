import Jimp from 'jimp';

export default class Pix {
    palette = new Uint32Array();
    data = new Uint8Array();
    jpeg = false;

    width = 0;
    height = 0;
    pixelOrder = 0;
    cropX = 0;
    cropY = 0;
    cropW = 0;
    cropH = 0;

    constructor(dat, idx, sprite = 0) {
        dat.pos = 0;
        idx.pos = dat.g2();

        this.cropW = idx.g2();
        this.cropH = idx.g2();

        const paletteSize = idx.g1();
        this.palette = new Uint32Array(paletteSize);
        for (let i = 0; i < paletteSize - 1; ++i) {
            this.palette[i + 1] = idx.g3();

            if (this.palette[i + 1] == 0) {
                this.palette[i + 1] = 1;
            }
        }

        if (paletteSize == 2 && this.palette[1] == 1) {
            // this is a completely transparent image
            this.palette = new Uint32Array();
            this.cropW = 0;
            this.cropH = 0;
            return;
        }

        for (let i = 0; i < sprite && idx.available && dat.available; ++i) {
            idx.pos += 2; // skip the crop data
            dat.pos += idx.g2() * idx.g2(); // skip reading the image data
            idx.pos += 1; // skip the pixel order
        }

        if (idx.available <= 0 || dat.available <= 0) {
            console.log('Invalid sprite index', sprite, idx.available, dat.available);
            // not a valid index
            this.palette = new Uint32Array();
            this.cropW = 0;
            this.cropH = 0;
            return;
        }

        this.cropX = idx.g1();
        this.cropY = idx.g1();
        this.width = idx.g2();
        this.height = idx.g2();

        if (this.width >= 256 || this.height >= 256) {
            console.log('Invalid sprite size', this.width, this.height);
            this.data = new Uint8Array();
            this.width = 0;
            this.height = 0;
            this.cropX = 0;
            this.cropY = 0;
            this.cropW = 0;
            this.cropH = 0;
            this.pixelOrder = 0;
            return;
        }

        this.data = new Uint8Array(this.width * this.height);
        this.pixelOrder = idx.g1();

        if (this.pixelOrder == 0) {
            for (let i = 0; i < this.width * this.height; ++i) {
                this.data[i] = dat.g1();
            }
        } else {
            for (let x = 0; x < this.width; ++x) {
                for (let y = 0; y < this.height; ++y) {
                    this.data[x + y * this.width] = dat.g1();
                }
            }
        }

        if (this.data.every(b => b == 0)) {
            console.log('All pixels are transparent');
            // this is a completely transparent image
            this.data = new Uint8Array();
            this.width = 0;
            this.height = 0;
            this.cropX = 0;
            this.cropY = 0;
            this.cropW = 0;
            this.cropH = 0;
            this.pixelOrder = 0;
            return;
        }
    }

    static load(archive, name, sprite = 0) {
        const dat = archive.read(`${name}.dat`);

        if (dat[0] == 0 && dat[1] == 0xD8 && dat[2] == 0xFF && dat[3] == 0xE0) {
            // this is a JPEG image (probably a title screen)
            this.data = dat;
            this.jpeg = true;

            this.data[0] = 0xFF; // fix the JPEG header
            return;
        }

        const idx = archive.read('index.dat');
        return new Pix(dat, idx, sprite);
    }

    async convert(crop = true) {
        if (!this.data.length) {
            console.log('No data to convert');
            return null;
        }

        if (this.jpeg) {
            return this.data.raw;
        }

        try {
            let image = new Jimp(this.width, this.height, 0x00000000);

            for (let x = 0; x < this.width; ++x) {
                for (let y = 0; y < this.height; ++y) {
                    let color = this.palette[this.data[x + y * this.width]];
                    if (color == 0) {
                        continue;
                    }

                    // set the color and alpha level
                    image.setPixelColor((color << 8 | 0xFF) >>> 0, x, y);
                }
            }

            if (crop && (this.cropX != 0 || this.cropY != 0 || this.cropW != this.width || this.cropH != this.height)) {
                let cropW = this.cropW;
                let cropH = this.cropH;
                let cropX = this.cropX;
                let cropY = this.cropY;

                if (cropW > this.width) {
                    cropW = this.width;
                }

                if (cropW + cropX > this.width) {
                    cropX = this.width - cropW;
                }

                if (cropH > this.height) {
                    cropH = this.height;
                }

                if (cropH + cropY > this.height) {
                    cropY = this.height - cropH;
                }

                image.crop(cropX, cropY, cropW, cropH);
            }

            return image.getBufferAsync(Jimp.MIME_PNG);
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
