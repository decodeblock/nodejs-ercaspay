const BrowserDetails = require('./BrowserDetails');

/**
* Author: Gabriel Ibenye
* GitHub: https://github.com/gabbyTI
* Email: gabrielibenye@gmail.com
* Created: December 11, 2024
*/

class Device {
  constructor({ browser, browserDetails, ipAddress }) {
    this.browser = browser;
    this.browserDetails = browserDetails;
    this.ipAddress = ipAddress;
  }

  // Static factory method (can handle Express's req or Koa's ctx.request)
  static fromRequest(request) {
    var ip = request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';

    if (ip.substr(0, 7) == '::ffff:') {
      ip = ip.substr(7);
    }

    const browser = request.headers['user-agent'] || 'Unknown';
    const ipAddress = ip;
    const browserDetails = BrowserDetails.fromRequest(request);

    return new Device({ browser, browserDetails, ipAddress });
  }

  toArray() {
    return {
      browser: this.browser,
      browserDetails: this.browserDetails.toArray(),
      ipAddress: this.ipAddress,
    };
  }
}

module.exports = Device;
