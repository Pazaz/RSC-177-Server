import World from '#engine/World.js';
import { BaseScript } from '#scripts/BaseScript.js';
import ScriptManager from '#scripts/ScriptManager.js';

class Test extends BaseScript {
    *run(player) {
        player.messageGame(`test: ${World.clocks.map}`);
        yield this.wait(1);
        player.messageGame(`test: ${World.clocks.map}`);
    }
}

ScriptManager.register('test', {}, Test);
