import _ from 'lodash';

class ScriptManager {
    scripts = [];

    register(trigger, on, instance) {
        this.scripts.push({ trigger, on, instance });
    }

    get(player, trigger, on = {}, params = {}, type = 'normal') {
        let script = this.scripts.find(s => s.trigger === trigger && _.isEqual(s.on, on));
        if (!script) {
            // catch-all scripts are useful for debugging but ideally scripts' scopes are limited
            script = this.scripts.find(s => s.trigger === trigger && _.isEqual(s.on, {}));
        }

        if (!script) {
            return null;
        }

        return new script.instance(player, type, trigger, params);
    }
}

export default new ScriptManager();
