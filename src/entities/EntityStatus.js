class EntityStatus extends Number {}

EntityStatus.ERROR = new EntityStatus(0);
EntityStatus.CREATE = new EntityStatus(1);
EntityStatus.CREATED = new EntityStatus(2);
EntityStatus.ENABLED = new EntityStatus(3);
EntityStatus.DESTROY = new EntityStatus(4);
EntityStatus.DESTROYED = new EntityStatus(5);
EntityStatus.ENABLE = new EntityStatus(6);
EntityStatus.DISABLE = new EntityStatus(7);
EntityStatus.DISABLED = new EntityStatus(8);

module.exports = EntityStatus;
