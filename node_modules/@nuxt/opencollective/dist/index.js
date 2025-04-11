'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var child_process = require('child_process');
var utils = require('consola/utils');
var consola = require('consola');
var path = require('path');
var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

// eslint-disable-next-line import/named
var reportAndThrowError = function reportAndThrowError(msg) {
  report(msg);
  throw new Error(msg);
};
var report = function report(message) {
  consola.consola.debug({
    message: String(message),
    tag: 'opencollective'
  });
};
var hideMessage = function hideMessage() {
  var env = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.env;
  // Show message if it is forced
  if (env.OPENCOLLECTIVE_FORCE) {
    return false;
  }

  // Don't show after oracle postinstall
  if (env.OC_POSTINSTALL_TEST) {
    return true;
  }
  // Don't show if opted-out
  if (env.OPENCOLLECTIVE_HIDE) {
    return true;
  }

  // Compatability with opencollective-postinstall
  if (!!env.DISABLE_OPENCOLLECTIVE && env.DISABLE_OPENCOLLECTIVE !== '0' && env.DISABLE_OPENCOLLECTIVE !== 'false') {
    return true;
  }

  // Don't show if on CI
  if (env.CI || env.CONTINUOUS_INTEGRATION) {
    return true;
  }

  // Only show in dev environment
  return Boolean(env.NODE_ENV) && !['dev', 'development'].includes(env.NODE_ENV);
};
var formatMoney = function formatMoney(currency) {
  return function (amount) {
    amount = amount / 100; // converting cents

    var precision = 0;
    return amount.toLocaleString(currency, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  };
};
var isWin32 = process.platform === 'win32';
var stripLeadingSlash = function stripLeadingSlash(s) {
  return s.startsWith('/') ? s.substring(1) : s;
};
var stripTrailingSlash = function stripTrailingSlash(s) {
  return s.endsWith('/') ? s.slice(0, -1) : s;
};

/* eslint-disable no-console */
var print = function print() {
  var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  return function () {
    var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var terminalCols = retrieveCols();
    var strLength = str.replace(/\u001B\[[0-9]{2}m/g, '').length;
    var leftPaddingLength = Math.floor((terminalCols - strLength) / 2);
    var leftPadding = ' '.repeat(Math.max(leftPaddingLength, 0));
    if (color) {
      str = utils.colors[color] ? utils.colors[color](str) : str;
    }
    console.log(leftPadding, str);
  };
};
var retrieveCols = function () {
  var result = false;
  return function () {
    if (result) {
      return result;
    }
    var defaultCols = 80;
    try {
      var terminalCols = child_process.execSync('tput cols', {
        stdio: ['pipe', 'pipe', 'ignore']
      });
      result = parseInt(terminalCols.toString()) || defaultCols;
    } catch (e) {
      result = defaultCols;
    }
    return result;
  };
}();
var printStats = function printStats(stats, color) {
  if (!stats) {
    return;
  }
  var colored = print(color);
  var bold = print('bold');
  var formatWithCurrency = formatMoney(stats.currency);
  colored("Number of contributors: ".concat(stats.contributorsCount));
  colored("Number of backers: ".concat(stats.backersCount));
  colored("Annual budget: ".concat(formatWithCurrency(stats.yearlyIncome)));
  bold("Current balance: ".concat(formatWithCurrency(stats.balance)), 'bold');
};
var printLogo = function printLogo(logoText) {
  if (!logoText) {
    return;
  }
  logoText.split('\n').forEach(print('blue'));
};

/**
 * Only show emoji on OSx (Windows shell doesn't like them that much ¯\_(ツ)_/¯ )
 * @param {*} emoji
 */
var emoji = function emoji(_emoji) {
  return process.stdout.isTTY && !isWin32 ? _emoji : '';
};
function printFooter(collective) {
  var dim = print('dim');
  var yellow = print('yellow');
  var emptyLine = print();
  yellow("Thanks for installing ".concat(collective.slug, " ").concat(emoji('🙏')));
  dim('Please consider donating to our open collective');
  dim('to help us maintain this package.');
  emptyLine();
  printStats(collective.stats);
  emptyLine();
  print()("".concat(utils.colors.bold("".concat(emoji('👉 '), " ").concat(collective.donationText)), " ").concat(utils.colors.underline(collective.donationUrl)));
  emptyLine();
}

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

function _await$2(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
var FETCH_TIMEOUT = 3000;
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}
var fetchJson = _async$2(function (url) {
  return _catch(function () {
    return _await$2(global.fetch("".concat(url, ".json"), {
      timeout: FETCH_TIMEOUT
    }), function (_global$fetch) {
      return _global$fetch.json();
    });
  }, function (e) {
    report(e);
    reportAndThrowError("Could not fetch ".concat(url, ".json"));
  });
});
function _async$2(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
var fetchStats = _async$2(function (collectiveUrl) {
  return _catch(function () {
    return _await$2(fetchJson(collectiveUrl));
  }, function (e) {
    report(e);
    report("Could not load the stats for ".concat(collectiveSlugFromUrl(collectiveUrl)));
  });
});
var fetchLogo = _async$2(function (logoUrl) {
  if (!logoUrl) {
    // Silent return if no logo has been provided
    return;
  }
  if (!logoUrl.match(/^https?:\/\//)) {
    reportAndThrowError("Your logo URL isn't well-formatted - ".concat(logoUrl));
  }
  return _catch(function () {
    return _await$2(global.fetch(logoUrl, {
      timeout: FETCH_TIMEOUT
    }), function (res) {
      if (isLogoResponseWellFormatted(res)) {
        return res.text();
      }
      report("Error while fetching logo from ".concat(logoUrl, ". The response wasn't well-formatted"));
    });
  }, function () {
    report("Error while fetching logo from ".concat(logoUrl));
  });
});
var isLogoResponseWellFormatted = function isLogoResponseWellFormatted(res) {
  return res.status === 200 && res.headers.get('content-type').match(/^text\/plain/);
};
var fetchPkg = function fetchPkg(pathToPkg) {
  var fullPathToPkg = path__default["default"].resolve("".concat(pathToPkg, "/package.json"));
  try {
    return JSON.parse(fs__default["default"].readFileSync(fullPathToPkg, 'utf8'));
  } catch (e) {
    reportAndThrowError("Could not find package.json at ".concat(fullPathToPkg));
  }
};

function _await$1(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _async$1(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
var collectiveSlugFromUrl = function collectiveSlugFromUrl(url) {
  return url.substr(url.lastIndexOf('/') + 1).toLowerCase().replace(/\.json/g, '');
};
var collectiveUrl = function collectiveUrl(pkg) {
  var url = pkg.collective && pkg.collective.url;
  if (!url) {
    reportAndThrowError('No collective URL set!');
  }
  return stripTrailingSlash(url);
};

// use pkg.collective.logo for "legacy"/compatibility reasons
var collectiveLogoUrl = function collectiveLogoUrl(pkg) {
  return pkg.collective.logo || pkg.collective.logoUrl || false;
};
var collectiveDonationText = function collectiveDonationText(pkg) {
  return pkg.collective.donation && pkg.collective.donation.text || 'Donate:';
};
var getCollective = _async$1(function (pkgPath) {
  var pkg = fetchPkg(pkgPath);
  var url = collectiveUrl(pkg);
  var baseCollective = {
    url: url,
    slug: collectiveSlugFromUrl(url),
    logoUrl: collectiveLogoUrl(pkg),
    donationUrl: collectiveDonationUrl(pkg),
    donationText: collectiveDonationText(pkg)
  };
  var logoUrl = baseCollective.logoUrl;
  var promises = [fetchStats(url)].concat(logoUrl ? fetchLogo(logoUrl) : []);
  return _await$1(Promise.all(promises), function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      stats = _ref2[0],
      logo = _ref2[1];
    return Object.assign(baseCollective, {
      stats: stats,
      logo: logo
    });
  });
});
var collectiveDonationUrl = function collectiveDonationUrl(pkg) {
  var defaultDonationAmount = pkg.collective.donation && pkg.collective.donation.amount;
  var donateUrl = "".concat(collectiveUrl(pkg), "/").concat(retrieveDonationSlug(pkg));
  if (defaultDonationAmount) {
    return "".concat(donateUrl, "/").concat(defaultDonationAmount);
  }
  return donateUrl;
};
var retrieveDonationSlug = function retrieveDonationSlug(pkg) {
  var rawDonationSlug = pkg.collective.donation && pkg.collective.donation.slug;
  if (!rawDonationSlug) {
    return 'donate';
  }
  return stripLeadingSlash(rawDonationSlug);
};

function _await(value, then, direct) {
  if (direct) {
    return then ? then(value) : value;
  }
  if (!value || !value.then) {
    value = Promise.resolve(value);
  }
  return then ? value.then(then) : value;
}
function _async(f) {
  return function () {
    for (var args = [], i = 0; i < arguments.length; i++) {
      args[i] = arguments[i];
    }
    try {
      return Promise.resolve(f.apply(this, args));
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
var init = _async(function (path, hide) {
  if (hide === undefined) hide = hideMessage();
  if (hide) {
    return;
  }
  if (!(globalThis.fetch || global.fetch)) {
    return;
  }
  return _await(getCollective(path), function (collective) {
    printLogo(collective.logo);
    printFooter(collective);
  });
});

exports.init = init;
