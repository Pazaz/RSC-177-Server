import World from '#engine/World.js';

export class BaseScript {
    player = null;
    type = ''; // queue level: weak, normal, strong, soft
    trigger = '';
    params = {};
    clock = -1; // execution clock

    state = null;
    done = false;
    condition = null; // pause condition
    choice = -1; // p_choice condition result
    count = -1; // p_countdialog condition result

    constructor(player, type, trigger, params) {
        this.player = player;
        this.type = type;
        this.trigger = trigger;
        this.params = params;
        this.clock = World.clocks.map;
    }

    future() {
        return this.player.delay > 0 || this.clock > World.clocks.map;
    }

    // returns true if the script is ready to run
    checkCondition() {
        if (this.condition === null) {
            return true;
        }

        return false;
    }

    // returns true if the script is done
    *run(player) {
        return true;
    }

    // returns true if the script is done
    execute() {
        if (this.done) {
            return true;
        }

        if (!this.state) {
            this.state = this.run(this.player);
        }

        if (!this.checkCondition()) {
            return this.wait();
        }

        while (this.checkCondition() && !this.future() && !this.done) {
            let result = this.state.next();
            this.done = result.done || result.value === true || typeof result.value === 'undefined';
        }

        return this.done;
    }

    wait(delay = 1) {
        this.clock = World.clocks.map + delay;
        return false;
    }

    // ---- runescript ----
}
