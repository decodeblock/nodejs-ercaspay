const axios = require('axios');
const winston = require('winston');
const CardEncryptor = require('./Utils/CardEncryptor');
const PayerDeviceDto = require('./Types/PayerDeviceDto');

/**
 * ErcasPay payment gateway client class
 */
class ErcasPay {
  /**
   * Creates a new ErcasPay client instance
   * @param {Object} config Configuration object
   * @param {string} config.baseURL Base URL for API requests
   * @param {string} config.secretKey Secret key for authentication
   * @param {boolean} [config.verifySsl=true] Whether to verify SSL certificates
   * @param {Object} [config.logger=null] Custom logger instance
   */
  constructor({ baseURL, secretKey, verifySsl = true, logger = null }) {
    this.logger =
      logger ||
      winston.createLogger({
        level: 'debug', // Default log level
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(
            ({ timestamp, level, message, ...metadata }) => {
              return `[Ercaspay] ${timestamp} [${level}]: ${message} ${
                Object.keys(metadata).length ? JSON.stringify(metadata) : ''
              }`;
            }
          )
        ),
        transports: [
          new winston.transports.File({ filename: `ercaspay-client.log` }), // Log to a file
        ],
      });
    this.baseURL = baseURL;
    this.secretKey = secretKey;
    this.client = null; // Client will be initialized later
    this.verifySsl = verifySsl; // Store the flag for SSL verification
    this.#initializeClient();
  }

  /**
   * Initializes the Axios HTTP client with required configuration
   * @private
   */
  #initializeClient() {
    this.logger.info('Initiallizing axios client', {
      baseURL: this.baseURL,
      verifySsl: this.verifySsl,
    });
    const httpsAgent = this.verifySsl
      ? undefined // Use default SSL behavior
      : new https.Agent({ rejectUnauthorized: false }); // Disable SSL verification

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.secretKey}`, // Set the Bearer token
        Accept: 'application/json', // Set the Accept header to JSON
        'Content-Type': 'application/json', // Set the Content-Type header to JSON
      },
      httpsAgent, // Attach the agent based on the verifySsl flag
    });
    this.logger.info('Initiallized axios client successfully');
  }

  /**
   * Makes an HTTP request to the API
   * @private
   * @param {string} relativeUrl The relative URL path
   * @param {string} method The HTTP method
   * @param {Object} [data={}] Request payload data
   * @returns {Promise<Object>} API response data
   */
  async #makeRequest(relativeUrl, method, data = {}) {
    this.logger.info('Making API request', {
      url: relativeUrl,
      method,
      data,
    });

    if (!method) {
      this.logger.error('Method cannot be empty when calling makeRequest');
      throw new Error('Method cannot be empty');
    }

    try {
      const response = await this.client[method.toLowerCase()](
        relativeUrl,
        data
      );
      this.logger.info('API request successful');
      return response.data;
    } catch (error) {
      if (error.response) {
        this.logger.error('API error response', {
          data: error.response.data,
          status: error.response.status,
        });
        throw new Error(
          error.response.data.errorMessage ||
            `An error occurred while calling the Ercaspay API on path: ${relativeUrl}`
        );
      }

      this.logger.error('API request error', error.message);
      throw new Error(
        error.message ||
          `An unexpected error occurred while making the API request on path: ${relativeUrl}`
      );
    }
  }

  /**
   * Initiates a new payment transaction
   * @param {Object} data Transaction data
   * @returns {Promise<Object>} Transaction initiation response
   */
  async initiateTransaction(data) {
    this.logger.info('Initiating payment transaction');

    const response = await this.#makeRequest(
      '/api/v1/payment/initiate',
      'POST',
      data
    );
    this.logger.info('Payment transaction initiated successfully', {
      response,
    });

    return response;
  }

  /**
   * Verifies a transaction status
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Transaction verification response
   */
  async verifyTransaction(transactionRef) {
    this.logger.info('Verifying transaction', { transactionRef });
    const response = await this.#makeRequest(
      `/api/v1/payment/transaction/verify/${transactionRef}`,
      'GET'
    );
    this.logger.info('Transaction verification completed', { response });
    return response;
  }

  /**
   * Initiates a bank transfer transaction
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Bank transfer initiation response
   */
  async initiateBankTransfer(transactionRef) {
    this.logger.info('Initiating bank transfer', { transactionRef });
    const response = await this.#makeRequest(
      `/api/v1/payment/bank-transfer/request-bank-account/${transactionRef}`,
      'GET'
    );
    this.logger.info('Bank transfer initiated successfully', { response });
    return response;
  }

  /**
   * Initiates a USSD transaction
   * @param {string} transactionRef Transaction reference
   * @param {string} bankName Bank name
   * @returns {Promise<Object>} USSD transaction initiation response
   */
  async initiateUssdTransaction(transactionRef, bankName) {
    this.logger.info('Initiating USSD transaction', {
      transactionRef,
    });
    const response = await this.#makeRequest(
      `/api/v1/payment/ussd/request-ussd-code/${transactionRef}`,
      'POST',
      { bank_name: bankName }
    );
    this.logger.info('USSD transaction initiated successfully', { response });
    return response;
  }

  /**
   * Gets list of banks supporting USSD payments
   * @returns {Promise<Object>} List of supported banks
   */
  async getBankListForUssd() {
    this.logger.info('Fetching USSD supported banks list');
    const response = await this.#makeRequest(
      '/api/v1/payment/ussd/supported-banks',
      'GET'
    );
    this.logger.debug('Retrieved USSD supported banks', {
      banks: response.responseBody,
    });
    return response;
  }

  /**
   * Generates a unique payment reference UUID
   * @returns {string} Generated UUID
   */
  generatePaymentReferenceUuid() {
    const uuid = require('crypto').randomUUID();
    this.logger.info('Generated payment reference UUID', { uuid });
    return uuid;
  }

  /**
   * Fetches transaction details
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Transaction details
   */
  async fetchTransactionDetails(transactionRef) {
    this.logger.info('Fetching transaction details', { transactionRef });
    const response = await this.#makeRequest(
      `/api/v1/payment/details/${transactionRef}`,
      'GET'
    );
    this.logger.info('Transaction details retrieved', { response });
    return response;
  }

  /**
   * Fetches transaction status
   * @param {string} transactionRef Transaction reference
   * @param {string} paymentReference Payment reference
   * @param {string} paymentMethod Payment method
   * @returns {Promise<Object>} Transaction status
   */
  async fetchTransactionStatus(
    transactionRef,
    paymentReference,
    paymentMethod
  ) {
    this.logger.info('Fetching transaction status', {
      transactionRef,
    });
    const response = await this.#makeRequest(
      `/api/v1/payment/status/${transactionRef}`,
      'POST',
      { payment_method: paymentMethod, reference: paymentReference }
    );
    this.logger.info('Transaction status retrieved', { response });
    return response;
  }

  /**
   * Cancels a transaction
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelTransaction(transactionRef) {
    this.logger.info('Cancelling transaction', { transactionRef });
    const response = await this.#makeRequest(
      `/api/v1/payment/cancel/${transactionRef}`,
      'GET'
    );
    this.logger.info('Transaction cancelled successfully', { response });
    return response;
  }

  /**
   * Initiates a card transaction
   * @param {Object} params Transaction parameters
   * @param {Object} params.request HTTP request object
   * @param {string} params.transactionRef Transaction reference
   * @param {string} params.cardNumber Card number
   * @param {string} params.cardExpiryMonth Card expiry month
   * @param {string} params.cardExpiryYear Card expiry year
   * @param {string} params.cardCvv Card CVV
   * @param {string} params.pin Card PIN
   * @returns {Promise<Object>} Card transaction initiation response
   */
  async initiateCardTransaction({
    request,
    transactionRef,
    cardNumber,
    cardExpiryMonth,
    cardExpiryYear,
    cardCvv,
    pin,
  }) {
    this.logger.info('Initiating card transaction', {
      transactionRef,
    });

    const deviceDetails = PayerDeviceDto.fromRequest(request);

    const encryptor = new CardEncryptor(`${__dirname}/key/public_key.pem`);
    const encryptedCard = encryptor.encrypt({
      cvv: cardCvv,
      pin,
      expiryDate: `${cardExpiryMonth}${cardExpiryYear}`,
      pan: cardNumber,
    });

    const response = await this.#makeRequest(
      '/api/v1/payment/cards/initialize',
      'POST',
      {
        transactionReference: transactionRef,
        payload: encryptedCard,
        deviceDetails,
      }
    );
    this.logger.info('Card transaction initiated successfully', { response });
    return response;
  }

  /**
   * Submits OTP for card transaction
   * @param {string} transactionRef Transaction reference
   * @param {string} paymentReference Payment reference
   * @param {string} otp One-time password
   * @returns {Promise<Object>} OTP submission response
   */
  async submitCardOTP(transactionRef, paymentReference, otp) {
    this.logger.info('Submitting card OTP', {
      transactionRef,
    });
    const response = await this.#makeRequest(
      `/api/v1/payment/cards/otp/submit/${transactionRef}`,
      'POST',
      { otp, gatewayReference: paymentReference }
    );
    this.logger.info('OTP submission completed', { response });
    return response;
  }

  /**
   * Requests OTP resend for card transaction
   * @param {string} transactionRef Transaction reference
   * @param {string} paymentReference Payment reference
   * @returns {Promise<Object>} OTP resend response
   */
  async resendCardOTP(transactionRef, paymentReference) {
    this.logger.info('Requesting OTP resend', {
      transactionRef,
    });
    const response = await this.#makeRequest(
      `/api/v1/payment/cards/otp/resend/${transactionRef}`,
      'POST',
      { gatewayReference: paymentReference }
    );
    this.logger.info('OTP resend completed', { response });
    return response;
  }

  /**
   * Gets saved card details
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Card details
   */
  async getCardDetails(transactionRef) {
    this.logger.info('Fetching saved card details', { transactionRef });
    const response = await this.#makeRequest(
      `/api/v1/payment/cards/details/${transactionRef}`,
      'GET'
    );
    this.logger.info('Card details retrieved successfully', { response });
    return response;
  }

  /**
   * Verifies a card transaction
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Transaction verification response
   */
  async verifyCardTransaction(transactionRef) {
    this.logger.info('Verifying card transaction', { transactionRef });
    const response = await this.#makeRequest(
      '/api/v1/payment/cards/transaction/verify',
      'POST',
      { reference: transactionRef }
    );
    this.logger.info('Transaction verification completed', { response });
    return response;
  }
}

module.exports = ErcasPay;