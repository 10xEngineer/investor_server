'use strict';

module.exports = {
  db: 'mongodb://localhost/investor_prod',
  app: {
    name: 'Investor - Production'
  },
  emailFrom: 'SENDER EMAIL ADDRESS', // sender address like ABC <abc@example.com>
  mailer: {
    service: 'SERVICE_PROVIDER',
    auth: {
      user: 'EMAIL_ID',
      pass: 'PASSWORD'
    }
  }
};
