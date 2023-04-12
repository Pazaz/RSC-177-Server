import Packet from '#util/Packet.js';
import Jagfile from '#cache/Jagfile.js';

class Config {
    obj = [];
    npc = [];
    texture = [];
    anim = [];
    loc = [];
    modelNames = [];
    boundary = [];
    roof = [];
    tile = [];
    projectileSprite = -1;
    spell = [];
    prayer = [];

    getModelId(str) {
        if (str.toLowerCase() === 'na') {
            return 0;
        }

        for (let i = 0; i < this.modelNames.length; i++) {
            if (this.modelNames[i].toLowerCase() === str.toLowerCase()) {
                return i;
            }
        }

        this.modelNames.push(str);
        return this.modelNames.length - 1;
    }

    load(path) {
        let config = Jagfile.fromFile(path);

        let string = new Packet(config.read('string.dat'));
        let integer = new Packet(config.read('integer.dat'));

        let objCount = integer.g2();
        for (let i = 0; i < objCount; ++i) {
            this.obj[i] = {
                id: i,
                name: string.gjstr()
            };
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].desc = string.gjstr();
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].op = string.gjstr();
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].sprite = integer.g2();
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].cost = integer.g4max();
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].stackable = integer.g1();
        }

        for (let i = 0; i < objCount; ++i) {
            integer.g1();
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].wearable = integer.g2();
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].mask = integer.g4max();
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].special = integer.g1();
        }

        for (let i = 0; i < objCount; ++i) {
            this.obj[i].members = integer.g1();
        }

        let npcCount = integer.g2();
        for (let i = 0; i < npcCount; ++i) {
            this.npc[i] = {
                id: i,
                name: string.gjstr()
            };
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].desc = string.gjstr();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].attack = integer.g1();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].strength = integer.g1();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].hits = integer.g1();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].defense = integer.g1();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].attackable = integer.g1();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].sprite = [];

            for (let j = 0; j < 12; j++) {
                this.npc[i].sprite[j] = integer.g1();
                if (this.npc[i].sprite[j] === 255) {
                    this.npc[i].sprite[j] = -1;
                }
            }
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].hairColor = integer.g4max();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].topColor = integer.g4max();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].bottomColor = integer.g4max();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].skinColor = integer.g4max();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].width = integer.g2();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].height = integer.g2();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].walkModel = integer.g1();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].combatModel = integer.g1();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].combatAnim = integer.g1();
        }

        for (let i = 0; i < npcCount; ++i) {
            this.npc[i].op = string.gjstr();
        }

        let textureCount = integer.g2();
        for (let i = 0; i < textureCount; ++i) {
            this.texture[i] = {
                id: i,
                name: string.gjstr()
            };
        }

        for (let i = 0; i < textureCount; ++i) {
            this.texture[i].subtype = string.gjstr();
        }

        let animCount = integer.g2();
        for (let i = 0; i < animCount; ++i) {
            this.anim[i] = {
                id: i,
                name: string.gjstr()
            };
        }

        for (let i = 0; i < animCount; ++i) {
            this.anim[i].charColor = integer.g4max();
        }

        for (let i = 0; i < animCount; ++i) {
            this.anim[i].gender = integer.g1();
        }

        for (let i = 0; i < animCount; ++i) {
            this.anim[i].hasA = integer.g1();
        }

        for (let i = 0; i < animCount; ++i) {
            this.anim[i].hasF = integer.g1();
        }

        for (let i = 0; i < animCount; ++i) {
            this.anim[i].number = integer.g1();
        }

        let locCount = integer.g2();
        for (let i = 0; i < locCount; ++i) {
            this.loc[i] = {
                id: i,
                name: string.gjstr()
            };
        }

        for (let i = 0; i < locCount; ++i) {
            this.loc[i].desc = string.gjstr();
        }

        for (let i = 0; i < locCount; ++i) {
            this.loc[i].op1 = string.gjstr();
        }

        for (let i = 0; i < locCount; ++i) {
            this.loc[i].op2 = string.gjstr();
        }

        for (let i = 0; i < locCount; ++i) {
            this.loc[i].model = string.gjstr();
            this.loc[i].modelId = this.getModelId(this.loc[i].model);
        }

        for (let i = 0; i < locCount; ++i) {
            this.loc[i].width = integer.g1();
        }

        for (let i = 0; i < locCount; ++i) {
            this.loc[i].height = integer.g1();
        }

        for (let i = 0; i < locCount; ++i) {
            this.loc[i].type = integer.g1();
        }

        for (let i = 0; i < locCount; ++i) {
            this.loc[i].elevation = integer.g1();
        }

        let boundaryCount = integer.g2();
        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i] = {
                id: i,
                name: string.gjstr()
            };
        }

        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i].desc = string.gjstr();
        }

        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i].op1 = string.gjstr();
        }

        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i].op2 = string.gjstr();
        }

        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i].height = integer.g2();
        }

        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i].textureFront = integer.g4max();
        }

        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i].textureBack = integer.g4max();
        }

        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i].adjacent = integer.g1();
        }

        for (let i = 0; i < boundaryCount; ++i) {
            this.boundary[i].invisible = integer.g1();
        }

        let roofCount = integer.g2();
        for (let i = 0; i < roofCount; ++i) {
            this.roof[i] = {
                id: i,
                height: integer.g1()
            };
        }

        for (let i = 0; i < roofCount; ++i) {
            this.roof[i].fills = integer.g1();
        }

        let tileCount = integer.g2();
        for (let i = 0; i < tileCount; ++i) {
            this.tile[i] = {
                id: i,
                decoration: integer.g4max()
            };
        }

        for (let i = 0; i < tileCount; ++i) {
            this.tile[i].type = integer.g1();
        }

        for (let i = 0; i < tileCount; ++i) {
            this.tile[i].adjacent = integer.g1();
        }

        this.projectileSprite = integer.g2();

        let spellCount = integer.g2();
        for (let i = 0; i < spellCount; ++i) {
            this.spell[i] = {
                id: i,
                name: string.gjstr()
            };
        }

        for (let i = 0; i < spellCount; ++i) {
            this.spell[i].desc = string.gjstr();
        }

        for (let i = 0; i < spellCount; ++i) {
            this.spell[i].level = integer.g1();
        }

        for (let i = 0; i < spellCount; ++i) {
            this.spell[i].runesRequired = integer.g1();
        }

        for (let i = 0; i < spellCount; ++i) {
            this.spell[i].type = integer.g1();
        }

        for (let i = 0; i < spellCount; ++i) {
            let runeAmount = integer.g1();
            this.spell[i].runesId = [];
            for (let j = 0; j < runeAmount; ++j) {
                this.spell[i].runesId[j] = integer.g2();
            }
        }

        for (let i = 0; i < spellCount; ++i) {
            let runeAmount = integer.g1();
            this.spell[i].runesCount = [];
            for (let j = 0; j < runeAmount; ++j) {
                this.spell[i].runesCount[j] = integer.g1();
            }
        }

        let prayerCount = integer.g2();
        for (let i = 0; i < prayerCount; ++i) {
            this.prayer[i] = {
                id: i,
                name: string.gjstr()
            };
        }

        for (let i = 0; i < prayerCount; ++i) {
            this.prayer[i].desc = string.gjstr();
        }

        for (let i = 0; i < prayerCount; ++i) {
            this.prayer[i].level = integer.g1();
        }

        for (let i = 0; i < prayerCount; ++i) {
            this.prayer[i].drain = integer.g1();
        }
    }

    unload() {
        this.obj = [];
        this.npc = [];
        this.texture = [];
        this.anim = [];
        this.loc = [];
        this.modelNames = [];
        this.boundary = [];
        this.roof = [];
        this.tile = [];
        this.projectileSprite = -1;
        this.spell = [];
        this.prayer = [];
    }
}

export default new Config();
