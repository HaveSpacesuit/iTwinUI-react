describe('Modal', () => {
  const storyPath = 'Core/Modal';
  const tests = ['Basic', 'Full Page Modal', 'Non Dismissible Modal'];

  tests.forEach((testName) => {
    it(testName, function () {
      cy.storyId(storyPath, testName).as('id');
      cy.visit('iframe', { qs: { id: this.id } });
      cy.get('.iui-button').first().click();
      cy.compareSnapshot(testName);
    });
  });
});
