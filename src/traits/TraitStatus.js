class TraitStatus extends Number {}

TraitStatus.ERROR = new TraitStatus(0);
TraitStatus.ADD = new TraitStatus(1);
TraitStatus.ADDED = new TraitStatus(2);
TraitStatus.ENABLED = new TraitStatus(3);
TraitStatus.REMOVE = new TraitStatus(4);
TraitStatus.REMOVED = new TraitStatus(5);
TraitStatus.ENABLE = new TraitStatus(6);
TraitStatus.DISABLE = new TraitStatus(7);
TraitStatus.DISABLED = new TraitStatus(8);

module.exports = TraitStatus;
