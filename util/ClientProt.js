const ClientProt = {
    DEBUG_INFO: 17,
    REPORT_ABUSE: 51,
    //
    APPEARANCE: 236,
    BANK_CLOSE: 207,
    BANK_DEPOSIT: 205,
    BANK_WITHDRAW: 206,
    CAST_GROUND: 221,
    OPOBJT: 224,
    OPHELDT: 220,
    OPNPCT: 225,
    CAST_OBJECT: 222,
    OPPLAYERT: 226,
    CAST_SELF: 227,
    CAST_WALLOBJECT: 223,
    CHANGE_PASSWORD: 25,
    MESSAGE_PUBLIC: 3,
    CHOOSE_OPTION: 237,
    CLOSE_CONNECTION: 1,
    COMBAT_STYLE: 231,
    CLIENT_CHEAT: 7,
    DUEL_ACCEPT: 199,
    DUEL_CONFIRM_ACCEPT: 198,
    DUEL_DECLINE: 203,
    DUEL_ITEM_UPDATE: 201,
    DUEL_OPTIONS: 200,
    FRIENDLIST_ADD: 26,
    FRIENDLIST_DEL: 27,
    GROUNDITEM_TAKE: 252,
    IGNORELIST_ADD: 29,
    IGNORELIST_DEL: 30,
    INVENTORY_COMMAND: 246,
    INVENTORY_DROP: 251,
    INVENTORY_UNEQUIP: 248,
    INVENTORY_WEAR: 249,
    KNOWN_PLAYERS: 254,
    LOGIN: 0,
    RECONNECT: 19,
    LOGOUT: 6,
    NPC_ATTACK: 244,
    NPC_COMMAND: 195,
    NPC_TALK: 245,
    OBJECT_COMMAND1: 242,
    OBJECT_COMMAND2: 230,
    NO_TIMEOUT: 5,
    PLAYER_ATTACK: 228,
    PLAYER_DUEL: 204,
    PLAYER_FOLLOW: 214,
    PLAYER_TRADE: 235,
    MESSAGE_PRIVATE: 28,
    PRAYER_OFF: 211,
    PRAYER_ON: 212,
    REGISTER: 2,
    SETTINGS_GAME: 213,
    CHAT_SETMODE: 31,
    SHOP_BUY: 217,
    SHOP_CLOSE: 218,
    SHOP_SELL: 216,
    SLEEP_WORD: 193,
    TRADE_ACCEPT: 232,
    TRADE_CONFIRM_ACCEPT: 202,
    TRADE_DECLINE: 233,
    TRADE_ITEM_UPDATE: 234,
    OPOBJU: 250,
    OPHELDU: 240,
    OPNPCU: 243,
    USEWITH_OBJECT: 241,
    OPPLAYERU: 219,
    USEWITH_WALLOBJECT: 239,
    MOVE_GAMECLICK: 194,
    MOVE_OPCLICK: 215,
    WALL_OBJECT_COMMAND1: 238,
    WALL_OBJECT_COMMAND2: 229,
};

// generate reverse lookup

for (let key in ClientProt) {
    ClientProt[ClientProt[key]] = key;
}

export default ClientProt;

