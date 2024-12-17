# Node.js Ercaspay Integration

[![License](https://img.shields.io/github/license/decodeblock/nodejs-ercaspay.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Latest Version](https://img.shields.io/npm/v/@decodeblock/nodejs-ercaspay.svg?style=flat-square)](https://www.npmjs.com/package/@decodeblock/nodejs-ercaspay)
[![Tests Status](https://img.shields.io/github/actions/workflow/status/decodeblock/nodejs-ercaspay/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/decodeblock/nodejs-ercaspay/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/npm/dt/@decodeblock/nodejs-ercaspay.svg?style=flat-square)](https://www.npmjs.com/package/@decodeblock/nodejs-ercaspay)
[![Contributors](https://img.shields.io/github/contributors/decodeblock/nodejs-ercaspay.svg?style=flat-square)](https://github.com/decodeblock/nodejs-ercaspay/graphs/contributors)

A Node.js package for seamless integration with the Ercaspay API, providing utilities for encrypting card details, initiating payment transactions, and more.

## Features

- **Card Encryption:** Securely encrypt sensitive card details using a public key.
- **Transaction Initiation:** Easily initiate payment transactions.
- **Logging Support:** Includes customizable logging support with Winston.

## Requirement

- You need to reference the Ercaspay API documentation. [Click here for the documentation](https://docs.ercaspay.com/#2f601f17-0bde-44ba-971a-f8458cadb213)

## Installation

Install the package using npm:

```bash
npm install @decodeblock/nodejs-ercaspay
```

## Usage

### Setting Up the Client
First, import the package and initialize the client with your configurations.

```javascript
const Ercaspay = require('@decodeblock/nodejs-ercaspay');

const ercaspay = new Ercaspay({
  baseUrl: 'https://api.ercaspay.com', // Base URL of the API
  secretKey: 'your-key', // Secret key from Ercaspay
  logger: logger // (optional) your winston instance (default output: ercaspay-client.log default log level: 'info')
});
```

### Initiating a Payment Transaction
Send payment details to initiate a transaction.

```javascript
  const transactionData ={
    amount: '100',
    paymentReference: ercaspay.generatePaymentReferenceUuid(),
    paymentMethods: 'card,bank-transfer,ussd',
    customerName: 'John Doe',
    customerEmail: 'johndoe@gmail.com',
    currency: 'NGN',
    customerPhoneNumber: '09061626364',
    redirectUrl: 'https://omolabakeventures.com',
    description: 'The description for this payment goes here',
    feeBearer: 'customer',
    metadata: {
        firstname: 'Ola',
        lastname: 'Benson',
        email: 'iie@mail.com',
    }
  }
  try {
    const response = await ercaspay.initiateTransaction(transactionData);

    console.log('Transaction Response:', response);
  } catch (error) {
    console.error('Error initiating transaction:', error.responseData || error.message);
  }

```

### Initiating Card Transaction

```javascript
try {
  const response = await ercaspay.initiateCardTransaction({
    request: req, // The request object of any Node.js framework being used (eg: Express.js)
    transactionRef:'ERCS|20241214202721|1734204441927',
    cardCvv: '111',
    cardNumber: '252435456456756756756787865',
    cardExpiryMonth: '12',
    cardExpiryYear: '2025',
    cardPin: '1234',
  });

  res.status(200).json({
    success: true,
    message: 'Transaction initiated successfully',
    data: response,
  });
} catch (error) {
  console.error('Error initiating transaction:', error);
  res.status(error.statusCode).json({
    success: false,
    message: 'Failed to initiate transaction',
    error: error.message,
  });
}
```
## Configuration

- **`baseUrl`**: The base URL of the Ercaspay API.
- **`secretKey`**: The Secret key for authenticating requests.
- **`logger`**: Custom logger instance (e.g., Winston) for logging requests and errors.

## Error Handling

The package throws errors in cases like:
- API response errors.

Example of handling errors:

```javascript
try {
  const response = await ercaspay.initiateTransaction(data);
} catch (error) {
  console.error('Error:', error.responseData || error.message);
}
```

## Logging

This package provides logging capabilities with [winston](https://www.npmjs.com/package/winston) to help you monitor and troubleshoot API interactions and errors. By default, important information about API requests, responses, and exceptions is logged, which can be useful for debugging and keeping track of system behavior.

### What is Logged?

The package logs the following information:

#### 1. API Request Details:

-   URL of the API endpoint
-   HTTP method (GET, POST, etc.)

#### 2. API Response Details:

-   HTTP status code of the response
-   Response body (if available)
-   Error messages (for failed requests)

#### 3. Exceptions:

-   Details of exceptions, including client and server errors
-   Stack trace and error context for easier debugging

### Configuring custom Logger

```javascript
import Ercaspay from '@decodeblock/nodejs-ercaspay';
import winston from 'winston';

// Create a logger instance
const logger = winston.createLogger({
    level: 'info',  // Default log level
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
            return `${timestamp} [${level}]: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
        })
    ),
    transports: [
        new winston.transports.Console(),  // Log to the console
        new winston.transports.File({ filename: 'app.log' }),  // Log to a file
    ],
});

// Initialize your Ercaspay client
const ercaspay = new Ercaspay({
  baseUrl: 'https://api.ercaspay.com', // Base URL of the API
  secretKey: 'your-key', // Secret key from Ercaspay
  logger: logger, // Replace with your secret key
});

```
## Available Methods

| Method Name                        | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| `initiateTransaction(data)`        | Initiates a new payment transaction.                                        |
| `verifyTransaction(transactionRef)`| Verifies the status of a transaction.                                       |
| `initiateBankTransfer(transactionRef)` | Initiates a bank transfer transaction.                                     |
| `initiateUssdTransaction(transactionRef, bankName)` | Initiates a USSD transaction.                              |
| `getBankListForUssd()`             | Retrieves a list of banks supporting USSD payments.                         |
| `generatePaymentReferenceUuid()`   | Generates a unique payment reference UUID.                                  |
| `fetchTransactionDetails(transactionRef)` | Fetches details of a specific transaction.                                |
| `fetchTransactionStatus(transactionRef, paymentReference, paymentMethod)` | Fetches the status of a transaction. |
| `cancelTransaction(transactionRef)` | Cancels a transaction.                                                     |
| `initiateCardTransaction({params})`  | Initiates a card payment transaction.                                       |
| `submitCardOTP(transactionRef, paymentReference, otp)` | Submits OTP for a card transaction.                             |
| `resendCardOTP(transactionRef, paymentReference)` | Requests OTP resend for a card transaction.                        |
| `getCardDetails(transactionRef)`   | Retrieves saved card details for a transaction.                             |
| `verifyCardTransaction(transactionRef)` | Verifies a card transaction.                                             |

## Changelog

Detailed changes for each release are documented in the [CHANGELOG](CHANGELOG.md).

---

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING](CONTRIBUTING.md) guide for details.

---

## Credits

-   **[Gabriel Ibenye](https://github.com/gabbyti)**
-   [All Contributors](../../contributors)

---

## License

This project is licensed under the [MIT License](LICENSE).

