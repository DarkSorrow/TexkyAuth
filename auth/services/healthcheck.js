class HealthCheck {
  health = 0;

  /**
   * Set health value
   * @param {number} val 
   */
  setHealth(val) {
    this.health = val;
  }
}

export const healthCheck = new HealthCheck();
