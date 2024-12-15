const BrowserDetails = require("./BrowserDetails");

class Device {
  constructor({browser, browserDetails, ipAddress}) {
    this.browser = browser;
    this.browserDetails = browserDetails;
    this.ipAddress = ipAddress;
  }

  // Static factory method (can handle Express's req or Koa's ctx.request)
  static fromRequest(request) {
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const ipAddress = request.ip || request.connection.remoteAddress || '127.0.0.1';
    const browserDetails = BrowserDetails.fromRequest(request);
    
    return new Device({userAgent, browserDetails, ipAddress});
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
