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
    const acceptLanguage = headers['accept-language'] || 'en-US';

    return new BrowserDetails({
      challengeWindowSize: 'FULL_SCREEN', // Default value, could be dynamically set
      acceptHeaders: headers.accept || 'application/json',
      colorDepth: 24, // Static value, might be dynamically set based on user agent or other data
      javaEnabled: true, // Example value, could be detected if necessary
      language: acceptLanguage,
      screenHeight: 473, // Can be dynamically calculated if necessary
      screenWidth: 1600, // Can be dynamically calculated if necessary
      timeZone: 273, // Default time zone, can be dynamically calculated
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
