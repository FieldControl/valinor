var Helpers =
  Helpers ||
  (function () {
    let body = $("body");

    let path = "/";

    const absolutePath = function (url) {
      if (url.indexOf("https://api.github.com/") !== -1) {
        return path + url;
      } else {
        return "https://api.github.com/" + url;
      }
    };

    const kFormatter = (num) => {
      return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
    }

    return {
      body: body,
      absolutePath: absolutePath,
      kFormatter: kFormatter,
    };
  })();
