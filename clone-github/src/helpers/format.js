const formatNumber = (text) => {
  let t = String(text);
  let arr = [];
  let l = 0;
  let metric = "";
  let point;

  if (t.length === 9) {
    l = 6;
    if (t[3] === "0") {
      l = 7;
    }
    metric = "m";
    point = 3;
  }
  if (t.length === 8) {
    l = 6;
    if (t[2] === "0") {
      l = 7;
    }
    metric = "m";
    point = 2;
  }
  if (t.length === 7) {
    l = 6;
    if (t[1] === "0") {
      l = 7;
    }
    metric = "m";
    point = 1;
  }
  if (t.length === 6) {
    l = 3;
    if (t[3] === "0") {
      l = 4;
    }
    metric = "k";
    point = 3;
  }

  if (t.length === 5) {
    l = 3;
    if (t[2] === "0") {
      l = 4;
    }
    metric = "k";
    point = 2;
  }
  if (t.length === 4) {
    l = 3;
    if (t[1] === "0") {
      l = 4;
    }
    metric = "k";
    point = 1;
  }
  if (t.length === 3) {
    metric = "";
  }

  for (let i = 0; i <= t.length - l; i++) {
    if (i === point) {
      arr.push(".");
    }
    arr.push(t[i]);
    if (i === t.length - l) {
      arr.push(metric);
    }
  }

  return arr.join("");
};

const formatNumberWithComma = (text) => {
  let t = String(text);
  let arr = [];
  let comma;
  let comma2;
  let comma3;

  if (t.length === 10) {
    comma = 1;
    comma2 = 4;
    comma3 = 7;
  }

  if (t.length === 9) {
    comma = 3;
    comma2 = 6;
  }
  if (t.length === 8) {
    comma = 2;
    comma2 = 5;
  }
  if (t.length === 7) {
    comma = 1;
    comma2 = 4;
  }
  if (t.length === 6) {
    comma = 3;
  }
  if (t.length === 5) {
    comma = 2;
  }
  if (t.length === 4) {
    comma = 1;
  }
  for (let i = 0; i <= t.length; i++) {
    if (i === comma || i === comma2 || i === comma3) {
      arr.push(",");
    }
    arr.push(t[i]);
  }
  return arr.join("");
};

const formatString = (text) => {
  let r = /[^a-zA-Z.?()...]/gim;
  return text.replace(r, " ");
};

const formatUrl = (text) => {
  let r = /(https:)|api.github.com|repos|\W[/]/gim;
  return text.replace(r, "");
};
module.exports = {
  formatNumber: formatNumber,
  formatNumberWithComma: formatNumberWithComma,
  formatString: formatString,
  formatUrl: formatUrl,
};
