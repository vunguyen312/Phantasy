const burn = (target, data) => {
    const { health } = target.stats;
    const { damage } = data;
    health = Math.max(0, health - damage);
};

module.exports = burn;