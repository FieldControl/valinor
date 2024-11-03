import { createBoard, createLane, registerLogin } from "../helpers";


describe('Lane', function () {
  before(async (browser, done) =>{
    registerLogin(browser, () => {
      createBoard(browser);
      done();
    });

  });


  it('Test Add Lane', async function (browser) {
    createLane(browser);
  });
  after((browser) => browser.end());
});
