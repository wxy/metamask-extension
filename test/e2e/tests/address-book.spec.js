const { strict: assert } = require('assert');
const { convertToHexValue, withFixtures } = require('../helpers');

describe('Address Book', function () {
  const ganacheOptions = {
    accounts: [
      {
        secretKey:
          '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
        balance: convertToHexValue(25000000000000000000),
      },
    ],
  };
  it('Adds an entry to the address book and sends eth to that address', async function () {
    await withFixtures(
      {
        fixtures: 'imported-account',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.clickElement('[data-testid="eth-overview-send"]');

        await driver.fill(
          'input[placeholder="Search, public address (0x), or ENS"]',
          '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        );

        await driver.clickElement('.dialog.send__dialog.dialog--message');

        // wait for address book modal to be visible
        const addressModal = await driver.findElement('.nickname-popover');

        await driver.clickElement('.nickname-popover__footer-button');
        await driver.findElement('.update-nickname__wrapper');

        await driver.fill(
          '.update-nickname__content__text-field input',
          'Test Name 1',
        );
        await driver.clickElement('.update-nickname__save');
        // wait for address book modal to be removed from DOM
        await addressModal.waitForElementState('hidden');

        const inputAmount = await driver.findElement('.unit-input__input');
        await inputAmount.fill('1');

        const inputValue = await inputAmount.getProperty('value');
        assert.equal(inputValue, '1');

        await driver.clickElement({ text: 'Next', tag: 'button' });

        await driver.clickElement({ text: 'Confirm', tag: 'button' });

        await driver.clickElement('[data-testid="home__activity-tab"]');
        await driver.wait(async () => {
          const confirmedTxes = await driver.findElements(
            '.transaction-list__completed-transactions .transaction-list-item',
          );
          return confirmedTxes.length === 1;
        }, 10000);

        await driver.waitForSelector(
          {
            css: '.transaction-list-item__primary-currency',
            text: '-1 ETH',
          },
          { timeout: 10000 },
        );
      },
    );
  });
  it('Sends to an address book entry', async function () {
    await withFixtures(
      {
        fixtures: 'address-entry',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.clickElement('[data-testid="eth-overview-send"]');
        const recipientRowTitle = await driver.findElement(
          '.send__select-recipient-wrapper__group-item__title',
        );

        const recipientRowTitleString = await recipientRowTitle.getText();
        assert.equal(recipientRowTitleString, 'Test Name 1');
        await driver.clickElement(
          '.send__select-recipient-wrapper__group-item',
        );

        await driver.fill('.unit-input__input', '2');

        await driver.clickElement({ text: 'Next', tag: 'button' });

        await driver.clickElement({ text: 'Confirm', tag: 'button' });

        await driver.clickElement('[data-testid="home__activity-tab"]');
        await driver.wait(async () => {
          const confirmedTxes = await driver.findElements(
            '.transaction-list__completed-transactions .transaction-list-item',
          );
          return confirmedTxes.length === 1;
        }, 10000);

        await driver.waitForSelector(
          {
            css: '.transaction-list-item__primary-currency',
            text: '-2 ETH',
          },
          { timeout: 10000 },
        );
      },
    );
  });

  it('Edit entry in address book', async function () {
    await withFixtures(
      {
        fixtures: 'address-entry',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.clickElement('.identicon__address-wrapper');
        await driver.clickElement({ text: 'Settings', tag: 'div' });
        await driver.clickElement({ text: 'Contacts', tag: 'div' });
        await driver.clickElement('[data-testid="recipient"]');

        await driver.clickElement({ text: 'Edit', tag: 'button' });
        const inputUsername = await driver.findElement('#nickname');
        await inputUsername.clear();
        await inputUsername.fill('Test Name Edit');

        const inputAddress = await driver.findElement('#address');
        await inputAddress.clear();
        await inputAddress.fill('0x74cE91B75935D6Bedc27eE002DeFa566c5946f74');

        await driver.clickElement('[data-testid="page-container-footer-next"]');

        const recipientUsername = await driver.findElement({
          text: 'Test Name Edit',
          tag: 'div',
        });
        assert.equal(
          await recipientUsername.getText(),
          'Test Name Edit',
          'Username is not edited correctly',
        );

        const recipientAddress = await driver.findElement(
          '.send__select-recipient-wrapper__group-item__subtitle',
        );
        assert.equal(
          await recipientAddress.getText(),
          '0x74cE...6f74',
          'Recipient address is not edited correctly',
        );
      },
    );
  });

  it('Adds an entry to address book and deletes it from address book', async function () {
    await withFixtures(
      {
        fixtures: 'address-entry',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        await driver.clickElement('.identicon__address-wrapper');
        await driver.clickElement({ text: 'Settings', tag: 'div' });
        await driver.clickElement({ text: 'Contacts', tag: 'div' });

        const contacts = await driver.findElements(
          '.send__select-recipient-wrapper__group-item',
        );
        assert.equal(contacts.length, 1);
        //adding new account
        await driver.clickElement({ text: 'Add contact', tag: 'button' });
        const inputUsername = await driver.findElement('#nickname');
        await inputUsername.clear();
        await inputUsername.fill('Test Name Edit');

        const inputAddress = await driver.findElement(
          '[data-testid="ens-input"]',
        );
        await inputAddress.clear();
        await inputAddress.fill('0x74cE91B75935D6Bedc27eE002DeFa566c5946f74');

        // had to put delay since Save button is always enabled and it need some delay to write in address in input field
        await driver.delay(500);
        await driver.clickElement('[data-testid="page-container-footer-next"]');

        await driver.clickElement({ text: 'Test Name Edit', tag: 'div' });
        await driver.clickElement({ text: 'Edit', tag: 'button' });
        await driver.clickElement({ text: 'Delete account', tag: 'a' });
        //it checks if account is deleted
        assert.equal(contacts.length, 1);
      },
    );
  });
});
