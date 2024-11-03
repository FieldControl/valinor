import { registerLogin, createBoard } from "../helpers";

describe('Board', function () {
  before( (browser) =>{
    registerLogin(browser);
  });

  it('Test Board Creation',  function (browser) {
    createBoard(browser);
  });
  it('Test Board Deletion',  function (browser) {

    browser.elements('css selector', 'button.delete-board.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base',  function (result) {
      const initialCount: any = result.value;
      const length = initialCount.length;
      browser.click('button.delete-board.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base');
      browser.pause(1000);
      browser.acceptAlert()
      browser.pause(5000);
      browser.elements('css selector', 'button.delete-board.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base',  function (resultAfter) {
        const initialCountAfter: any = resultAfter.value;
      const lengthAfter = initialCountAfter.length;

       browser.assert.ok(lengthAfter < length, 'Board was deleted');
      });
    });
    browser.pause(5000);

  });
  after((browser) => browser.end());
});
