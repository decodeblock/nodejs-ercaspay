const Device = require('./Device');

class PayerDeviceDto {
  constructor(device) {
    this.device = device;
  }

  // Static factory method
  static fromRequest(request) {
    return new PayerDeviceDto(Device.fromRequest(request));
  }

  toArray() {
    return {
      payerDeviceDto: {
        device: this.device.toArray(),
      },
    };
  }
}

module.exports = PayerDeviceDto;
