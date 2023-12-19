class EntityStatus extends Number {}

EntityStatus.ERROR = new EntityStatus(0);
EntityStatus.CREATE = new EntityStatus(1);
EntityStatus.ENABLED = new EntityStatus(2);
EntityStatus.DESTROY = new EntityStatus(3);
EntityStatus.DESTROYED = new EntityStatus(4);
EntityStatus.ENABLE = new EntityStatus(5);
EntityStatus.DISABLE = new EntityStatus(6);
EntityStatus.DISABLED = new EntityStatus(7);

module.exports = EntityStatus;
