import { WebDriverProtocolUserActions } from "nightwatch";
import { createBoard, createLane, createTask, registerLogin } from "../helpers";
import { code as dragAndDrop } from 'html-dnd';

describe('Task', function () {
  before((browser, done) => {

    registerLogin(browser, () => { done() });

  });

  it('Test Add Task', function (browser) {

    createBoard(browser);
    createLane(browser);
    createLane(browser, false);
    createTask(browser);
  });
  it('Test edit Task', function (browser) {
    browser.click('button.edit-task.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base');
    browser.sendKeys('input[formcontrolname=title]', 'testTaskEdited');
    browser.click('button[id=modal-save-task]');
    browser.pause(1000);
    browser.alerts.accept();
  });
  it('Test Delete Task', function (browser) {
    browser.elements('css selector', 'button.delete-task.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base', function (result) {
      const initialCount: any = result.value;
      const length = initialCount.length;
      browser.click('button.delete-task.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base');
      browser.pause(1000);
      browser.alerts.accept();
      browser.pause(5000);
      browser.elements('css selector', 'button.delete-task.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base', function (resultAfter) {
        const initialCountAfter: any = resultAfter.value;
        const lengthAfter = initialCountAfter.length;

        browser.assert.ok(lengthAfter < length, 'Task was deleted');
      });
    });

  });

  after((browser) => browser.end());

});
