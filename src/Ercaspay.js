const axios = require('axios');
const winston = require('winston');
const CardEncryptor = require('./Utils/CardEncryptor');
const PayerDeviceDto = require('./Types/PayerDeviceDto');

/**
 * Author: Gabriel Ibenye
 * GitHub: https://github.com/gabbyTI
 * Email: gabrielibenye@gmail.com
 * Created: December 11, 2024
 */

/**
 * ErcasPay payment gateway client class
 *
 * A client implementation for interacting with the ErcasPay payment gateway API.
 * Provides methods for initiating and managing payment transactions including:
 * - Card payments
 * - Bank transfers
 * - USSD transactions
 * - Transaction verification
 * - Transaction status checks
 * - Transaction cancellation
 *
 * @class Ercaspay
 * @param {Object} config Configuration object
 * @param {string} config.baseURL Base URL for API requests
 * @param {string} config.secretKey Secret key for authentication
 * @param {Object} [config.logger=null] Custom logger instance
 */
class ErcasPay {
  constructor({ baseURL, secretKey, logger = null }) {
    this.logger =
      logger ||
      winston.createLogger({
        level: 'info', // Default log level
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...metadata }) => {
            return `[Ercaspay] ${timestamp} [${level}]: ${message} ${
              Object.keys(metadata).length ? JSON.stringify(metadata) : ''
            }`;
          }),
        ),
        transports: [
          new winston.transports.File({ filename: `ercaspay-client.log` }), // Log to a file
        ],
      });
    this.baseURL = baseURL;
    this.secretKey = secretKey;
    this.client = null; // Client will be initialized later
    this.#initializeClient();
  }

  /**
   * Initializes the Axios HTTP client with required configuration
   * @private
   */
  #initializeClient() {
    this.logger.debug('Initiallizing axios client', {
      baseURL: this.baseURL,
    });
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.secretKey}`, // Set the Bearer token
        Accept: 'application/json', // Set the Accept header to JSON
        'Content-Type': 'application/json', // Set the Content-Type header to JSON
      },
    });
    this.logger.debug('Initiallized axios client successfully');
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
    this.logger.debug('Making API request', {
      url: relativeUrl,
      method,
    });

    if (!method) {
      this.logger.error('Method cannot be empty when calling makeRequest');
      throw new Error('Method cannot be empty');
    }

    try {
      const response = await this.client[method.toLowerCase()](relativeUrl, data);
      this.logger.debug('API request successful');
      return response.data;
    } catch (error) {
      if (error.response) {
        this.logger.error('API error response', {
          data: error.response.data,
          status: error.response.status,
        });
        const err = new Error(
          error.response?.data?.errorMessage ||
            `An error occurred while calling the Ercaspay API on path: ${relativeUrl}`,
        );
        err.statusCode = error.response?.status;
        err.responseData = error.response?.data;
        throw err;
      }

      this.logger.error('API request error', error.message);
      const err = new Error(
        error.message || `An unexpected error occurred while making the API request on path: ${relativeUrl}`,
      );
      err.statusCode = 500;
      err.responseData = null;
      throw err;
    }
  }

  /**
   * Initiates a new payment transaction
   * @param {Object} data Transaction data
   * @returns {Promise<Object>} Transaction initiation response
   */
  async initiateTransaction(data) {
    this.logger.debug('Initiating payment transaction');

    const response = await this.#makeRequest('/api/v1/payment/initiate', 'POST', data);
    this.logger.debug('Payment transaction initiated successfully', {
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
    this.logger.debug('Verifying transaction', { transactionRef });
    const response = await this.#makeRequest(`/api/v1/payment/transaction/verify/${transactionRef}`, 'GET');
    this.logger.debug('Transaction verification completed', { response });
    return response;
  }

  /**
   * Initiates a bank transfer transaction
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Bank transfer initiation response
   */
  async initiateBankTransfer(transactionRef) {
    this.logger.debug('Initiating bank transfer', { transactionRef });
    const response = await this.#makeRequest(
      `/api/v1/payment/bank-transfer/request-bank-account/${transactionRef}`,
      'GET',
    );
    this.logger.debug('Bank transfer initiated successfully', { response });
    return response;
  }

  /**
   * Initiates a USSD transaction
   * @param {string} transactionRef Transaction reference
   * @param {string} bankName Bank name
   * @returns {Promise<Object>} USSD transaction initiation response
   */
  async initiateUssdTransaction(transactionRef, bankName) {
    this.logger.debug('Initiating USSD transaction', {
      transactionRef,
    });
    const response = await this.#makeRequest(`/api/v1/payment/ussd/request-ussd-code/${transactionRef}`, 'POST', {
      bank_name: bankName,
    });
    this.logger.debug('USSD transaction initiated successfully', { response });
    return response;
  }

  /**
   * Gets list of banks supporting USSD payments
   * @returns {Promise<Object>} List of supported banks
   */
  async getBankListForUssd() {
    this.logger.debug('Fetching USSD supported banks list');
    const response = await this.#makeRequest('/api/v1/payment/ussd/supported-banks', 'GET');
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
    this.logger.debug('Generated payment reference UUID', { uuid });
    return uuid;
  }

  /**
   * Fetches transaction details
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Transaction details
   */
  async fetchTransactionDetails(transactionRef) {
    this.logger.debug('Fetching transaction details', { transactionRef });
    const response = await this.#makeRequest(`/api/v1/payment/details/${transactionRef}`, 'GET');
    this.logger.debug('Transaction details retrieved', { response });
    return response;
  }

  /**
   * Fetches transaction status
   * @param {string} transactionRef Transaction reference
   * @param {string} paymentReference Payment reference
   * @param {string} paymentMethod Payment method
   * @returns {Promise<Object>} Transaction status
   */
  async fetchTransactionStatus(transactionRef, paymentReference, paymentMethod) {
    this.logger.debug('Fetching transaction status', {
      transactionRef,
    });
    const response = await this.#makeRequest(`/api/v1/payment/status/${transactionRef}`, 'POST', {
      payment_method: paymentMethod,
      reference: paymentReference,
    });
    this.logger.debug('Transaction status retrieved', { response });
    return response;
  }

  /**
   * Cancels a transaction
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelTransaction(transactionRef) {
    this.logger.debug('Cancelling transaction', { transactionRef });
    const response = await this.#makeRequest(`/api/v1/payment/cancel/${transactionRef}`, 'GET');
    this.logger.debug('Transaction cancelled successfully', { response });
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
    this.logger.debug('Initiating card transaction', {
      transactionRef,
    });

    const deviceDetails = PayerDeviceDto.fromRequest(request).toArray();
    this.logger.debug('Device details captured', deviceDetails);

    const encryptor = new CardEncryptor(`${__dirname}/key/rsa_public_key.pub`);
    const encryptedCard = encryptor.encrypt({
      cvv: cardCvv,
      pin,
      expiryDate: `${cardExpiryMonth}${cardExpiryYear}`,
      pan: cardNumber,
    });

    const response = await this.#makeRequest('/api/v1/payment/cards/initialize', 'POST', {
      transactionReference: transactionRef,
      payload: encryptedCard,
      deviceDetails,
    });
    this.logger.debug('Card transaction initiated successfully', { transactionRef });
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
    this.logger.debug('Submitting card OTP', {
      transactionRef,
    });
    const response = await this.#makeRequest(`/api/v1/payment/cards/otp/submit/${transactionRef}`, 'POST', {
      otp,
      gatewayReference: paymentReference,
    });
    this.logger.debug('OTP submission completed', { response });
    return response;
  }

  /**
   * Requests OTP resend for card transaction
   * @param {string} transactionRef Transaction reference
   * @param {string} paymentReference Payment reference
   * @returns {Promise<Object>} OTP resend response
   */
  async resendCardOTP(transactionRef, paymentReference) {
    this.logger.debug('Requesting OTP resend', {
      transactionRef,
    });
    const response = await this.#makeRequest(`/api/v1/payment/cards/otp/resend/${transactionRef}`, 'POST', {
      gatewayReference: paymentReference,
    });
    this.logger.debug('OTP resend completed', { response });
    return response;
  }

  /**
   * Gets saved card details
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Card details
   */
  async getCardDetails(transactionRef) {
    this.logger.debug('Fetching saved card details', { transactionRef });
    const response = await this.#makeRequest(`/api/v1/payment/cards/details/${transactionRef}`, 'GET');
    this.logger.debug('Card details retrieved successfully', { response });
    return response;
  }

  /**
   * Verifies a card transaction
   * @param {string} transactionRef Transaction reference
   * @returns {Promise<Object>} Transaction verification response
   */
  async verifyCardTransaction(transactionRef) {
    this.logger.debug('Verifying card transaction', { transactionRef });
    const response = await this.#makeRequest('/api/v1/payment/cards/transaction/verify', 'POST', {
      reference: transactionRef,
    });
    this.logger.debug('Transaction verification completed', { response });
    return response;
  }
}

module.exports = ErcasPay;
