// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';

after(() => {
  cy.task('generateReport');
});

Cypress.on('uncaught:exception', (err, runnable) => {
  // Cypress and ResizeObserver authors suggest ignoring this error
  // https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded#comment86691361_49384120
  // https://github.com/quasarframework/quasar/issues/2233#issuecomment-492975745
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
});