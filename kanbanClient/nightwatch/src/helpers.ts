import { NightwatchAPI } from "nightwatch";

export function registerLogin(browser: NightwatchAPI, done?: Function) {
  browser
    .url('http://localhost:4200')
    .waitForElementPresent('body', 800)
    .click('button[id=register]')
    .pause(2000) // Wait for 4000 milliseconds (4 seconds)
    .sendKeys('input[type=text]', 'TestUser')
    .sendKeys('input[type=password]', '123')
    .pause(2000)
    .click('button[id=submit]')
    .pause(2000)
    .back()
    .pause(2000) // Wait for 4000 milliseconds (4 seconds)
    .sendKeys('input[type=text]', 'TestUser')
    .sendKeys('input[type=password]', '123')
    .pause(2000)
    .click('button[id=login]')
    .pause(2000);
  if (done)
    done();

}

export function createBoard(browser: NightwatchAPI, done?: Function) {
  browser
    .click('button[id=create-board]')
    .pause(1000)
    .sendKeys('input[formcontrolname=name]', 'TestBoard')
    .click('button[id=modal-create-board]')
    .alerts.accept()
    .pause(1000);
  if (done)
    done();
}
export function createTask(browser: NightwatchAPI, done?: Function) {
  browser.pause(1500);
  browser.click('button.open-modal-task.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base')
    .pause(1500)
    .sendKeys('input[formcontrolname=title]', 'testTask')
    .sendKeys('input[formcontrolname=description]', 'testTaskDescription')
    .sendKeys('input[formcontrolname=targetDate]', '12/12/2025')
    .pause(1500)
    .click('button[id=modal-create-task]')
    .pause(1500)
    .alerts.accept();
  if (done)
    done();
}

export function createLane(browser: NightwatchAPI, openBoard: boolean = true) {
  browser.pause(1000);
  if (openBoard) {
    browser.click('button.open-board.mdc-button.mat-mdc-button.mat-unthemed.mat-mdc-button-base');
    browser.waitForElementPresent('button[id=open-modal-lane]', 2000);
  }
  browser.click('button[id=open-modal-lane]');

  browser
    .pause(1000)
    .sendKeys('input[formcontrolname=name]', 'TestLane')
    .sendKeys('input[formcontrolname=order]', '1')
    .pause(1000)
    .click('button[id=modal-create-lane]')
    .pause(500)
    .acceptAlert()
    .waitForElementPresent('div.cdk-drop-list.lane.ng-star-inserted', 2000)
    .assert.elementPresent('div.cdk-drop-list.lane.ng-star-inserted')

}
