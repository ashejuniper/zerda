class ScriptStatus extends Number {}

ScriptStatus.ERROR = new ScriptStatus(0);
ScriptStatus.ADD = new ScriptStatus(1);
ScriptStatus.ADDED = new ScriptStatus(2);
ScriptStatus.ENABLED = new ScriptStatus(3);
ScriptStatus.REMOVE = new ScriptStatus(4);
ScriptStatus.REMOVED = new ScriptStatus(5);
ScriptStatus.ENABLE = new ScriptStatus(6);
ScriptStatus.DISABLE = new ScriptStatus(7);
ScriptStatus.DISABLED = new ScriptStatus(8);

module.exports = ScriptStatus;
