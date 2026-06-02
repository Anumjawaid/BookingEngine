const Rate = require('../models/rateModel');
const logger = require('../config/logger');

class PricingService {
  /**
   * Evaluates exact trip costs dynamically
   * @param {string} origin - Starting city location name
   * @param {string} destination - Dropping city location name
   * @param {number} distanceInKm - Calculated travel route physical distance
   * @param {string} vehicleType - Choice of fleet ('Sedan', 'SUV', 'Luxury')
   * @param {string} conditionalFactor - External real-world conditions ('Standard', 'RushHour', 'Midnight', 'SevereWeather')
   */
  async calculateTripFare(origin, destination, distanceInKm, vehicleType, conditionalFactor = 'Standard') {
    // 1. Fetch matching pricing matrix rules from database
    const pricingMatrix = await Rate.findOne({
      originCity: { $regex: new RegExp(`^${origin}$`, 'i') },
      destinationCity: { $regex: new RegExp(`^${destination}$`, 'i') },
      vehicleType
    });

    if (!pricingMatrix) {
      const error = new Error(`No pricing tier records matching a ${vehicleType} transit from ${origin} to ${destination} could be found.`);
      error.statusCode = 404;
      throw error;
    }

    // 2. Establish dynamic surge multiplier thresholds
    const surgeMultipliers = {
      Standard: 1.0,
      RushHour: 1.4,      // 40% Pricing Spike
      Midnight: 1.2,      // 20% Off-Peak Premium
      SevereWeather: 1.6  // 60% Maximum Hazard Multiplier
    };

    const activeMultiplier = surgeMultipliers[conditionalFactor] || 1.0;

    // 3. Run the core architectural calculation formula
    const rawVariableCost = distanceInKm * pricingMatrix.perKmRate;
    const finalCalculatedFare = pricingMatrix.basePrice + (rawVariableCost * activeMultiplier);

    // Round cleanly to 2 decimal places for financial tracking accuracy
    const finalizedCost = Math.round((finalCalculatedFare + Number.EPSILON) * 100) / 100;

    logger.info(`Pricing Matrix Engine Computed: Fares for [${origin} ➔ ${destination}] calculated at $${finalizedCost} under pricing conditions: [${conditionalFactor}].`);

    return {
      basePrice: pricingMatrix.basePrice,
      perKmRate: pricingMatrix.perKmRate,
      appliedMultiplier: activeMultiplier,
      distanceMetrics: `${distanceInKm} Km`,
      estimatedTotalFare: finalizedCost
    };
  }
}

module.exports = new PricingService();