const Device = require('./Device');

/**
* Author: Gabriel Ibenye
* GitHub: https://github.com/gabbyTI
* Email: gabrielibenye@gmail.com
* Created: December 11, 2024
*/

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
