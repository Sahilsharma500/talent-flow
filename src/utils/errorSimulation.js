export class SimulatedError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'SimulatedError';
    this.statusCode = statusCode;
  }
}

export const simulateNetworkError = () => {
  const errors = [
    new SimulatedError('Network timeout', 408),
    new SimulatedError('Server overloaded', 503),
    new SimulatedError('Internal server error', 500),
  ];
  throw errors[Math.floor(Math.random() * errors.length)];
};
