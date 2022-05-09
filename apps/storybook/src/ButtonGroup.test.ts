describe('ButtonGroup', () => {
  const storyPath = 'Buttons/ButtonGroup';
  const tests = [
    'With Icons',
    'Overflow',
    'Vertical',
    'Vertical Overflow',
    'Input Button Combo',
  ];

  tests.forEach((testName) => {
    const id = `${storyPath
      .replace('/', '-')
      .toLowerCase()}--${testName.replaceAll(' ', '-').toLowerCase()}`;

    it(testName, () => {
      cy.visit('iframe', { qs: { id } });

      if (testName.includes('Overflow')) {
        cy.get('small').hide();
      }

      cy.compareSnapshot(testName);
    });
  });
});