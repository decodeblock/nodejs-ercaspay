const Ercaspay = require('../src/Ercaspay');

describe('ErcaspayTest', () => {
  beforeEach(() => {
    ercaspay = new Ercaspay({
      baseURL: 'https://api.merchant.staging.ercaspay.com',
      secretKey: 'ECRS-TEST-SK9suJneFkk1o8gBaUmOHCBIt9jRWN88QbaKAvoBRu',
      // verifySsl: false,
    });
  });

  it('should generate a valid payment reference UUID', () => {
    const paymentRef = ercaspay.generatePaymentReferenceUuid();

    // UUID v4 regex pattern
    const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(paymentRef).toMatch(uuidV4Pattern);
  });

  // it('should successfully initiate a transaction', async () => {
  //   const transactionData ={
  //     amount: '100',
  //     paymentReference: ercaspay.generatePaymentReferenceUuid(),
  //     paymentMethods: 'card,bank-transfer,ussd,qrcode',
  //     customerName: 'John Doe',
  //     customerEmail: 'johndoe@gmail.com',
  //     currency: 'NGN',
  //     customerPhoneNumber: '09061626364',
  //     redirectUrl: 'https://omolabakeventures.com',
  //     description: 'The description for this payment goes here',
  //     feeBearer: 'customer',
  //     metadata: {
  //         firstname: 'Ola',
  //         lastname: 'Benson',
  //         email: 'iie@mail.com',
  //     }
  // }

  //   const response = await ercaspay.fetchTransactionDetails('ERCS|20241214230554|1734213954586');
  //   // console.log(response);

  //   expect(true).toBe(true);
  // });
});