export const CLIENT_ENCRYPTION = new Uint16Array(256);
for (let i = 0; i < CLIENT_ENCRYPTION.length; i++) {
    CLIENT_ENCRYPTION[i] = i % 10;
}
CLIENT_ENCRYPTION[ClientProt.RECONNECT] = 712;
CLIENT_ENCRYPTION[ClientProt.LOGIN] = 625;
CLIENT_ENCRYPTION[ClientProt.CLOSE_CONNECTION] = 325;
CLIENT_ENCRYPTION[ClientProt.REGISTER] = 129;
CLIENT_ENCRYPTION[ClientProt.NO_TIMEOUT] = 348;
CLIENT_ENCRYPTION[ClientProt.CHANGE_PASSWORD] = 551;
CLIENT_ENCRYPTION[ClientProt.CHAT_SETMODE] = 777;
CLIENT_ENCRYPTION[ClientProt.IGNORELIST_ADD] = 101;
CLIENT_ENCRYPTION[ClientProt.IGNORELIST_DEL] = 511;
CLIENT_ENCRYPTION[ClientProt.FRIENDLIST_ADD] = 622;
CLIENT_ENCRYPTION[ClientProt.FRIENDLIST_DEL] = 707;
CLIENT_ENCRYPTION[ClientProt.MESSAGE_PRIVATE] = 185;
CLIENT_ENCRYPTION[ClientProt.MESSAGE_PUBLIC] = 643;
CLIENT_ENCRYPTION[ClientProt.CLIENT_CHEAT] = 293;
CLIENT_ENCRYPTION[ClientProt.LOGOUT] = 156;
CLIENT_ENCRYPTION[208] = 457;
CLIENT_ENCRYPTION[253] = 155;
CLIENT_ENCRYPTION[ClientProt.APPEARANCE] = 65;
CLIENT_ENCRYPTION[4] = 848;
CLIENT_ENCRYPTION[8] = 121;
CLIENT_ENCRYPTION[ClientProt.SLEEP_WORD] = 127;
CLIENT_ENCRYPTION[ClientProt.KNOWN_PLAYERS] = 120;
CLIENT_ENCRYPTION[ClientProt.DEBUG_INFO] = 743;
CLIENT_ENCRYPTION[ClientProt.MOVE_OPCLICK] = 592;
CLIENT_ENCRYPTION[ClientProt.MOVE_GAMECLICK] = 770;
CLIENT_ENCRYPTION[ClientProt.CHOOSE_OPTION] = 3;
CLIENT_ENCRYPTION[ClientProt.COMBAT_STYLE] = 700;
CLIENT_ENCRYPTION[196] = 651;
CLIENT_ENCRYPTION[ClientProt.REPORT_ABUSE] = 277;
CLIENT_ENCRYPTION[ClientProt.BANK_WITHDRAW] = 655;
CLIENT_ENCRYPTION[ClientProt.BANK_DEPOSIT] = 523;
CLIENT_ENCRYPTION[ClientProt.BANK_CLOSE] = 886;
CLIENT_ENCRYPTION[ClientProt.SHOP_BUY] = 666;
CLIENT_ENCRYPTION[ClientProt.SHOP_SELL] = 665;
CLIENT_ENCRYPTION[ClientProt.SHOP_CLOSE] = 312;
CLIENT_ENCRYPTION[ClientProt.TRADE_DECLINE] = 235;
CLIENT_ENCRYPTION[ClientProt.TRADE_CONFIRM_ACCEPT] = 96;
CLIENT_ENCRYPTION[ClientProt.TRADE_ITEM_UPDATE] = 500;
CLIENT_ENCRYPTION[ClientProt.TRADE_ACCEPT] = 277;
CLIENT_ENCRYPTION[ClientProt.DUEL_CONFIRM_ACCEPT] = 412;
CLIENT_ENCRYPTION[ClientProt.DUEL_DECLINE] = 266;
CLIENT_ENCRYPTION[ClientProt.DUEL_ITEM_UPDATE] = 53;
CLIENT_ENCRYPTION[ClientProt.DUEL_OPTIONS] = 285;
CLIENT_ENCRYPTION[ClientProt.DUEL_ACCEPT] = 564;
CLIENT_ENCRYPTION[ClientProt.PRAYER_OFF] = 457;
CLIENT_ENCRYPTION[ClientProt.PRAYER_ON] = 126;
CLIENT_ENCRYPTION[ClientProt.SETTINGS_GAME] = 892;
CLIENT_ENCRYPTION[197] = 882;
CLIENT_ENCRYPTION[247] = 888;
CLIENT_ENCRYPTION[ClientProt.OPOBJT] = 821;
CLIENT_ENCRYPTION[ClientProt.OPOBJU] = 346;
CLIENT_ENCRYPTION[ClientProt.GROUNDITEM_TAKE] = 634;
CLIENT_ENCRYPTION[ClientProt.CAST_WALLOBJECT] = 596;
CLIENT_ENCRYPTION[ClientProt.USEWITH_WALLOBJECT] = 792;
CLIENT_ENCRYPTION[ClientProt.WALL_OBJECT_COMMAND1] = 212;
CLIENT_ENCRYPTION[ClientProt.WALL_OBJECT_COMMAND2] = 726;
CLIENT_ENCRYPTION[ClientProt.CAST_OBJECT] = 555;
CLIENT_ENCRYPTION[ClientProt.USEWITH_OBJECT] = 772;
CLIENT_ENCRYPTION[ClientProt.OBJECT_COMMAND1] = 863;
CLIENT_ENCRYPTION[ClientProt.OBJECT_COMMAND2] = 67;
CLIENT_ENCRYPTION[ClientProt.OPHELDT] = 567;
CLIENT_ENCRYPTION[ClientProt.OPHELDU] = 377;
CLIENT_ENCRYPTION[ClientProt.INVENTORY_UNEQUIP] = 466;
CLIENT_ENCRYPTION[ClientProt.INVENTORY_WEAR] = 267;
CLIENT_ENCRYPTION[ClientProt.INVENTORY_COMMAND] = 237;
CLIENT_ENCRYPTION[ClientProt.INVENTORY_DROP] = 664;
CLIENT_ENCRYPTION[ClientProt.OPNPCT] = 824;
CLIENT_ENCRYPTION[ClientProt.OPNPCU] = 876;
CLIENT_ENCRYPTION[ClientProt.NPC_TALK] = 586;
CLIENT_ENCRYPTION[ClientProt.NPC_COMMAND] = 543;
CLIENT_ENCRYPTION[ClientProt.NPC_ATTACK] = 754;
CLIENT_ENCRYPTION[ClientProt.OPPLAYERT] = 117;
CLIENT_ENCRYPTION[ClientProt.OPPLAYERU] = 145;
CLIENT_ENCRYPTION[ClientProt.PLAYER_ATTACK] = 414;
CLIENT_ENCRYPTION[ClientProt.PLAYER_DUEL] = 273;
CLIENT_ENCRYPTION[ClientProt.PLAYER_TRADE] = 636;
CLIENT_ENCRYPTION[ClientProt.PLAYER_FOLLOW] = 596;
CLIENT_ENCRYPTION[ClientProt.CAST_GROUND] = 545;
CLIENT_ENCRYPTION[ClientProt.CAST_SELF] = 411;
