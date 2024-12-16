/**
* Author: Gabriel Ibenye
* GitHub: https://github.com/gabbyTI
* Email: gabrielibenye@gmail.com
* Created: December 11, 2024
*/

class BrowserDetails {
  constructor({
    challengeWindowSize,
    acceptHeaders,
    colorDepth,
    javaEnabled,
    language,
    screenHeight,
    screenWidth,
    timeZone,
  }) {
    this.challengeWindowSize = challengeWindowSize;
    this.acceptHeaders = acceptHeaders;
    this.colorDepth = colorDepth;
    this.javaEnabled = javaEnabled;
    this.language = language;
    this.screenHeight = screenHeight;
    this.screenWidth = screenWidth;
    this.timeZone = timeZone;
  }

  // Static factory method (can handle Express's req or Koa's ctx.request)
  static fromRequest(request) {
    const headers = request.headers || {};

    return new BrowserDetails({
      challengeWindowSize: 'FULL_SCREEN',
      acceptHeaders: headers.accept || 'application/json',
      colorDepth: 24,
      javaEnabled: true,
      language: 'en-US',
      screenHeight: 473,
      screenWidth: 1600,
      timeZone: 273,
    });
  }

  toArray() {
    return {
      '3DSecureChallengeWindowSize': this.challengeWindowSize,
      acceptHeaders: this.acceptHeaders,
      colorDepth: this.colorDepth,
      javaEnabled: this.javaEnabled,
      language: this.language,
      screenHeight: this.screenHeight,
      screenWidth: this.screenWidth,
      timeZone: this.timeZone,
    };
  }
}

module.exports = BrowserDetails;
