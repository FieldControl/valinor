(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('path'), require('pretty-bytes'), require('parse5'), require('css'), require('chalk')) :
	typeof define === 'function' && define.amd ? define(['path', 'pretty-bytes', 'parse5', 'css', 'chalk'], factory) :
	(global = global || self, global.critters = factory(global.path, global.prettyBytes, global.parse5, global.css, global.chalk));
}(this, (function (path, prettyBytes, parse5, css, chalk) {
	path = path && Object.prototype.hasOwnProperty.call(path, 'default') ? path['default'] : path;
	prettyBytes = prettyBytes && Object.prototype.hasOwnProperty.call(prettyBytes, 'default') ? prettyBytes['default'] : prettyBytes;
	parse5 = parse5 && Object.prototype.hasOwnProperty.call(parse5, 'default') ? parse5['default'] : parse5;
	css = css && Object.prototype.hasOwnProperty.call(css, 'default') ? css['default'] : css;
	chalk = chalk && Object.prototype.hasOwnProperty.call(chalk, 'default') ? chalk['default'] : chalk;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
		  path: basedir,
		  exports: {},
		  require: function (path, base) {
	      return commonjsRequire();
	    }
		}, fn(module, module.exports), module.exports;
	}

	function getCjsExportFromNamespace (n) {
		return n && n['default'] || n;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	//Types of elements found in the DOM
	var domelementtype = {
		Text: "text", //Text
		Directive: "directive", //<? ... ?>
		Comment: "comment", //<!-- ... -->
		Script: "script", //<script> tags
		Style: "style", //<style> tags
		Tag: "tag", //Any tag
		CDATA: "cdata", //<![CDATA[ ... ]]>
		Doctype: "doctype",

		isTag: function(elem){
			return elem.type === "tag" || elem.type === "script" || elem.type === "style";
		}
	};

	var lib = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * Tests whether an element is a tag or not.
	 *
	 * @param elem Element to test
	 */
	function isTag(elem) {
	    return (elem.type === "tag" /* Tag */ ||
	        elem.type === "script" /* Script */ ||
	        elem.type === "style" /* Style */);
	}
	exports.isTag = isTag;
	// Exports for backwards compatibility
	exports.Text = "text" /* Text */; //Text
	exports.Directive = "directive" /* Directive */; //<? ... ?>
	exports.Comment = "comment" /* Comment */; //<!-- ... -->
	exports.Script = "script" /* Script */; //<script> tags
	exports.Style = "style" /* Style */; //<style> tags
	exports.Tag = "tag" /* Tag */; //Any tag
	exports.CDATA = "cdata" /* CDATA */; //<![CDATA[ ... ]]>
	exports.Doctype = "doctype" /* Doctype */;
	});

	var Aacute = "Á";
	var aacute = "á";
	var Abreve = "Ă";
	var abreve = "ă";
	var ac = "∾";
	var acd = "∿";
	var acE = "∾̳";
	var Acirc = "Â";
	var acirc = "â";
	var acute = "´";
	var Acy = "А";
	var acy = "а";
	var AElig = "Æ";
	var aelig = "æ";
	var af = "⁡";
	var Afr = "𝔄";
	var afr = "𝔞";
	var Agrave = "À";
	var agrave = "à";
	var alefsym = "ℵ";
	var aleph = "ℵ";
	var Alpha = "Α";
	var alpha = "α";
	var Amacr = "Ā";
	var amacr = "ā";
	var amalg = "⨿";
	var amp = "&";
	var AMP = "&";
	var andand = "⩕";
	var And = "⩓";
	var and = "∧";
	var andd = "⩜";
	var andslope = "⩘";
	var andv = "⩚";
	var ang = "∠";
	var ange = "⦤";
	var angle = "∠";
	var angmsdaa = "⦨";
	var angmsdab = "⦩";
	var angmsdac = "⦪";
	var angmsdad = "⦫";
	var angmsdae = "⦬";
	var angmsdaf = "⦭";
	var angmsdag = "⦮";
	var angmsdah = "⦯";
	var angmsd = "∡";
	var angrt = "∟";
	var angrtvb = "⊾";
	var angrtvbd = "⦝";
	var angsph = "∢";
	var angst = "Å";
	var angzarr = "⍼";
	var Aogon = "Ą";
	var aogon = "ą";
	var Aopf = "𝔸";
	var aopf = "𝕒";
	var apacir = "⩯";
	var ap = "≈";
	var apE = "⩰";
	var ape = "≊";
	var apid = "≋";
	var apos = "'";
	var ApplyFunction = "⁡";
	var approx = "≈";
	var approxeq = "≊";
	var Aring = "Å";
	var aring = "å";
	var Ascr = "𝒜";
	var ascr = "𝒶";
	var Assign = "≔";
	var ast = "*";
	var asymp = "≈";
	var asympeq = "≍";
	var Atilde = "Ã";
	var atilde = "ã";
	var Auml = "Ä";
	var auml = "ä";
	var awconint = "∳";
	var awint = "⨑";
	var backcong = "≌";
	var backepsilon = "϶";
	var backprime = "‵";
	var backsim = "∽";
	var backsimeq = "⋍";
	var Backslash = "∖";
	var Barv = "⫧";
	var barvee = "⊽";
	var barwed = "⌅";
	var Barwed = "⌆";
	var barwedge = "⌅";
	var bbrk = "⎵";
	var bbrktbrk = "⎶";
	var bcong = "≌";
	var Bcy = "Б";
	var bcy = "б";
	var bdquo = "„";
	var becaus = "∵";
	var because = "∵";
	var Because = "∵";
	var bemptyv = "⦰";
	var bepsi = "϶";
	var bernou = "ℬ";
	var Bernoullis = "ℬ";
	var Beta = "Β";
	var beta = "β";
	var beth = "ℶ";
	var between = "≬";
	var Bfr = "𝔅";
	var bfr = "𝔟";
	var bigcap = "⋂";
	var bigcirc = "◯";
	var bigcup = "⋃";
	var bigodot = "⨀";
	var bigoplus = "⨁";
	var bigotimes = "⨂";
	var bigsqcup = "⨆";
	var bigstar = "★";
	var bigtriangledown = "▽";
	var bigtriangleup = "△";
	var biguplus = "⨄";
	var bigvee = "⋁";
	var bigwedge = "⋀";
	var bkarow = "⤍";
	var blacklozenge = "⧫";
	var blacksquare = "▪";
	var blacktriangle = "▴";
	var blacktriangledown = "▾";
	var blacktriangleleft = "◂";
	var blacktriangleright = "▸";
	var blank = "␣";
	var blk12 = "▒";
	var blk14 = "░";
	var blk34 = "▓";
	var block = "█";
	var bne = "=⃥";
	var bnequiv = "≡⃥";
	var bNot = "⫭";
	var bnot = "⌐";
	var Bopf = "𝔹";
	var bopf = "𝕓";
	var bot = "⊥";
	var bottom = "⊥";
	var bowtie = "⋈";
	var boxbox = "⧉";
	var boxdl = "┐";
	var boxdL = "╕";
	var boxDl = "╖";
	var boxDL = "╗";
	var boxdr = "┌";
	var boxdR = "╒";
	var boxDr = "╓";
	var boxDR = "╔";
	var boxh = "─";
	var boxH = "═";
	var boxhd = "┬";
	var boxHd = "╤";
	var boxhD = "╥";
	var boxHD = "╦";
	var boxhu = "┴";
	var boxHu = "╧";
	var boxhU = "╨";
	var boxHU = "╩";
	var boxminus = "⊟";
	var boxplus = "⊞";
	var boxtimes = "⊠";
	var boxul = "┘";
	var boxuL = "╛";
	var boxUl = "╜";
	var boxUL = "╝";
	var boxur = "└";
	var boxuR = "╘";
	var boxUr = "╙";
	var boxUR = "╚";
	var boxv = "│";
	var boxV = "║";
	var boxvh = "┼";
	var boxvH = "╪";
	var boxVh = "╫";
	var boxVH = "╬";
	var boxvl = "┤";
	var boxvL = "╡";
	var boxVl = "╢";
	var boxVL = "╣";
	var boxvr = "├";
	var boxvR = "╞";
	var boxVr = "╟";
	var boxVR = "╠";
	var bprime = "‵";
	var breve = "˘";
	var Breve = "˘";
	var brvbar = "¦";
	var bscr = "𝒷";
	var Bscr = "ℬ";
	var bsemi = "⁏";
	var bsim = "∽";
	var bsime = "⋍";
	var bsolb = "⧅";
	var bsol = "\\";
	var bsolhsub = "⟈";
	var bull = "•";
	var bullet = "•";
	var bump = "≎";
	var bumpE = "⪮";
	var bumpe = "≏";
	var Bumpeq = "≎";
	var bumpeq = "≏";
	var Cacute = "Ć";
	var cacute = "ć";
	var capand = "⩄";
	var capbrcup = "⩉";
	var capcap = "⩋";
	var cap = "∩";
	var Cap = "⋒";
	var capcup = "⩇";
	var capdot = "⩀";
	var CapitalDifferentialD = "ⅅ";
	var caps = "∩︀";
	var caret = "⁁";
	var caron = "ˇ";
	var Cayleys = "ℭ";
	var ccaps = "⩍";
	var Ccaron = "Č";
	var ccaron = "č";
	var Ccedil = "Ç";
	var ccedil = "ç";
	var Ccirc = "Ĉ";
	var ccirc = "ĉ";
	var Cconint = "∰";
	var ccups = "⩌";
	var ccupssm = "⩐";
	var Cdot = "Ċ";
	var cdot = "ċ";
	var cedil = "¸";
	var Cedilla = "¸";
	var cemptyv = "⦲";
	var cent = "¢";
	var centerdot = "·";
	var CenterDot = "·";
	var cfr = "𝔠";
	var Cfr = "ℭ";
	var CHcy = "Ч";
	var chcy = "ч";
	var check = "✓";
	var checkmark = "✓";
	var Chi = "Χ";
	var chi = "χ";
	var circ = "ˆ";
	var circeq = "≗";
	var circlearrowleft = "↺";
	var circlearrowright = "↻";
	var circledast = "⊛";
	var circledcirc = "⊚";
	var circleddash = "⊝";
	var CircleDot = "⊙";
	var circledR = "®";
	var circledS = "Ⓢ";
	var CircleMinus = "⊖";
	var CirclePlus = "⊕";
	var CircleTimes = "⊗";
	var cir = "○";
	var cirE = "⧃";
	var cire = "≗";
	var cirfnint = "⨐";
	var cirmid = "⫯";
	var cirscir = "⧂";
	var ClockwiseContourIntegral = "∲";
	var CloseCurlyDoubleQuote = "”";
	var CloseCurlyQuote = "’";
	var clubs = "♣";
	var clubsuit = "♣";
	var colon = ":";
	var Colon = "∷";
	var Colone = "⩴";
	var colone = "≔";
	var coloneq = "≔";
	var comma = ",";
	var commat = "@";
	var comp = "∁";
	var compfn = "∘";
	var complement = "∁";
	var complexes = "ℂ";
	var cong = "≅";
	var congdot = "⩭";
	var Congruent = "≡";
	var conint = "∮";
	var Conint = "∯";
	var ContourIntegral = "∮";
	var copf = "𝕔";
	var Copf = "ℂ";
	var coprod = "∐";
	var Coproduct = "∐";
	var copy = "©";
	var COPY = "©";
	var copysr = "℗";
	var CounterClockwiseContourIntegral = "∳";
	var crarr = "↵";
	var cross = "✗";
	var Cross = "⨯";
	var Cscr = "𝒞";
	var cscr = "𝒸";
	var csub = "⫏";
	var csube = "⫑";
	var csup = "⫐";
	var csupe = "⫒";
	var ctdot = "⋯";
	var cudarrl = "⤸";
	var cudarrr = "⤵";
	var cuepr = "⋞";
	var cuesc = "⋟";
	var cularr = "↶";
	var cularrp = "⤽";
	var cupbrcap = "⩈";
	var cupcap = "⩆";
	var CupCap = "≍";
	var cup = "∪";
	var Cup = "⋓";
	var cupcup = "⩊";
	var cupdot = "⊍";
	var cupor = "⩅";
	var cups = "∪︀";
	var curarr = "↷";
	var curarrm = "⤼";
	var curlyeqprec = "⋞";
	var curlyeqsucc = "⋟";
	var curlyvee = "⋎";
	var curlywedge = "⋏";
	var curren = "¤";
	var curvearrowleft = "↶";
	var curvearrowright = "↷";
	var cuvee = "⋎";
	var cuwed = "⋏";
	var cwconint = "∲";
	var cwint = "∱";
	var cylcty = "⌭";
	var dagger = "†";
	var Dagger = "‡";
	var daleth = "ℸ";
	var darr = "↓";
	var Darr = "↡";
	var dArr = "⇓";
	var dash = "‐";
	var Dashv = "⫤";
	var dashv = "⊣";
	var dbkarow = "⤏";
	var dblac = "˝";
	var Dcaron = "Ď";
	var dcaron = "ď";
	var Dcy = "Д";
	var dcy = "д";
	var ddagger = "‡";
	var ddarr = "⇊";
	var DD = "ⅅ";
	var dd = "ⅆ";
	var DDotrahd = "⤑";
	var ddotseq = "⩷";
	var deg = "°";
	var Del = "∇";
	var Delta = "Δ";
	var delta = "δ";
	var demptyv = "⦱";
	var dfisht = "⥿";
	var Dfr = "𝔇";
	var dfr = "𝔡";
	var dHar = "⥥";
	var dharl = "⇃";
	var dharr = "⇂";
	var DiacriticalAcute = "´";
	var DiacriticalDot = "˙";
	var DiacriticalDoubleAcute = "˝";
	var DiacriticalGrave = "`";
	var DiacriticalTilde = "˜";
	var diam = "⋄";
	var diamond = "⋄";
	var Diamond = "⋄";
	var diamondsuit = "♦";
	var diams = "♦";
	var die = "¨";
	var DifferentialD = "ⅆ";
	var digamma = "ϝ";
	var disin = "⋲";
	var div = "÷";
	var divide = "÷";
	var divideontimes = "⋇";
	var divonx = "⋇";
	var DJcy = "Ђ";
	var djcy = "ђ";
	var dlcorn = "⌞";
	var dlcrop = "⌍";
	var dollar = "$";
	var Dopf = "𝔻";
	var dopf = "𝕕";
	var Dot = "¨";
	var dot = "˙";
	var DotDot = "⃜";
	var doteq = "≐";
	var doteqdot = "≑";
	var DotEqual = "≐";
	var dotminus = "∸";
	var dotplus = "∔";
	var dotsquare = "⊡";
	var doublebarwedge = "⌆";
	var DoubleContourIntegral = "∯";
	var DoubleDot = "¨";
	var DoubleDownArrow = "⇓";
	var DoubleLeftArrow = "⇐";
	var DoubleLeftRightArrow = "⇔";
	var DoubleLeftTee = "⫤";
	var DoubleLongLeftArrow = "⟸";
	var DoubleLongLeftRightArrow = "⟺";
	var DoubleLongRightArrow = "⟹";
	var DoubleRightArrow = "⇒";
	var DoubleRightTee = "⊨";
	var DoubleUpArrow = "⇑";
	var DoubleUpDownArrow = "⇕";
	var DoubleVerticalBar = "∥";
	var DownArrowBar = "⤓";
	var downarrow = "↓";
	var DownArrow = "↓";
	var Downarrow = "⇓";
	var DownArrowUpArrow = "⇵";
	var DownBreve = "̑";
	var downdownarrows = "⇊";
	var downharpoonleft = "⇃";
	var downharpoonright = "⇂";
	var DownLeftRightVector = "⥐";
	var DownLeftTeeVector = "⥞";
	var DownLeftVectorBar = "⥖";
	var DownLeftVector = "↽";
	var DownRightTeeVector = "⥟";
	var DownRightVectorBar = "⥗";
	var DownRightVector = "⇁";
	var DownTeeArrow = "↧";
	var DownTee = "⊤";
	var drbkarow = "⤐";
	var drcorn = "⌟";
	var drcrop = "⌌";
	var Dscr = "𝒟";
	var dscr = "𝒹";
	var DScy = "Ѕ";
	var dscy = "ѕ";
	var dsol = "⧶";
	var Dstrok = "Đ";
	var dstrok = "đ";
	var dtdot = "⋱";
	var dtri = "▿";
	var dtrif = "▾";
	var duarr = "⇵";
	var duhar = "⥯";
	var dwangle = "⦦";
	var DZcy = "Џ";
	var dzcy = "џ";
	var dzigrarr = "⟿";
	var Eacute = "É";
	var eacute = "é";
	var easter = "⩮";
	var Ecaron = "Ě";
	var ecaron = "ě";
	var Ecirc = "Ê";
	var ecirc = "ê";
	var ecir = "≖";
	var ecolon = "≕";
	var Ecy = "Э";
	var ecy = "э";
	var eDDot = "⩷";
	var Edot = "Ė";
	var edot = "ė";
	var eDot = "≑";
	var ee = "ⅇ";
	var efDot = "≒";
	var Efr = "𝔈";
	var efr = "𝔢";
	var eg = "⪚";
	var Egrave = "È";
	var egrave = "è";
	var egs = "⪖";
	var egsdot = "⪘";
	var el = "⪙";
	var Element = "∈";
	var elinters = "⏧";
	var ell = "ℓ";
	var els = "⪕";
	var elsdot = "⪗";
	var Emacr = "Ē";
	var emacr = "ē";
	var empty = "∅";
	var emptyset = "∅";
	var EmptySmallSquare = "◻";
	var emptyv = "∅";
	var EmptyVerySmallSquare = "▫";
	var emsp13 = " ";
	var emsp14 = " ";
	var emsp = " ";
	var ENG = "Ŋ";
	var eng = "ŋ";
	var ensp = " ";
	var Eogon = "Ę";
	var eogon = "ę";
	var Eopf = "𝔼";
	var eopf = "𝕖";
	var epar = "⋕";
	var eparsl = "⧣";
	var eplus = "⩱";
	var epsi = "ε";
	var Epsilon = "Ε";
	var epsilon = "ε";
	var epsiv = "ϵ";
	var eqcirc = "≖";
	var eqcolon = "≕";
	var eqsim = "≂";
	var eqslantgtr = "⪖";
	var eqslantless = "⪕";
	var Equal = "⩵";
	var equals = "=";
	var EqualTilde = "≂";
	var equest = "≟";
	var Equilibrium = "⇌";
	var equiv = "≡";
	var equivDD = "⩸";
	var eqvparsl = "⧥";
	var erarr = "⥱";
	var erDot = "≓";
	var escr = "ℯ";
	var Escr = "ℰ";
	var esdot = "≐";
	var Esim = "⩳";
	var esim = "≂";
	var Eta = "Η";
	var eta = "η";
	var ETH = "Ð";
	var eth = "ð";
	var Euml = "Ë";
	var euml = "ë";
	var euro = "€";
	var excl = "!";
	var exist = "∃";
	var Exists = "∃";
	var expectation = "ℰ";
	var exponentiale = "ⅇ";
	var ExponentialE = "ⅇ";
	var fallingdotseq = "≒";
	var Fcy = "Ф";
	var fcy = "ф";
	var female = "♀";
	var ffilig = "ﬃ";
	var fflig = "ﬀ";
	var ffllig = "ﬄ";
	var Ffr = "𝔉";
	var ffr = "𝔣";
	var filig = "ﬁ";
	var FilledSmallSquare = "◼";
	var FilledVerySmallSquare = "▪";
	var fjlig = "fj";
	var flat = "♭";
	var fllig = "ﬂ";
	var fltns = "▱";
	var fnof = "ƒ";
	var Fopf = "𝔽";
	var fopf = "𝕗";
	var forall = "∀";
	var ForAll = "∀";
	var fork = "⋔";
	var forkv = "⫙";
	var Fouriertrf = "ℱ";
	var fpartint = "⨍";
	var frac12 = "½";
	var frac13 = "⅓";
	var frac14 = "¼";
	var frac15 = "⅕";
	var frac16 = "⅙";
	var frac18 = "⅛";
	var frac23 = "⅔";
	var frac25 = "⅖";
	var frac34 = "¾";
	var frac35 = "⅗";
	var frac38 = "⅜";
	var frac45 = "⅘";
	var frac56 = "⅚";
	var frac58 = "⅝";
	var frac78 = "⅞";
	var frasl = "⁄";
	var frown = "⌢";
	var fscr = "𝒻";
	var Fscr = "ℱ";
	var gacute = "ǵ";
	var Gamma = "Γ";
	var gamma = "γ";
	var Gammad = "Ϝ";
	var gammad = "ϝ";
	var gap = "⪆";
	var Gbreve = "Ğ";
	var gbreve = "ğ";
	var Gcedil = "Ģ";
	var Gcirc = "Ĝ";
	var gcirc = "ĝ";
	var Gcy = "Г";
	var gcy = "г";
	var Gdot = "Ġ";
	var gdot = "ġ";
	var ge = "≥";
	var gE = "≧";
	var gEl = "⪌";
	var gel = "⋛";
	var geq = "≥";
	var geqq = "≧";
	var geqslant = "⩾";
	var gescc = "⪩";
	var ges = "⩾";
	var gesdot = "⪀";
	var gesdoto = "⪂";
	var gesdotol = "⪄";
	var gesl = "⋛︀";
	var gesles = "⪔";
	var Gfr = "𝔊";
	var gfr = "𝔤";
	var gg = "≫";
	var Gg = "⋙";
	var ggg = "⋙";
	var gimel = "ℷ";
	var GJcy = "Ѓ";
	var gjcy = "ѓ";
	var gla = "⪥";
	var gl = "≷";
	var glE = "⪒";
	var glj = "⪤";
	var gnap = "⪊";
	var gnapprox = "⪊";
	var gne = "⪈";
	var gnE = "≩";
	var gneq = "⪈";
	var gneqq = "≩";
	var gnsim = "⋧";
	var Gopf = "𝔾";
	var gopf = "𝕘";
	var grave = "`";
	var GreaterEqual = "≥";
	var GreaterEqualLess = "⋛";
	var GreaterFullEqual = "≧";
	var GreaterGreater = "⪢";
	var GreaterLess = "≷";
	var GreaterSlantEqual = "⩾";
	var GreaterTilde = "≳";
	var Gscr = "𝒢";
	var gscr = "ℊ";
	var gsim = "≳";
	var gsime = "⪎";
	var gsiml = "⪐";
	var gtcc = "⪧";
	var gtcir = "⩺";
	var gt = ">";
	var GT = ">";
	var Gt = "≫";
	var gtdot = "⋗";
	var gtlPar = "⦕";
	var gtquest = "⩼";
	var gtrapprox = "⪆";
	var gtrarr = "⥸";
	var gtrdot = "⋗";
	var gtreqless = "⋛";
	var gtreqqless = "⪌";
	var gtrless = "≷";
	var gtrsim = "≳";
	var gvertneqq = "≩︀";
	var gvnE = "≩︀";
	var Hacek = "ˇ";
	var hairsp = " ";
	var half = "½";
	var hamilt = "ℋ";
	var HARDcy = "Ъ";
	var hardcy = "ъ";
	var harrcir = "⥈";
	var harr = "↔";
	var hArr = "⇔";
	var harrw = "↭";
	var Hat = "^";
	var hbar = "ℏ";
	var Hcirc = "Ĥ";
	var hcirc = "ĥ";
	var hearts = "♥";
	var heartsuit = "♥";
	var hellip = "…";
	var hercon = "⊹";
	var hfr = "𝔥";
	var Hfr = "ℌ";
	var HilbertSpace = "ℋ";
	var hksearow = "⤥";
	var hkswarow = "⤦";
	var hoarr = "⇿";
	var homtht = "∻";
	var hookleftarrow = "↩";
	var hookrightarrow = "↪";
	var hopf = "𝕙";
	var Hopf = "ℍ";
	var horbar = "―";
	var HorizontalLine = "─";
	var hscr = "𝒽";
	var Hscr = "ℋ";
	var hslash = "ℏ";
	var Hstrok = "Ħ";
	var hstrok = "ħ";
	var HumpDownHump = "≎";
	var HumpEqual = "≏";
	var hybull = "⁃";
	var hyphen = "‐";
	var Iacute = "Í";
	var iacute = "í";
	var ic = "⁣";
	var Icirc = "Î";
	var icirc = "î";
	var Icy = "И";
	var icy = "и";
	var Idot = "İ";
	var IEcy = "Е";
	var iecy = "е";
	var iexcl = "¡";
	var iff = "⇔";
	var ifr = "𝔦";
	var Ifr = "ℑ";
	var Igrave = "Ì";
	var igrave = "ì";
	var ii = "ⅈ";
	var iiiint = "⨌";
	var iiint = "∭";
	var iinfin = "⧜";
	var iiota = "℩";
	var IJlig = "Ĳ";
	var ijlig = "ĳ";
	var Imacr = "Ī";
	var imacr = "ī";
	var image = "ℑ";
	var ImaginaryI = "ⅈ";
	var imagline = "ℐ";
	var imagpart = "ℑ";
	var imath = "ı";
	var Im = "ℑ";
	var imof = "⊷";
	var imped = "Ƶ";
	var Implies = "⇒";
	var incare = "℅";
	var infin = "∞";
	var infintie = "⧝";
	var inodot = "ı";
	var intcal = "⊺";
	var int = "∫";
	var Int = "∬";
	var integers = "ℤ";
	var Integral = "∫";
	var intercal = "⊺";
	var Intersection = "⋂";
	var intlarhk = "⨗";
	var intprod = "⨼";
	var InvisibleComma = "⁣";
	var InvisibleTimes = "⁢";
	var IOcy = "Ё";
	var iocy = "ё";
	var Iogon = "Į";
	var iogon = "į";
	var Iopf = "𝕀";
	var iopf = "𝕚";
	var Iota = "Ι";
	var iota = "ι";
	var iprod = "⨼";
	var iquest = "¿";
	var iscr = "𝒾";
	var Iscr = "ℐ";
	var isin = "∈";
	var isindot = "⋵";
	var isinE = "⋹";
	var isins = "⋴";
	var isinsv = "⋳";
	var isinv = "∈";
	var it = "⁢";
	var Itilde = "Ĩ";
	var itilde = "ĩ";
	var Iukcy = "І";
	var iukcy = "і";
	var Iuml = "Ï";
	var iuml = "ï";
	var Jcirc = "Ĵ";
	var jcirc = "ĵ";
	var Jcy = "Й";
	var jcy = "й";
	var Jfr = "𝔍";
	var jfr = "𝔧";
	var jmath = "ȷ";
	var Jopf = "𝕁";
	var jopf = "𝕛";
	var Jscr = "𝒥";
	var jscr = "𝒿";
	var Jsercy = "Ј";
	var jsercy = "ј";
	var Jukcy = "Є";
	var jukcy = "є";
	var Kappa = "Κ";
	var kappa = "κ";
	var kappav = "ϰ";
	var Kcedil = "Ķ";
	var kcedil = "ķ";
	var Kcy = "К";
	var kcy = "к";
	var Kfr = "𝔎";
	var kfr = "𝔨";
	var kgreen = "ĸ";
	var KHcy = "Х";
	var khcy = "х";
	var KJcy = "Ќ";
	var kjcy = "ќ";
	var Kopf = "𝕂";
	var kopf = "𝕜";
	var Kscr = "𝒦";
	var kscr = "𝓀";
	var lAarr = "⇚";
	var Lacute = "Ĺ";
	var lacute = "ĺ";
	var laemptyv = "⦴";
	var lagran = "ℒ";
	var Lambda = "Λ";
	var lambda = "λ";
	var lang = "⟨";
	var Lang = "⟪";
	var langd = "⦑";
	var langle = "⟨";
	var lap = "⪅";
	var Laplacetrf = "ℒ";
	var laquo = "«";
	var larrb = "⇤";
	var larrbfs = "⤟";
	var larr = "←";
	var Larr = "↞";
	var lArr = "⇐";
	var larrfs = "⤝";
	var larrhk = "↩";
	var larrlp = "↫";
	var larrpl = "⤹";
	var larrsim = "⥳";
	var larrtl = "↢";
	var latail = "⤙";
	var lAtail = "⤛";
	var lat = "⪫";
	var late = "⪭";
	var lates = "⪭︀";
	var lbarr = "⤌";
	var lBarr = "⤎";
	var lbbrk = "❲";
	var lbrace = "{";
	var lbrack = "[";
	var lbrke = "⦋";
	var lbrksld = "⦏";
	var lbrkslu = "⦍";
	var Lcaron = "Ľ";
	var lcaron = "ľ";
	var Lcedil = "Ļ";
	var lcedil = "ļ";
	var lceil = "⌈";
	var lcub = "{";
	var Lcy = "Л";
	var lcy = "л";
	var ldca = "⤶";
	var ldquo = "“";
	var ldquor = "„";
	var ldrdhar = "⥧";
	var ldrushar = "⥋";
	var ldsh = "↲";
	var le = "≤";
	var lE = "≦";
	var LeftAngleBracket = "⟨";
	var LeftArrowBar = "⇤";
	var leftarrow = "←";
	var LeftArrow = "←";
	var Leftarrow = "⇐";
	var LeftArrowRightArrow = "⇆";
	var leftarrowtail = "↢";
	var LeftCeiling = "⌈";
	var LeftDoubleBracket = "⟦";
	var LeftDownTeeVector = "⥡";
	var LeftDownVectorBar = "⥙";
	var LeftDownVector = "⇃";
	var LeftFloor = "⌊";
	var leftharpoondown = "↽";
	var leftharpoonup = "↼";
	var leftleftarrows = "⇇";
	var leftrightarrow = "↔";
	var LeftRightArrow = "↔";
	var Leftrightarrow = "⇔";
	var leftrightarrows = "⇆";
	var leftrightharpoons = "⇋";
	var leftrightsquigarrow = "↭";
	var LeftRightVector = "⥎";
	var LeftTeeArrow = "↤";
	var LeftTee = "⊣";
	var LeftTeeVector = "⥚";
	var leftthreetimes = "⋋";
	var LeftTriangleBar = "⧏";
	var LeftTriangle = "⊲";
	var LeftTriangleEqual = "⊴";
	var LeftUpDownVector = "⥑";
	var LeftUpTeeVector = "⥠";
	var LeftUpVectorBar = "⥘";
	var LeftUpVector = "↿";
	var LeftVectorBar = "⥒";
	var LeftVector = "↼";
	var lEg = "⪋";
	var leg = "⋚";
	var leq = "≤";
	var leqq = "≦";
	var leqslant = "⩽";
	var lescc = "⪨";
	var les = "⩽";
	var lesdot = "⩿";
	var lesdoto = "⪁";
	var lesdotor = "⪃";
	var lesg = "⋚︀";
	var lesges = "⪓";
	var lessapprox = "⪅";
	var lessdot = "⋖";
	var lesseqgtr = "⋚";
	var lesseqqgtr = "⪋";
	var LessEqualGreater = "⋚";
	var LessFullEqual = "≦";
	var LessGreater = "≶";
	var lessgtr = "≶";
	var LessLess = "⪡";
	var lesssim = "≲";
	var LessSlantEqual = "⩽";
	var LessTilde = "≲";
	var lfisht = "⥼";
	var lfloor = "⌊";
	var Lfr = "𝔏";
	var lfr = "𝔩";
	var lg = "≶";
	var lgE = "⪑";
	var lHar = "⥢";
	var lhard = "↽";
	var lharu = "↼";
	var lharul = "⥪";
	var lhblk = "▄";
	var LJcy = "Љ";
	var ljcy = "љ";
	var llarr = "⇇";
	var ll = "≪";
	var Ll = "⋘";
	var llcorner = "⌞";
	var Lleftarrow = "⇚";
	var llhard = "⥫";
	var lltri = "◺";
	var Lmidot = "Ŀ";
	var lmidot = "ŀ";
	var lmoustache = "⎰";
	var lmoust = "⎰";
	var lnap = "⪉";
	var lnapprox = "⪉";
	var lne = "⪇";
	var lnE = "≨";
	var lneq = "⪇";
	var lneqq = "≨";
	var lnsim = "⋦";
	var loang = "⟬";
	var loarr = "⇽";
	var lobrk = "⟦";
	var longleftarrow = "⟵";
	var LongLeftArrow = "⟵";
	var Longleftarrow = "⟸";
	var longleftrightarrow = "⟷";
	var LongLeftRightArrow = "⟷";
	var Longleftrightarrow = "⟺";
	var longmapsto = "⟼";
	var longrightarrow = "⟶";
	var LongRightArrow = "⟶";
	var Longrightarrow = "⟹";
	var looparrowleft = "↫";
	var looparrowright = "↬";
	var lopar = "⦅";
	var Lopf = "𝕃";
	var lopf = "𝕝";
	var loplus = "⨭";
	var lotimes = "⨴";
	var lowast = "∗";
	var lowbar = "_";
	var LowerLeftArrow = "↙";
	var LowerRightArrow = "↘";
	var loz = "◊";
	var lozenge = "◊";
	var lozf = "⧫";
	var lpar = "(";
	var lparlt = "⦓";
	var lrarr = "⇆";
	var lrcorner = "⌟";
	var lrhar = "⇋";
	var lrhard = "⥭";
	var lrm = "‎";
	var lrtri = "⊿";
	var lsaquo = "‹";
	var lscr = "𝓁";
	var Lscr = "ℒ";
	var lsh = "↰";
	var Lsh = "↰";
	var lsim = "≲";
	var lsime = "⪍";
	var lsimg = "⪏";
	var lsqb = "[";
	var lsquo = "‘";
	var lsquor = "‚";
	var Lstrok = "Ł";
	var lstrok = "ł";
	var ltcc = "⪦";
	var ltcir = "⩹";
	var lt = "<";
	var LT = "<";
	var Lt = "≪";
	var ltdot = "⋖";
	var lthree = "⋋";
	var ltimes = "⋉";
	var ltlarr = "⥶";
	var ltquest = "⩻";
	var ltri = "◃";
	var ltrie = "⊴";
	var ltrif = "◂";
	var ltrPar = "⦖";
	var lurdshar = "⥊";
	var luruhar = "⥦";
	var lvertneqq = "≨︀";
	var lvnE = "≨︀";
	var macr = "¯";
	var male = "♂";
	var malt = "✠";
	var maltese = "✠";
	var map = "↦";
	var mapsto = "↦";
	var mapstodown = "↧";
	var mapstoleft = "↤";
	var mapstoup = "↥";
	var marker = "▮";
	var mcomma = "⨩";
	var Mcy = "М";
	var mcy = "м";
	var mdash = "—";
	var mDDot = "∺";
	var measuredangle = "∡";
	var MediumSpace = " ";
	var Mellintrf = "ℳ";
	var Mfr = "𝔐";
	var mfr = "𝔪";
	var mho = "℧";
	var micro = "µ";
	var midast = "*";
	var midcir = "⫰";
	var mid = "∣";
	var middot = "·";
	var minusb = "⊟";
	var minus = "−";
	var minusd = "∸";
	var minusdu = "⨪";
	var MinusPlus = "∓";
	var mlcp = "⫛";
	var mldr = "…";
	var mnplus = "∓";
	var models = "⊧";
	var Mopf = "𝕄";
	var mopf = "𝕞";
	var mp = "∓";
	var mscr = "𝓂";
	var Mscr = "ℳ";
	var mstpos = "∾";
	var Mu = "Μ";
	var mu = "μ";
	var multimap = "⊸";
	var mumap = "⊸";
	var nabla = "∇";
	var Nacute = "Ń";
	var nacute = "ń";
	var nang = "∠⃒";
	var nap = "≉";
	var napE = "⩰̸";
	var napid = "≋̸";
	var napos = "ŉ";
	var napprox = "≉";
	var natural = "♮";
	var naturals = "ℕ";
	var natur = "♮";
	var nbsp = " ";
	var nbump = "≎̸";
	var nbumpe = "≏̸";
	var ncap = "⩃";
	var Ncaron = "Ň";
	var ncaron = "ň";
	var Ncedil = "Ņ";
	var ncedil = "ņ";
	var ncong = "≇";
	var ncongdot = "⩭̸";
	var ncup = "⩂";
	var Ncy = "Н";
	var ncy = "н";
	var ndash = "–";
	var nearhk = "⤤";
	var nearr = "↗";
	var neArr = "⇗";
	var nearrow = "↗";
	var ne = "≠";
	var nedot = "≐̸";
	var NegativeMediumSpace = "​";
	var NegativeThickSpace = "​";
	var NegativeThinSpace = "​";
	var NegativeVeryThinSpace = "​";
	var nequiv = "≢";
	var nesear = "⤨";
	var nesim = "≂̸";
	var NestedGreaterGreater = "≫";
	var NestedLessLess = "≪";
	var NewLine = "\n";
	var nexist = "∄";
	var nexists = "∄";
	var Nfr = "𝔑";
	var nfr = "𝔫";
	var ngE = "≧̸";
	var nge = "≱";
	var ngeq = "≱";
	var ngeqq = "≧̸";
	var ngeqslant = "⩾̸";
	var nges = "⩾̸";
	var nGg = "⋙̸";
	var ngsim = "≵";
	var nGt = "≫⃒";
	var ngt = "≯";
	var ngtr = "≯";
	var nGtv = "≫̸";
	var nharr = "↮";
	var nhArr = "⇎";
	var nhpar = "⫲";
	var ni = "∋";
	var nis = "⋼";
	var nisd = "⋺";
	var niv = "∋";
	var NJcy = "Њ";
	var njcy = "њ";
	var nlarr = "↚";
	var nlArr = "⇍";
	var nldr = "‥";
	var nlE = "≦̸";
	var nle = "≰";
	var nleftarrow = "↚";
	var nLeftarrow = "⇍";
	var nleftrightarrow = "↮";
	var nLeftrightarrow = "⇎";
	var nleq = "≰";
	var nleqq = "≦̸";
	var nleqslant = "⩽̸";
	var nles = "⩽̸";
	var nless = "≮";
	var nLl = "⋘̸";
	var nlsim = "≴";
	var nLt = "≪⃒";
	var nlt = "≮";
	var nltri = "⋪";
	var nltrie = "⋬";
	var nLtv = "≪̸";
	var nmid = "∤";
	var NoBreak = "⁠";
	var NonBreakingSpace = " ";
	var nopf = "𝕟";
	var Nopf = "ℕ";
	var Not = "⫬";
	var not = "¬";
	var NotCongruent = "≢";
	var NotCupCap = "≭";
	var NotDoubleVerticalBar = "∦";
	var NotElement = "∉";
	var NotEqual = "≠";
	var NotEqualTilde = "≂̸";
	var NotExists = "∄";
	var NotGreater = "≯";
	var NotGreaterEqual = "≱";
	var NotGreaterFullEqual = "≧̸";
	var NotGreaterGreater = "≫̸";
	var NotGreaterLess = "≹";
	var NotGreaterSlantEqual = "⩾̸";
	var NotGreaterTilde = "≵";
	var NotHumpDownHump = "≎̸";
	var NotHumpEqual = "≏̸";
	var notin = "∉";
	var notindot = "⋵̸";
	var notinE = "⋹̸";
	var notinva = "∉";
	var notinvb = "⋷";
	var notinvc = "⋶";
	var NotLeftTriangleBar = "⧏̸";
	var NotLeftTriangle = "⋪";
	var NotLeftTriangleEqual = "⋬";
	var NotLess = "≮";
	var NotLessEqual = "≰";
	var NotLessGreater = "≸";
	var NotLessLess = "≪̸";
	var NotLessSlantEqual = "⩽̸";
	var NotLessTilde = "≴";
	var NotNestedGreaterGreater = "⪢̸";
	var NotNestedLessLess = "⪡̸";
	var notni = "∌";
	var notniva = "∌";
	var notnivb = "⋾";
	var notnivc = "⋽";
	var NotPrecedes = "⊀";
	var NotPrecedesEqual = "⪯̸";
	var NotPrecedesSlantEqual = "⋠";
	var NotReverseElement = "∌";
	var NotRightTriangleBar = "⧐̸";
	var NotRightTriangle = "⋫";
	var NotRightTriangleEqual = "⋭";
	var NotSquareSubset = "⊏̸";
	var NotSquareSubsetEqual = "⋢";
	var NotSquareSuperset = "⊐̸";
	var NotSquareSupersetEqual = "⋣";
	var NotSubset = "⊂⃒";
	var NotSubsetEqual = "⊈";
	var NotSucceeds = "⊁";
	var NotSucceedsEqual = "⪰̸";
	var NotSucceedsSlantEqual = "⋡";
	var NotSucceedsTilde = "≿̸";
	var NotSuperset = "⊃⃒";
	var NotSupersetEqual = "⊉";
	var NotTilde = "≁";
	var NotTildeEqual = "≄";
	var NotTildeFullEqual = "≇";
	var NotTildeTilde = "≉";
	var NotVerticalBar = "∤";
	var nparallel = "∦";
	var npar = "∦";
	var nparsl = "⫽⃥";
	var npart = "∂̸";
	var npolint = "⨔";
	var npr = "⊀";
	var nprcue = "⋠";
	var nprec = "⊀";
	var npreceq = "⪯̸";
	var npre = "⪯̸";
	var nrarrc = "⤳̸";
	var nrarr = "↛";
	var nrArr = "⇏";
	var nrarrw = "↝̸";
	var nrightarrow = "↛";
	var nRightarrow = "⇏";
	var nrtri = "⋫";
	var nrtrie = "⋭";
	var nsc = "⊁";
	var nsccue = "⋡";
	var nsce = "⪰̸";
	var Nscr = "𝒩";
	var nscr = "𝓃";
	var nshortmid = "∤";
	var nshortparallel = "∦";
	var nsim = "≁";
	var nsime = "≄";
	var nsimeq = "≄";
	var nsmid = "∤";
	var nspar = "∦";
	var nsqsube = "⋢";
	var nsqsupe = "⋣";
	var nsub = "⊄";
	var nsubE = "⫅̸";
	var nsube = "⊈";
	var nsubset = "⊂⃒";
	var nsubseteq = "⊈";
	var nsubseteqq = "⫅̸";
	var nsucc = "⊁";
	var nsucceq = "⪰̸";
	var nsup = "⊅";
	var nsupE = "⫆̸";
	var nsupe = "⊉";
	var nsupset = "⊃⃒";
	var nsupseteq = "⊉";
	var nsupseteqq = "⫆̸";
	var ntgl = "≹";
	var Ntilde = "Ñ";
	var ntilde = "ñ";
	var ntlg = "≸";
	var ntriangleleft = "⋪";
	var ntrianglelefteq = "⋬";
	var ntriangleright = "⋫";
	var ntrianglerighteq = "⋭";
	var Nu = "Ν";
	var nu = "ν";
	var num = "#";
	var numero = "№";
	var numsp = " ";
	var nvap = "≍⃒";
	var nvdash = "⊬";
	var nvDash = "⊭";
	var nVdash = "⊮";
	var nVDash = "⊯";
	var nvge = "≥⃒";
	var nvgt = ">⃒";
	var nvHarr = "⤄";
	var nvinfin = "⧞";
	var nvlArr = "⤂";
	var nvle = "≤⃒";
	var nvlt = "<⃒";
	var nvltrie = "⊴⃒";
	var nvrArr = "⤃";
	var nvrtrie = "⊵⃒";
	var nvsim = "∼⃒";
	var nwarhk = "⤣";
	var nwarr = "↖";
	var nwArr = "⇖";
	var nwarrow = "↖";
	var nwnear = "⤧";
	var Oacute = "Ó";
	var oacute = "ó";
	var oast = "⊛";
	var Ocirc = "Ô";
	var ocirc = "ô";
	var ocir = "⊚";
	var Ocy = "О";
	var ocy = "о";
	var odash = "⊝";
	var Odblac = "Ő";
	var odblac = "ő";
	var odiv = "⨸";
	var odot = "⊙";
	var odsold = "⦼";
	var OElig = "Œ";
	var oelig = "œ";
	var ofcir = "⦿";
	var Ofr = "𝔒";
	var ofr = "𝔬";
	var ogon = "˛";
	var Ograve = "Ò";
	var ograve = "ò";
	var ogt = "⧁";
	var ohbar = "⦵";
	var ohm = "Ω";
	var oint = "∮";
	var olarr = "↺";
	var olcir = "⦾";
	var olcross = "⦻";
	var oline = "‾";
	var olt = "⧀";
	var Omacr = "Ō";
	var omacr = "ō";
	var Omega = "Ω";
	var omega = "ω";
	var Omicron = "Ο";
	var omicron = "ο";
	var omid = "⦶";
	var ominus = "⊖";
	var Oopf = "𝕆";
	var oopf = "𝕠";
	var opar = "⦷";
	var OpenCurlyDoubleQuote = "“";
	var OpenCurlyQuote = "‘";
	var operp = "⦹";
	var oplus = "⊕";
	var orarr = "↻";
	var Or = "⩔";
	var or = "∨";
	var ord = "⩝";
	var order = "ℴ";
	var orderof = "ℴ";
	var ordf = "ª";
	var ordm = "º";
	var origof = "⊶";
	var oror = "⩖";
	var orslope = "⩗";
	var orv = "⩛";
	var oS = "Ⓢ";
	var Oscr = "𝒪";
	var oscr = "ℴ";
	var Oslash = "Ø";
	var oslash = "ø";
	var osol = "⊘";
	var Otilde = "Õ";
	var otilde = "õ";
	var otimesas = "⨶";
	var Otimes = "⨷";
	var otimes = "⊗";
	var Ouml = "Ö";
	var ouml = "ö";
	var ovbar = "⌽";
	var OverBar = "‾";
	var OverBrace = "⏞";
	var OverBracket = "⎴";
	var OverParenthesis = "⏜";
	var para = "¶";
	var parallel = "∥";
	var par = "∥";
	var parsim = "⫳";
	var parsl = "⫽";
	var part = "∂";
	var PartialD = "∂";
	var Pcy = "П";
	var pcy = "п";
	var percnt = "%";
	var period = ".";
	var permil = "‰";
	var perp = "⊥";
	var pertenk = "‱";
	var Pfr = "𝔓";
	var pfr = "𝔭";
	var Phi = "Φ";
	var phi = "φ";
	var phiv = "ϕ";
	var phmmat = "ℳ";
	var phone = "☎";
	var Pi = "Π";
	var pi = "π";
	var pitchfork = "⋔";
	var piv = "ϖ";
	var planck = "ℏ";
	var planckh = "ℎ";
	var plankv = "ℏ";
	var plusacir = "⨣";
	var plusb = "⊞";
	var pluscir = "⨢";
	var plus = "+";
	var plusdo = "∔";
	var plusdu = "⨥";
	var pluse = "⩲";
	var PlusMinus = "±";
	var plusmn = "±";
	var plussim = "⨦";
	var plustwo = "⨧";
	var pm = "±";
	var Poincareplane = "ℌ";
	var pointint = "⨕";
	var popf = "𝕡";
	var Popf = "ℙ";
	var pound = "£";
	var prap = "⪷";
	var Pr = "⪻";
	var pr = "≺";
	var prcue = "≼";
	var precapprox = "⪷";
	var prec = "≺";
	var preccurlyeq = "≼";
	var Precedes = "≺";
	var PrecedesEqual = "⪯";
	var PrecedesSlantEqual = "≼";
	var PrecedesTilde = "≾";
	var preceq = "⪯";
	var precnapprox = "⪹";
	var precneqq = "⪵";
	var precnsim = "⋨";
	var pre = "⪯";
	var prE = "⪳";
	var precsim = "≾";
	var prime = "′";
	var Prime = "″";
	var primes = "ℙ";
	var prnap = "⪹";
	var prnE = "⪵";
	var prnsim = "⋨";
	var prod = "∏";
	var Product = "∏";
	var profalar = "⌮";
	var profline = "⌒";
	var profsurf = "⌓";
	var prop = "∝";
	var Proportional = "∝";
	var Proportion = "∷";
	var propto = "∝";
	var prsim = "≾";
	var prurel = "⊰";
	var Pscr = "𝒫";
	var pscr = "𝓅";
	var Psi = "Ψ";
	var psi = "ψ";
	var puncsp = " ";
	var Qfr = "𝔔";
	var qfr = "𝔮";
	var qint = "⨌";
	var qopf = "𝕢";
	var Qopf = "ℚ";
	var qprime = "⁗";
	var Qscr = "𝒬";
	var qscr = "𝓆";
	var quaternions = "ℍ";
	var quatint = "⨖";
	var quest = "?";
	var questeq = "≟";
	var quot = "\"";
	var QUOT = "\"";
	var rAarr = "⇛";
	var race = "∽̱";
	var Racute = "Ŕ";
	var racute = "ŕ";
	var radic = "√";
	var raemptyv = "⦳";
	var rang = "⟩";
	var Rang = "⟫";
	var rangd = "⦒";
	var range = "⦥";
	var rangle = "⟩";
	var raquo = "»";
	var rarrap = "⥵";
	var rarrb = "⇥";
	var rarrbfs = "⤠";
	var rarrc = "⤳";
	var rarr = "→";
	var Rarr = "↠";
	var rArr = "⇒";
	var rarrfs = "⤞";
	var rarrhk = "↪";
	var rarrlp = "↬";
	var rarrpl = "⥅";
	var rarrsim = "⥴";
	var Rarrtl = "⤖";
	var rarrtl = "↣";
	var rarrw = "↝";
	var ratail = "⤚";
	var rAtail = "⤜";
	var ratio = "∶";
	var rationals = "ℚ";
	var rbarr = "⤍";
	var rBarr = "⤏";
	var RBarr = "⤐";
	var rbbrk = "❳";
	var rbrace = "}";
	var rbrack = "]";
	var rbrke = "⦌";
	var rbrksld = "⦎";
	var rbrkslu = "⦐";
	var Rcaron = "Ř";
	var rcaron = "ř";
	var Rcedil = "Ŗ";
	var rcedil = "ŗ";
	var rceil = "⌉";
	var rcub = "}";
	var Rcy = "Р";
	var rcy = "р";
	var rdca = "⤷";
	var rdldhar = "⥩";
	var rdquo = "”";
	var rdquor = "”";
	var rdsh = "↳";
	var real = "ℜ";
	var realine = "ℛ";
	var realpart = "ℜ";
	var reals = "ℝ";
	var Re = "ℜ";
	var rect = "▭";
	var reg = "®";
	var REG = "®";
	var ReverseElement = "∋";
	var ReverseEquilibrium = "⇋";
	var ReverseUpEquilibrium = "⥯";
	var rfisht = "⥽";
	var rfloor = "⌋";
	var rfr = "𝔯";
	var Rfr = "ℜ";
	var rHar = "⥤";
	var rhard = "⇁";
	var rharu = "⇀";
	var rharul = "⥬";
	var Rho = "Ρ";
	var rho = "ρ";
	var rhov = "ϱ";
	var RightAngleBracket = "⟩";
	var RightArrowBar = "⇥";
	var rightarrow = "→";
	var RightArrow = "→";
	var Rightarrow = "⇒";
	var RightArrowLeftArrow = "⇄";
	var rightarrowtail = "↣";
	var RightCeiling = "⌉";
	var RightDoubleBracket = "⟧";
	var RightDownTeeVector = "⥝";
	var RightDownVectorBar = "⥕";
	var RightDownVector = "⇂";
	var RightFloor = "⌋";
	var rightharpoondown = "⇁";
	var rightharpoonup = "⇀";
	var rightleftarrows = "⇄";
	var rightleftharpoons = "⇌";
	var rightrightarrows = "⇉";
	var rightsquigarrow = "↝";
	var RightTeeArrow = "↦";
	var RightTee = "⊢";
	var RightTeeVector = "⥛";
	var rightthreetimes = "⋌";
	var RightTriangleBar = "⧐";
	var RightTriangle = "⊳";
	var RightTriangleEqual = "⊵";
	var RightUpDownVector = "⥏";
	var RightUpTeeVector = "⥜";
	var RightUpVectorBar = "⥔";
	var RightUpVector = "↾";
	var RightVectorBar = "⥓";
	var RightVector = "⇀";
	var ring = "˚";
	var risingdotseq = "≓";
	var rlarr = "⇄";
	var rlhar = "⇌";
	var rlm = "‏";
	var rmoustache = "⎱";
	var rmoust = "⎱";
	var rnmid = "⫮";
	var roang = "⟭";
	var roarr = "⇾";
	var robrk = "⟧";
	var ropar = "⦆";
	var ropf = "𝕣";
	var Ropf = "ℝ";
	var roplus = "⨮";
	var rotimes = "⨵";
	var RoundImplies = "⥰";
	var rpar = ")";
	var rpargt = "⦔";
	var rppolint = "⨒";
	var rrarr = "⇉";
	var Rrightarrow = "⇛";
	var rsaquo = "›";
	var rscr = "𝓇";
	var Rscr = "ℛ";
	var rsh = "↱";
	var Rsh = "↱";
	var rsqb = "]";
	var rsquo = "’";
	var rsquor = "’";
	var rthree = "⋌";
	var rtimes = "⋊";
	var rtri = "▹";
	var rtrie = "⊵";
	var rtrif = "▸";
	var rtriltri = "⧎";
	var RuleDelayed = "⧴";
	var ruluhar = "⥨";
	var rx = "℞";
	var Sacute = "Ś";
	var sacute = "ś";
	var sbquo = "‚";
	var scap = "⪸";
	var Scaron = "Š";
	var scaron = "š";
	var Sc = "⪼";
	var sc = "≻";
	var sccue = "≽";
	var sce = "⪰";
	var scE = "⪴";
	var Scedil = "Ş";
	var scedil = "ş";
	var Scirc = "Ŝ";
	var scirc = "ŝ";
	var scnap = "⪺";
	var scnE = "⪶";
	var scnsim = "⋩";
	var scpolint = "⨓";
	var scsim = "≿";
	var Scy = "С";
	var scy = "с";
	var sdotb = "⊡";
	var sdot = "⋅";
	var sdote = "⩦";
	var searhk = "⤥";
	var searr = "↘";
	var seArr = "⇘";
	var searrow = "↘";
	var sect = "§";
	var semi = ";";
	var seswar = "⤩";
	var setminus = "∖";
	var setmn = "∖";
	var sext = "✶";
	var Sfr = "𝔖";
	var sfr = "𝔰";
	var sfrown = "⌢";
	var sharp = "♯";
	var SHCHcy = "Щ";
	var shchcy = "щ";
	var SHcy = "Ш";
	var shcy = "ш";
	var ShortDownArrow = "↓";
	var ShortLeftArrow = "←";
	var shortmid = "∣";
	var shortparallel = "∥";
	var ShortRightArrow = "→";
	var ShortUpArrow = "↑";
	var shy = "­";
	var Sigma = "Σ";
	var sigma = "σ";
	var sigmaf = "ς";
	var sigmav = "ς";
	var sim = "∼";
	var simdot = "⩪";
	var sime = "≃";
	var simeq = "≃";
	var simg = "⪞";
	var simgE = "⪠";
	var siml = "⪝";
	var simlE = "⪟";
	var simne = "≆";
	var simplus = "⨤";
	var simrarr = "⥲";
	var slarr = "←";
	var SmallCircle = "∘";
	var smallsetminus = "∖";
	var smashp = "⨳";
	var smeparsl = "⧤";
	var smid = "∣";
	var smile = "⌣";
	var smt = "⪪";
	var smte = "⪬";
	var smtes = "⪬︀";
	var SOFTcy = "Ь";
	var softcy = "ь";
	var solbar = "⌿";
	var solb = "⧄";
	var sol = "/";
	var Sopf = "𝕊";
	var sopf = "𝕤";
	var spades = "♠";
	var spadesuit = "♠";
	var spar = "∥";
	var sqcap = "⊓";
	var sqcaps = "⊓︀";
	var sqcup = "⊔";
	var sqcups = "⊔︀";
	var Sqrt = "√";
	var sqsub = "⊏";
	var sqsube = "⊑";
	var sqsubset = "⊏";
	var sqsubseteq = "⊑";
	var sqsup = "⊐";
	var sqsupe = "⊒";
	var sqsupset = "⊐";
	var sqsupseteq = "⊒";
	var square = "□";
	var Square = "□";
	var SquareIntersection = "⊓";
	var SquareSubset = "⊏";
	var SquareSubsetEqual = "⊑";
	var SquareSuperset = "⊐";
	var SquareSupersetEqual = "⊒";
	var SquareUnion = "⊔";
	var squarf = "▪";
	var squ = "□";
	var squf = "▪";
	var srarr = "→";
	var Sscr = "𝒮";
	var sscr = "𝓈";
	var ssetmn = "∖";
	var ssmile = "⌣";
	var sstarf = "⋆";
	var Star = "⋆";
	var star = "☆";
	var starf = "★";
	var straightepsilon = "ϵ";
	var straightphi = "ϕ";
	var strns = "¯";
	var sub = "⊂";
	var Sub = "⋐";
	var subdot = "⪽";
	var subE = "⫅";
	var sube = "⊆";
	var subedot = "⫃";
	var submult = "⫁";
	var subnE = "⫋";
	var subne = "⊊";
	var subplus = "⪿";
	var subrarr = "⥹";
	var subset = "⊂";
	var Subset = "⋐";
	var subseteq = "⊆";
	var subseteqq = "⫅";
	var SubsetEqual = "⊆";
	var subsetneq = "⊊";
	var subsetneqq = "⫋";
	var subsim = "⫇";
	var subsub = "⫕";
	var subsup = "⫓";
	var succapprox = "⪸";
	var succ = "≻";
	var succcurlyeq = "≽";
	var Succeeds = "≻";
	var SucceedsEqual = "⪰";
	var SucceedsSlantEqual = "≽";
	var SucceedsTilde = "≿";
	var succeq = "⪰";
	var succnapprox = "⪺";
	var succneqq = "⪶";
	var succnsim = "⋩";
	var succsim = "≿";
	var SuchThat = "∋";
	var sum = "∑";
	var Sum = "∑";
	var sung = "♪";
	var sup1 = "¹";
	var sup2 = "²";
	var sup3 = "³";
	var sup = "⊃";
	var Sup = "⋑";
	var supdot = "⪾";
	var supdsub = "⫘";
	var supE = "⫆";
	var supe = "⊇";
	var supedot = "⫄";
	var Superset = "⊃";
	var SupersetEqual = "⊇";
	var suphsol = "⟉";
	var suphsub = "⫗";
	var suplarr = "⥻";
	var supmult = "⫂";
	var supnE = "⫌";
	var supne = "⊋";
	var supplus = "⫀";
	var supset = "⊃";
	var Supset = "⋑";
	var supseteq = "⊇";
	var supseteqq = "⫆";
	var supsetneq = "⊋";
	var supsetneqq = "⫌";
	var supsim = "⫈";
	var supsub = "⫔";
	var supsup = "⫖";
	var swarhk = "⤦";
	var swarr = "↙";
	var swArr = "⇙";
	var swarrow = "↙";
	var swnwar = "⤪";
	var szlig = "ß";
	var Tab = "\t";
	var target = "⌖";
	var Tau = "Τ";
	var tau = "τ";
	var tbrk = "⎴";
	var Tcaron = "Ť";
	var tcaron = "ť";
	var Tcedil = "Ţ";
	var tcedil = "ţ";
	var Tcy = "Т";
	var tcy = "т";
	var tdot = "⃛";
	var telrec = "⌕";
	var Tfr = "𝔗";
	var tfr = "𝔱";
	var there4 = "∴";
	var therefore = "∴";
	var Therefore = "∴";
	var Theta = "Θ";
	var theta = "θ";
	var thetasym = "ϑ";
	var thetav = "ϑ";
	var thickapprox = "≈";
	var thicksim = "∼";
	var ThickSpace = "  ";
	var ThinSpace = " ";
	var thinsp = " ";
	var thkap = "≈";
	var thksim = "∼";
	var THORN = "Þ";
	var thorn = "þ";
	var tilde = "˜";
	var Tilde = "∼";
	var TildeEqual = "≃";
	var TildeFullEqual = "≅";
	var TildeTilde = "≈";
	var timesbar = "⨱";
	var timesb = "⊠";
	var times = "×";
	var timesd = "⨰";
	var tint = "∭";
	var toea = "⤨";
	var topbot = "⌶";
	var topcir = "⫱";
	var top = "⊤";
	var Topf = "𝕋";
	var topf = "𝕥";
	var topfork = "⫚";
	var tosa = "⤩";
	var tprime = "‴";
	var trade = "™";
	var TRADE = "™";
	var triangle = "▵";
	var triangledown = "▿";
	var triangleleft = "◃";
	var trianglelefteq = "⊴";
	var triangleq = "≜";
	var triangleright = "▹";
	var trianglerighteq = "⊵";
	var tridot = "◬";
	var trie = "≜";
	var triminus = "⨺";
	var TripleDot = "⃛";
	var triplus = "⨹";
	var trisb = "⧍";
	var tritime = "⨻";
	var trpezium = "⏢";
	var Tscr = "𝒯";
	var tscr = "𝓉";
	var TScy = "Ц";
	var tscy = "ц";
	var TSHcy = "Ћ";
	var tshcy = "ћ";
	var Tstrok = "Ŧ";
	var tstrok = "ŧ";
	var twixt = "≬";
	var twoheadleftarrow = "↞";
	var twoheadrightarrow = "↠";
	var Uacute = "Ú";
	var uacute = "ú";
	var uarr = "↑";
	var Uarr = "↟";
	var uArr = "⇑";
	var Uarrocir = "⥉";
	var Ubrcy = "Ў";
	var ubrcy = "ў";
	var Ubreve = "Ŭ";
	var ubreve = "ŭ";
	var Ucirc = "Û";
	var ucirc = "û";
	var Ucy = "У";
	var ucy = "у";
	var udarr = "⇅";
	var Udblac = "Ű";
	var udblac = "ű";
	var udhar = "⥮";
	var ufisht = "⥾";
	var Ufr = "𝔘";
	var ufr = "𝔲";
	var Ugrave = "Ù";
	var ugrave = "ù";
	var uHar = "⥣";
	var uharl = "↿";
	var uharr = "↾";
	var uhblk = "▀";
	var ulcorn = "⌜";
	var ulcorner = "⌜";
	var ulcrop = "⌏";
	var ultri = "◸";
	var Umacr = "Ū";
	var umacr = "ū";
	var uml = "¨";
	var UnderBar = "_";
	var UnderBrace = "⏟";
	var UnderBracket = "⎵";
	var UnderParenthesis = "⏝";
	var Union = "⋃";
	var UnionPlus = "⊎";
	var Uogon = "Ų";
	var uogon = "ų";
	var Uopf = "𝕌";
	var uopf = "𝕦";
	var UpArrowBar = "⤒";
	var uparrow = "↑";
	var UpArrow = "↑";
	var Uparrow = "⇑";
	var UpArrowDownArrow = "⇅";
	var updownarrow = "↕";
	var UpDownArrow = "↕";
	var Updownarrow = "⇕";
	var UpEquilibrium = "⥮";
	var upharpoonleft = "↿";
	var upharpoonright = "↾";
	var uplus = "⊎";
	var UpperLeftArrow = "↖";
	var UpperRightArrow = "↗";
	var upsi = "υ";
	var Upsi = "ϒ";
	var upsih = "ϒ";
	var Upsilon = "Υ";
	var upsilon = "υ";
	var UpTeeArrow = "↥";
	var UpTee = "⊥";
	var upuparrows = "⇈";
	var urcorn = "⌝";
	var urcorner = "⌝";
	var urcrop = "⌎";
	var Uring = "Ů";
	var uring = "ů";
	var urtri = "◹";
	var Uscr = "𝒰";
	var uscr = "𝓊";
	var utdot = "⋰";
	var Utilde = "Ũ";
	var utilde = "ũ";
	var utri = "▵";
	var utrif = "▴";
	var uuarr = "⇈";
	var Uuml = "Ü";
	var uuml = "ü";
	var uwangle = "⦧";
	var vangrt = "⦜";
	var varepsilon = "ϵ";
	var varkappa = "ϰ";
	var varnothing = "∅";
	var varphi = "ϕ";
	var varpi = "ϖ";
	var varpropto = "∝";
	var varr = "↕";
	var vArr = "⇕";
	var varrho = "ϱ";
	var varsigma = "ς";
	var varsubsetneq = "⊊︀";
	var varsubsetneqq = "⫋︀";
	var varsupsetneq = "⊋︀";
	var varsupsetneqq = "⫌︀";
	var vartheta = "ϑ";
	var vartriangleleft = "⊲";
	var vartriangleright = "⊳";
	var vBar = "⫨";
	var Vbar = "⫫";
	var vBarv = "⫩";
	var Vcy = "В";
	var vcy = "в";
	var vdash = "⊢";
	var vDash = "⊨";
	var Vdash = "⊩";
	var VDash = "⊫";
	var Vdashl = "⫦";
	var veebar = "⊻";
	var vee = "∨";
	var Vee = "⋁";
	var veeeq = "≚";
	var vellip = "⋮";
	var verbar = "|";
	var Verbar = "‖";
	var vert = "|";
	var Vert = "‖";
	var VerticalBar = "∣";
	var VerticalLine = "|";
	var VerticalSeparator = "❘";
	var VerticalTilde = "≀";
	var VeryThinSpace = " ";
	var Vfr = "𝔙";
	var vfr = "𝔳";
	var vltri = "⊲";
	var vnsub = "⊂⃒";
	var vnsup = "⊃⃒";
	var Vopf = "𝕍";
	var vopf = "𝕧";
	var vprop = "∝";
	var vrtri = "⊳";
	var Vscr = "𝒱";
	var vscr = "𝓋";
	var vsubnE = "⫋︀";
	var vsubne = "⊊︀";
	var vsupnE = "⫌︀";
	var vsupne = "⊋︀";
	var Vvdash = "⊪";
	var vzigzag = "⦚";
	var Wcirc = "Ŵ";
	var wcirc = "ŵ";
	var wedbar = "⩟";
	var wedge = "∧";
	var Wedge = "⋀";
	var wedgeq = "≙";
	var weierp = "℘";
	var Wfr = "𝔚";
	var wfr = "𝔴";
	var Wopf = "𝕎";
	var wopf = "𝕨";
	var wp = "℘";
	var wr = "≀";
	var wreath = "≀";
	var Wscr = "𝒲";
	var wscr = "𝓌";
	var xcap = "⋂";
	var xcirc = "◯";
	var xcup = "⋃";
	var xdtri = "▽";
	var Xfr = "𝔛";
	var xfr = "𝔵";
	var xharr = "⟷";
	var xhArr = "⟺";
	var Xi = "Ξ";
	var xi = "ξ";
	var xlarr = "⟵";
	var xlArr = "⟸";
	var xmap = "⟼";
	var xnis = "⋻";
	var xodot = "⨀";
	var Xopf = "𝕏";
	var xopf = "𝕩";
	var xoplus = "⨁";
	var xotime = "⨂";
	var xrarr = "⟶";
	var xrArr = "⟹";
	var Xscr = "𝒳";
	var xscr = "𝓍";
	var xsqcup = "⨆";
	var xuplus = "⨄";
	var xutri = "△";
	var xvee = "⋁";
	var xwedge = "⋀";
	var Yacute = "Ý";
	var yacute = "ý";
	var YAcy = "Я";
	var yacy = "я";
	var Ycirc = "Ŷ";
	var ycirc = "ŷ";
	var Ycy = "Ы";
	var ycy = "ы";
	var yen = "¥";
	var Yfr = "𝔜";
	var yfr = "𝔶";
	var YIcy = "Ї";
	var yicy = "ї";
	var Yopf = "𝕐";
	var yopf = "𝕪";
	var Yscr = "𝒴";
	var yscr = "𝓎";
	var YUcy = "Ю";
	var yucy = "ю";
	var yuml = "ÿ";
	var Yuml = "Ÿ";
	var Zacute = "Ź";
	var zacute = "ź";
	var Zcaron = "Ž";
	var zcaron = "ž";
	var Zcy = "З";
	var zcy = "з";
	var Zdot = "Ż";
	var zdot = "ż";
	var zeetrf = "ℨ";
	var ZeroWidthSpace = "​";
	var Zeta = "Ζ";
	var zeta = "ζ";
	var zfr = "𝔷";
	var Zfr = "ℨ";
	var ZHcy = "Ж";
	var zhcy = "ж";
	var zigrarr = "⇝";
	var zopf = "𝕫";
	var Zopf = "ℤ";
	var Zscr = "𝒵";
	var zscr = "𝓏";
	var zwj = "‍";
	var zwnj = "‌";
	var entities = {
		Aacute: Aacute,
		aacute: aacute,
		Abreve: Abreve,
		abreve: abreve,
		ac: ac,
		acd: acd,
		acE: acE,
		Acirc: Acirc,
		acirc: acirc,
		acute: acute,
		Acy: Acy,
		acy: acy,
		AElig: AElig,
		aelig: aelig,
		af: af,
		Afr: Afr,
		afr: afr,
		Agrave: Agrave,
		agrave: agrave,
		alefsym: alefsym,
		aleph: aleph,
		Alpha: Alpha,
		alpha: alpha,
		Amacr: Amacr,
		amacr: amacr,
		amalg: amalg,
		amp: amp,
		AMP: AMP,
		andand: andand,
		And: And,
		and: and,
		andd: andd,
		andslope: andslope,
		andv: andv,
		ang: ang,
		ange: ange,
		angle: angle,
		angmsdaa: angmsdaa,
		angmsdab: angmsdab,
		angmsdac: angmsdac,
		angmsdad: angmsdad,
		angmsdae: angmsdae,
		angmsdaf: angmsdaf,
		angmsdag: angmsdag,
		angmsdah: angmsdah,
		angmsd: angmsd,
		angrt: angrt,
		angrtvb: angrtvb,
		angrtvbd: angrtvbd,
		angsph: angsph,
		angst: angst,
		angzarr: angzarr,
		Aogon: Aogon,
		aogon: aogon,
		Aopf: Aopf,
		aopf: aopf,
		apacir: apacir,
		ap: ap,
		apE: apE,
		ape: ape,
		apid: apid,
		apos: apos,
		ApplyFunction: ApplyFunction,
		approx: approx,
		approxeq: approxeq,
		Aring: Aring,
		aring: aring,
		Ascr: Ascr,
		ascr: ascr,
		Assign: Assign,
		ast: ast,
		asymp: asymp,
		asympeq: asympeq,
		Atilde: Atilde,
		atilde: atilde,
		Auml: Auml,
		auml: auml,
		awconint: awconint,
		awint: awint,
		backcong: backcong,
		backepsilon: backepsilon,
		backprime: backprime,
		backsim: backsim,
		backsimeq: backsimeq,
		Backslash: Backslash,
		Barv: Barv,
		barvee: barvee,
		barwed: barwed,
		Barwed: Barwed,
		barwedge: barwedge,
		bbrk: bbrk,
		bbrktbrk: bbrktbrk,
		bcong: bcong,
		Bcy: Bcy,
		bcy: bcy,
		bdquo: bdquo,
		becaus: becaus,
		because: because,
		Because: Because,
		bemptyv: bemptyv,
		bepsi: bepsi,
		bernou: bernou,
		Bernoullis: Bernoullis,
		Beta: Beta,
		beta: beta,
		beth: beth,
		between: between,
		Bfr: Bfr,
		bfr: bfr,
		bigcap: bigcap,
		bigcirc: bigcirc,
		bigcup: bigcup,
		bigodot: bigodot,
		bigoplus: bigoplus,
		bigotimes: bigotimes,
		bigsqcup: bigsqcup,
		bigstar: bigstar,
		bigtriangledown: bigtriangledown,
		bigtriangleup: bigtriangleup,
		biguplus: biguplus,
		bigvee: bigvee,
		bigwedge: bigwedge,
		bkarow: bkarow,
		blacklozenge: blacklozenge,
		blacksquare: blacksquare,
		blacktriangle: blacktriangle,
		blacktriangledown: blacktriangledown,
		blacktriangleleft: blacktriangleleft,
		blacktriangleright: blacktriangleright,
		blank: blank,
		blk12: blk12,
		blk14: blk14,
		blk34: blk34,
		block: block,
		bne: bne,
		bnequiv: bnequiv,
		bNot: bNot,
		bnot: bnot,
		Bopf: Bopf,
		bopf: bopf,
		bot: bot,
		bottom: bottom,
		bowtie: bowtie,
		boxbox: boxbox,
		boxdl: boxdl,
		boxdL: boxdL,
		boxDl: boxDl,
		boxDL: boxDL,
		boxdr: boxdr,
		boxdR: boxdR,
		boxDr: boxDr,
		boxDR: boxDR,
		boxh: boxh,
		boxH: boxH,
		boxhd: boxhd,
		boxHd: boxHd,
		boxhD: boxhD,
		boxHD: boxHD,
		boxhu: boxhu,
		boxHu: boxHu,
		boxhU: boxhU,
		boxHU: boxHU,
		boxminus: boxminus,
		boxplus: boxplus,
		boxtimes: boxtimes,
		boxul: boxul,
		boxuL: boxuL,
		boxUl: boxUl,
		boxUL: boxUL,
		boxur: boxur,
		boxuR: boxuR,
		boxUr: boxUr,
		boxUR: boxUR,
		boxv: boxv,
		boxV: boxV,
		boxvh: boxvh,
		boxvH: boxvH,
		boxVh: boxVh,
		boxVH: boxVH,
		boxvl: boxvl,
		boxvL: boxvL,
		boxVl: boxVl,
		boxVL: boxVL,
		boxvr: boxvr,
		boxvR: boxvR,
		boxVr: boxVr,
		boxVR: boxVR,
		bprime: bprime,
		breve: breve,
		Breve: Breve,
		brvbar: brvbar,
		bscr: bscr,
		Bscr: Bscr,
		bsemi: bsemi,
		bsim: bsim,
		bsime: bsime,
		bsolb: bsolb,
		bsol: bsol,
		bsolhsub: bsolhsub,
		bull: bull,
		bullet: bullet,
		bump: bump,
		bumpE: bumpE,
		bumpe: bumpe,
		Bumpeq: Bumpeq,
		bumpeq: bumpeq,
		Cacute: Cacute,
		cacute: cacute,
		capand: capand,
		capbrcup: capbrcup,
		capcap: capcap,
		cap: cap,
		Cap: Cap,
		capcup: capcup,
		capdot: capdot,
		CapitalDifferentialD: CapitalDifferentialD,
		caps: caps,
		caret: caret,
		caron: caron,
		Cayleys: Cayleys,
		ccaps: ccaps,
		Ccaron: Ccaron,
		ccaron: ccaron,
		Ccedil: Ccedil,
		ccedil: ccedil,
		Ccirc: Ccirc,
		ccirc: ccirc,
		Cconint: Cconint,
		ccups: ccups,
		ccupssm: ccupssm,
		Cdot: Cdot,
		cdot: cdot,
		cedil: cedil,
		Cedilla: Cedilla,
		cemptyv: cemptyv,
		cent: cent,
		centerdot: centerdot,
		CenterDot: CenterDot,
		cfr: cfr,
		Cfr: Cfr,
		CHcy: CHcy,
		chcy: chcy,
		check: check,
		checkmark: checkmark,
		Chi: Chi,
		chi: chi,
		circ: circ,
		circeq: circeq,
		circlearrowleft: circlearrowleft,
		circlearrowright: circlearrowright,
		circledast: circledast,
		circledcirc: circledcirc,
		circleddash: circleddash,
		CircleDot: CircleDot,
		circledR: circledR,
		circledS: circledS,
		CircleMinus: CircleMinus,
		CirclePlus: CirclePlus,
		CircleTimes: CircleTimes,
		cir: cir,
		cirE: cirE,
		cire: cire,
		cirfnint: cirfnint,
		cirmid: cirmid,
		cirscir: cirscir,
		ClockwiseContourIntegral: ClockwiseContourIntegral,
		CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
		CloseCurlyQuote: CloseCurlyQuote,
		clubs: clubs,
		clubsuit: clubsuit,
		colon: colon,
		Colon: Colon,
		Colone: Colone,
		colone: colone,
		coloneq: coloneq,
		comma: comma,
		commat: commat,
		comp: comp,
		compfn: compfn,
		complement: complement,
		complexes: complexes,
		cong: cong,
		congdot: congdot,
		Congruent: Congruent,
		conint: conint,
		Conint: Conint,
		ContourIntegral: ContourIntegral,
		copf: copf,
		Copf: Copf,
		coprod: coprod,
		Coproduct: Coproduct,
		copy: copy,
		COPY: COPY,
		copysr: copysr,
		CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
		crarr: crarr,
		cross: cross,
		Cross: Cross,
		Cscr: Cscr,
		cscr: cscr,
		csub: csub,
		csube: csube,
		csup: csup,
		csupe: csupe,
		ctdot: ctdot,
		cudarrl: cudarrl,
		cudarrr: cudarrr,
		cuepr: cuepr,
		cuesc: cuesc,
		cularr: cularr,
		cularrp: cularrp,
		cupbrcap: cupbrcap,
		cupcap: cupcap,
		CupCap: CupCap,
		cup: cup,
		Cup: Cup,
		cupcup: cupcup,
		cupdot: cupdot,
		cupor: cupor,
		cups: cups,
		curarr: curarr,
		curarrm: curarrm,
		curlyeqprec: curlyeqprec,
		curlyeqsucc: curlyeqsucc,
		curlyvee: curlyvee,
		curlywedge: curlywedge,
		curren: curren,
		curvearrowleft: curvearrowleft,
		curvearrowright: curvearrowright,
		cuvee: cuvee,
		cuwed: cuwed,
		cwconint: cwconint,
		cwint: cwint,
		cylcty: cylcty,
		dagger: dagger,
		Dagger: Dagger,
		daleth: daleth,
		darr: darr,
		Darr: Darr,
		dArr: dArr,
		dash: dash,
		Dashv: Dashv,
		dashv: dashv,
		dbkarow: dbkarow,
		dblac: dblac,
		Dcaron: Dcaron,
		dcaron: dcaron,
		Dcy: Dcy,
		dcy: dcy,
		ddagger: ddagger,
		ddarr: ddarr,
		DD: DD,
		dd: dd,
		DDotrahd: DDotrahd,
		ddotseq: ddotseq,
		deg: deg,
		Del: Del,
		Delta: Delta,
		delta: delta,
		demptyv: demptyv,
		dfisht: dfisht,
		Dfr: Dfr,
		dfr: dfr,
		dHar: dHar,
		dharl: dharl,
		dharr: dharr,
		DiacriticalAcute: DiacriticalAcute,
		DiacriticalDot: DiacriticalDot,
		DiacriticalDoubleAcute: DiacriticalDoubleAcute,
		DiacriticalGrave: DiacriticalGrave,
		DiacriticalTilde: DiacriticalTilde,
		diam: diam,
		diamond: diamond,
		Diamond: Diamond,
		diamondsuit: diamondsuit,
		diams: diams,
		die: die,
		DifferentialD: DifferentialD,
		digamma: digamma,
		disin: disin,
		div: div,
		divide: divide,
		divideontimes: divideontimes,
		divonx: divonx,
		DJcy: DJcy,
		djcy: djcy,
		dlcorn: dlcorn,
		dlcrop: dlcrop,
		dollar: dollar,
		Dopf: Dopf,
		dopf: dopf,
		Dot: Dot,
		dot: dot,
		DotDot: DotDot,
		doteq: doteq,
		doteqdot: doteqdot,
		DotEqual: DotEqual,
		dotminus: dotminus,
		dotplus: dotplus,
		dotsquare: dotsquare,
		doublebarwedge: doublebarwedge,
		DoubleContourIntegral: DoubleContourIntegral,
		DoubleDot: DoubleDot,
		DoubleDownArrow: DoubleDownArrow,
		DoubleLeftArrow: DoubleLeftArrow,
		DoubleLeftRightArrow: DoubleLeftRightArrow,
		DoubleLeftTee: DoubleLeftTee,
		DoubleLongLeftArrow: DoubleLongLeftArrow,
		DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
		DoubleLongRightArrow: DoubleLongRightArrow,
		DoubleRightArrow: DoubleRightArrow,
		DoubleRightTee: DoubleRightTee,
		DoubleUpArrow: DoubleUpArrow,
		DoubleUpDownArrow: DoubleUpDownArrow,
		DoubleVerticalBar: DoubleVerticalBar,
		DownArrowBar: DownArrowBar,
		downarrow: downarrow,
		DownArrow: DownArrow,
		Downarrow: Downarrow,
		DownArrowUpArrow: DownArrowUpArrow,
		DownBreve: DownBreve,
		downdownarrows: downdownarrows,
		downharpoonleft: downharpoonleft,
		downharpoonright: downharpoonright,
		DownLeftRightVector: DownLeftRightVector,
		DownLeftTeeVector: DownLeftTeeVector,
		DownLeftVectorBar: DownLeftVectorBar,
		DownLeftVector: DownLeftVector,
		DownRightTeeVector: DownRightTeeVector,
		DownRightVectorBar: DownRightVectorBar,
		DownRightVector: DownRightVector,
		DownTeeArrow: DownTeeArrow,
		DownTee: DownTee,
		drbkarow: drbkarow,
		drcorn: drcorn,
		drcrop: drcrop,
		Dscr: Dscr,
		dscr: dscr,
		DScy: DScy,
		dscy: dscy,
		dsol: dsol,
		Dstrok: Dstrok,
		dstrok: dstrok,
		dtdot: dtdot,
		dtri: dtri,
		dtrif: dtrif,
		duarr: duarr,
		duhar: duhar,
		dwangle: dwangle,
		DZcy: DZcy,
		dzcy: dzcy,
		dzigrarr: dzigrarr,
		Eacute: Eacute,
		eacute: eacute,
		easter: easter,
		Ecaron: Ecaron,
		ecaron: ecaron,
		Ecirc: Ecirc,
		ecirc: ecirc,
		ecir: ecir,
		ecolon: ecolon,
		Ecy: Ecy,
		ecy: ecy,
		eDDot: eDDot,
		Edot: Edot,
		edot: edot,
		eDot: eDot,
		ee: ee,
		efDot: efDot,
		Efr: Efr,
		efr: efr,
		eg: eg,
		Egrave: Egrave,
		egrave: egrave,
		egs: egs,
		egsdot: egsdot,
		el: el,
		Element: Element,
		elinters: elinters,
		ell: ell,
		els: els,
		elsdot: elsdot,
		Emacr: Emacr,
		emacr: emacr,
		empty: empty,
		emptyset: emptyset,
		EmptySmallSquare: EmptySmallSquare,
		emptyv: emptyv,
		EmptyVerySmallSquare: EmptyVerySmallSquare,
		emsp13: emsp13,
		emsp14: emsp14,
		emsp: emsp,
		ENG: ENG,
		eng: eng,
		ensp: ensp,
		Eogon: Eogon,
		eogon: eogon,
		Eopf: Eopf,
		eopf: eopf,
		epar: epar,
		eparsl: eparsl,
		eplus: eplus,
		epsi: epsi,
		Epsilon: Epsilon,
		epsilon: epsilon,
		epsiv: epsiv,
		eqcirc: eqcirc,
		eqcolon: eqcolon,
		eqsim: eqsim,
		eqslantgtr: eqslantgtr,
		eqslantless: eqslantless,
		Equal: Equal,
		equals: equals,
		EqualTilde: EqualTilde,
		equest: equest,
		Equilibrium: Equilibrium,
		equiv: equiv,
		equivDD: equivDD,
		eqvparsl: eqvparsl,
		erarr: erarr,
		erDot: erDot,
		escr: escr,
		Escr: Escr,
		esdot: esdot,
		Esim: Esim,
		esim: esim,
		Eta: Eta,
		eta: eta,
		ETH: ETH,
		eth: eth,
		Euml: Euml,
		euml: euml,
		euro: euro,
		excl: excl,
		exist: exist,
		Exists: Exists,
		expectation: expectation,
		exponentiale: exponentiale,
		ExponentialE: ExponentialE,
		fallingdotseq: fallingdotseq,
		Fcy: Fcy,
		fcy: fcy,
		female: female,
		ffilig: ffilig,
		fflig: fflig,
		ffllig: ffllig,
		Ffr: Ffr,
		ffr: ffr,
		filig: filig,
		FilledSmallSquare: FilledSmallSquare,
		FilledVerySmallSquare: FilledVerySmallSquare,
		fjlig: fjlig,
		flat: flat,
		fllig: fllig,
		fltns: fltns,
		fnof: fnof,
		Fopf: Fopf,
		fopf: fopf,
		forall: forall,
		ForAll: ForAll,
		fork: fork,
		forkv: forkv,
		Fouriertrf: Fouriertrf,
		fpartint: fpartint,
		frac12: frac12,
		frac13: frac13,
		frac14: frac14,
		frac15: frac15,
		frac16: frac16,
		frac18: frac18,
		frac23: frac23,
		frac25: frac25,
		frac34: frac34,
		frac35: frac35,
		frac38: frac38,
		frac45: frac45,
		frac56: frac56,
		frac58: frac58,
		frac78: frac78,
		frasl: frasl,
		frown: frown,
		fscr: fscr,
		Fscr: Fscr,
		gacute: gacute,
		Gamma: Gamma,
		gamma: gamma,
		Gammad: Gammad,
		gammad: gammad,
		gap: gap,
		Gbreve: Gbreve,
		gbreve: gbreve,
		Gcedil: Gcedil,
		Gcirc: Gcirc,
		gcirc: gcirc,
		Gcy: Gcy,
		gcy: gcy,
		Gdot: Gdot,
		gdot: gdot,
		ge: ge,
		gE: gE,
		gEl: gEl,
		gel: gel,
		geq: geq,
		geqq: geqq,
		geqslant: geqslant,
		gescc: gescc,
		ges: ges,
		gesdot: gesdot,
		gesdoto: gesdoto,
		gesdotol: gesdotol,
		gesl: gesl,
		gesles: gesles,
		Gfr: Gfr,
		gfr: gfr,
		gg: gg,
		Gg: Gg,
		ggg: ggg,
		gimel: gimel,
		GJcy: GJcy,
		gjcy: gjcy,
		gla: gla,
		gl: gl,
		glE: glE,
		glj: glj,
		gnap: gnap,
		gnapprox: gnapprox,
		gne: gne,
		gnE: gnE,
		gneq: gneq,
		gneqq: gneqq,
		gnsim: gnsim,
		Gopf: Gopf,
		gopf: gopf,
		grave: grave,
		GreaterEqual: GreaterEqual,
		GreaterEqualLess: GreaterEqualLess,
		GreaterFullEqual: GreaterFullEqual,
		GreaterGreater: GreaterGreater,
		GreaterLess: GreaterLess,
		GreaterSlantEqual: GreaterSlantEqual,
		GreaterTilde: GreaterTilde,
		Gscr: Gscr,
		gscr: gscr,
		gsim: gsim,
		gsime: gsime,
		gsiml: gsiml,
		gtcc: gtcc,
		gtcir: gtcir,
		gt: gt,
		GT: GT,
		Gt: Gt,
		gtdot: gtdot,
		gtlPar: gtlPar,
		gtquest: gtquest,
		gtrapprox: gtrapprox,
		gtrarr: gtrarr,
		gtrdot: gtrdot,
		gtreqless: gtreqless,
		gtreqqless: gtreqqless,
		gtrless: gtrless,
		gtrsim: gtrsim,
		gvertneqq: gvertneqq,
		gvnE: gvnE,
		Hacek: Hacek,
		hairsp: hairsp,
		half: half,
		hamilt: hamilt,
		HARDcy: HARDcy,
		hardcy: hardcy,
		harrcir: harrcir,
		harr: harr,
		hArr: hArr,
		harrw: harrw,
		Hat: Hat,
		hbar: hbar,
		Hcirc: Hcirc,
		hcirc: hcirc,
		hearts: hearts,
		heartsuit: heartsuit,
		hellip: hellip,
		hercon: hercon,
		hfr: hfr,
		Hfr: Hfr,
		HilbertSpace: HilbertSpace,
		hksearow: hksearow,
		hkswarow: hkswarow,
		hoarr: hoarr,
		homtht: homtht,
		hookleftarrow: hookleftarrow,
		hookrightarrow: hookrightarrow,
		hopf: hopf,
		Hopf: Hopf,
		horbar: horbar,
		HorizontalLine: HorizontalLine,
		hscr: hscr,
		Hscr: Hscr,
		hslash: hslash,
		Hstrok: Hstrok,
		hstrok: hstrok,
		HumpDownHump: HumpDownHump,
		HumpEqual: HumpEqual,
		hybull: hybull,
		hyphen: hyphen,
		Iacute: Iacute,
		iacute: iacute,
		ic: ic,
		Icirc: Icirc,
		icirc: icirc,
		Icy: Icy,
		icy: icy,
		Idot: Idot,
		IEcy: IEcy,
		iecy: iecy,
		iexcl: iexcl,
		iff: iff,
		ifr: ifr,
		Ifr: Ifr,
		Igrave: Igrave,
		igrave: igrave,
		ii: ii,
		iiiint: iiiint,
		iiint: iiint,
		iinfin: iinfin,
		iiota: iiota,
		IJlig: IJlig,
		ijlig: ijlig,
		Imacr: Imacr,
		imacr: imacr,
		image: image,
		ImaginaryI: ImaginaryI,
		imagline: imagline,
		imagpart: imagpart,
		imath: imath,
		Im: Im,
		imof: imof,
		imped: imped,
		Implies: Implies,
		incare: incare,
		"in": "∈",
		infin: infin,
		infintie: infintie,
		inodot: inodot,
		intcal: intcal,
		int: int,
		Int: Int,
		integers: integers,
		Integral: Integral,
		intercal: intercal,
		Intersection: Intersection,
		intlarhk: intlarhk,
		intprod: intprod,
		InvisibleComma: InvisibleComma,
		InvisibleTimes: InvisibleTimes,
		IOcy: IOcy,
		iocy: iocy,
		Iogon: Iogon,
		iogon: iogon,
		Iopf: Iopf,
		iopf: iopf,
		Iota: Iota,
		iota: iota,
		iprod: iprod,
		iquest: iquest,
		iscr: iscr,
		Iscr: Iscr,
		isin: isin,
		isindot: isindot,
		isinE: isinE,
		isins: isins,
		isinsv: isinsv,
		isinv: isinv,
		it: it,
		Itilde: Itilde,
		itilde: itilde,
		Iukcy: Iukcy,
		iukcy: iukcy,
		Iuml: Iuml,
		iuml: iuml,
		Jcirc: Jcirc,
		jcirc: jcirc,
		Jcy: Jcy,
		jcy: jcy,
		Jfr: Jfr,
		jfr: jfr,
		jmath: jmath,
		Jopf: Jopf,
		jopf: jopf,
		Jscr: Jscr,
		jscr: jscr,
		Jsercy: Jsercy,
		jsercy: jsercy,
		Jukcy: Jukcy,
		jukcy: jukcy,
		Kappa: Kappa,
		kappa: kappa,
		kappav: kappav,
		Kcedil: Kcedil,
		kcedil: kcedil,
		Kcy: Kcy,
		kcy: kcy,
		Kfr: Kfr,
		kfr: kfr,
		kgreen: kgreen,
		KHcy: KHcy,
		khcy: khcy,
		KJcy: KJcy,
		kjcy: kjcy,
		Kopf: Kopf,
		kopf: kopf,
		Kscr: Kscr,
		kscr: kscr,
		lAarr: lAarr,
		Lacute: Lacute,
		lacute: lacute,
		laemptyv: laemptyv,
		lagran: lagran,
		Lambda: Lambda,
		lambda: lambda,
		lang: lang,
		Lang: Lang,
		langd: langd,
		langle: langle,
		lap: lap,
		Laplacetrf: Laplacetrf,
		laquo: laquo,
		larrb: larrb,
		larrbfs: larrbfs,
		larr: larr,
		Larr: Larr,
		lArr: lArr,
		larrfs: larrfs,
		larrhk: larrhk,
		larrlp: larrlp,
		larrpl: larrpl,
		larrsim: larrsim,
		larrtl: larrtl,
		latail: latail,
		lAtail: lAtail,
		lat: lat,
		late: late,
		lates: lates,
		lbarr: lbarr,
		lBarr: lBarr,
		lbbrk: lbbrk,
		lbrace: lbrace,
		lbrack: lbrack,
		lbrke: lbrke,
		lbrksld: lbrksld,
		lbrkslu: lbrkslu,
		Lcaron: Lcaron,
		lcaron: lcaron,
		Lcedil: Lcedil,
		lcedil: lcedil,
		lceil: lceil,
		lcub: lcub,
		Lcy: Lcy,
		lcy: lcy,
		ldca: ldca,
		ldquo: ldquo,
		ldquor: ldquor,
		ldrdhar: ldrdhar,
		ldrushar: ldrushar,
		ldsh: ldsh,
		le: le,
		lE: lE,
		LeftAngleBracket: LeftAngleBracket,
		LeftArrowBar: LeftArrowBar,
		leftarrow: leftarrow,
		LeftArrow: LeftArrow,
		Leftarrow: Leftarrow,
		LeftArrowRightArrow: LeftArrowRightArrow,
		leftarrowtail: leftarrowtail,
		LeftCeiling: LeftCeiling,
		LeftDoubleBracket: LeftDoubleBracket,
		LeftDownTeeVector: LeftDownTeeVector,
		LeftDownVectorBar: LeftDownVectorBar,
		LeftDownVector: LeftDownVector,
		LeftFloor: LeftFloor,
		leftharpoondown: leftharpoondown,
		leftharpoonup: leftharpoonup,
		leftleftarrows: leftleftarrows,
		leftrightarrow: leftrightarrow,
		LeftRightArrow: LeftRightArrow,
		Leftrightarrow: Leftrightarrow,
		leftrightarrows: leftrightarrows,
		leftrightharpoons: leftrightharpoons,
		leftrightsquigarrow: leftrightsquigarrow,
		LeftRightVector: LeftRightVector,
		LeftTeeArrow: LeftTeeArrow,
		LeftTee: LeftTee,
		LeftTeeVector: LeftTeeVector,
		leftthreetimes: leftthreetimes,
		LeftTriangleBar: LeftTriangleBar,
		LeftTriangle: LeftTriangle,
		LeftTriangleEqual: LeftTriangleEqual,
		LeftUpDownVector: LeftUpDownVector,
		LeftUpTeeVector: LeftUpTeeVector,
		LeftUpVectorBar: LeftUpVectorBar,
		LeftUpVector: LeftUpVector,
		LeftVectorBar: LeftVectorBar,
		LeftVector: LeftVector,
		lEg: lEg,
		leg: leg,
		leq: leq,
		leqq: leqq,
		leqslant: leqslant,
		lescc: lescc,
		les: les,
		lesdot: lesdot,
		lesdoto: lesdoto,
		lesdotor: lesdotor,
		lesg: lesg,
		lesges: lesges,
		lessapprox: lessapprox,
		lessdot: lessdot,
		lesseqgtr: lesseqgtr,
		lesseqqgtr: lesseqqgtr,
		LessEqualGreater: LessEqualGreater,
		LessFullEqual: LessFullEqual,
		LessGreater: LessGreater,
		lessgtr: lessgtr,
		LessLess: LessLess,
		lesssim: lesssim,
		LessSlantEqual: LessSlantEqual,
		LessTilde: LessTilde,
		lfisht: lfisht,
		lfloor: lfloor,
		Lfr: Lfr,
		lfr: lfr,
		lg: lg,
		lgE: lgE,
		lHar: lHar,
		lhard: lhard,
		lharu: lharu,
		lharul: lharul,
		lhblk: lhblk,
		LJcy: LJcy,
		ljcy: ljcy,
		llarr: llarr,
		ll: ll,
		Ll: Ll,
		llcorner: llcorner,
		Lleftarrow: Lleftarrow,
		llhard: llhard,
		lltri: lltri,
		Lmidot: Lmidot,
		lmidot: lmidot,
		lmoustache: lmoustache,
		lmoust: lmoust,
		lnap: lnap,
		lnapprox: lnapprox,
		lne: lne,
		lnE: lnE,
		lneq: lneq,
		lneqq: lneqq,
		lnsim: lnsim,
		loang: loang,
		loarr: loarr,
		lobrk: lobrk,
		longleftarrow: longleftarrow,
		LongLeftArrow: LongLeftArrow,
		Longleftarrow: Longleftarrow,
		longleftrightarrow: longleftrightarrow,
		LongLeftRightArrow: LongLeftRightArrow,
		Longleftrightarrow: Longleftrightarrow,
		longmapsto: longmapsto,
		longrightarrow: longrightarrow,
		LongRightArrow: LongRightArrow,
		Longrightarrow: Longrightarrow,
		looparrowleft: looparrowleft,
		looparrowright: looparrowright,
		lopar: lopar,
		Lopf: Lopf,
		lopf: lopf,
		loplus: loplus,
		lotimes: lotimes,
		lowast: lowast,
		lowbar: lowbar,
		LowerLeftArrow: LowerLeftArrow,
		LowerRightArrow: LowerRightArrow,
		loz: loz,
		lozenge: lozenge,
		lozf: lozf,
		lpar: lpar,
		lparlt: lparlt,
		lrarr: lrarr,
		lrcorner: lrcorner,
		lrhar: lrhar,
		lrhard: lrhard,
		lrm: lrm,
		lrtri: lrtri,
		lsaquo: lsaquo,
		lscr: lscr,
		Lscr: Lscr,
		lsh: lsh,
		Lsh: Lsh,
		lsim: lsim,
		lsime: lsime,
		lsimg: lsimg,
		lsqb: lsqb,
		lsquo: lsquo,
		lsquor: lsquor,
		Lstrok: Lstrok,
		lstrok: lstrok,
		ltcc: ltcc,
		ltcir: ltcir,
		lt: lt,
		LT: LT,
		Lt: Lt,
		ltdot: ltdot,
		lthree: lthree,
		ltimes: ltimes,
		ltlarr: ltlarr,
		ltquest: ltquest,
		ltri: ltri,
		ltrie: ltrie,
		ltrif: ltrif,
		ltrPar: ltrPar,
		lurdshar: lurdshar,
		luruhar: luruhar,
		lvertneqq: lvertneqq,
		lvnE: lvnE,
		macr: macr,
		male: male,
		malt: malt,
		maltese: maltese,
		"Map": "⤅",
		map: map,
		mapsto: mapsto,
		mapstodown: mapstodown,
		mapstoleft: mapstoleft,
		mapstoup: mapstoup,
		marker: marker,
		mcomma: mcomma,
		Mcy: Mcy,
		mcy: mcy,
		mdash: mdash,
		mDDot: mDDot,
		measuredangle: measuredangle,
		MediumSpace: MediumSpace,
		Mellintrf: Mellintrf,
		Mfr: Mfr,
		mfr: mfr,
		mho: mho,
		micro: micro,
		midast: midast,
		midcir: midcir,
		mid: mid,
		middot: middot,
		minusb: minusb,
		minus: minus,
		minusd: minusd,
		minusdu: minusdu,
		MinusPlus: MinusPlus,
		mlcp: mlcp,
		mldr: mldr,
		mnplus: mnplus,
		models: models,
		Mopf: Mopf,
		mopf: mopf,
		mp: mp,
		mscr: mscr,
		Mscr: Mscr,
		mstpos: mstpos,
		Mu: Mu,
		mu: mu,
		multimap: multimap,
		mumap: mumap,
		nabla: nabla,
		Nacute: Nacute,
		nacute: nacute,
		nang: nang,
		nap: nap,
		napE: napE,
		napid: napid,
		napos: napos,
		napprox: napprox,
		natural: natural,
		naturals: naturals,
		natur: natur,
		nbsp: nbsp,
		nbump: nbump,
		nbumpe: nbumpe,
		ncap: ncap,
		Ncaron: Ncaron,
		ncaron: ncaron,
		Ncedil: Ncedil,
		ncedil: ncedil,
		ncong: ncong,
		ncongdot: ncongdot,
		ncup: ncup,
		Ncy: Ncy,
		ncy: ncy,
		ndash: ndash,
		nearhk: nearhk,
		nearr: nearr,
		neArr: neArr,
		nearrow: nearrow,
		ne: ne,
		nedot: nedot,
		NegativeMediumSpace: NegativeMediumSpace,
		NegativeThickSpace: NegativeThickSpace,
		NegativeThinSpace: NegativeThinSpace,
		NegativeVeryThinSpace: NegativeVeryThinSpace,
		nequiv: nequiv,
		nesear: nesear,
		nesim: nesim,
		NestedGreaterGreater: NestedGreaterGreater,
		NestedLessLess: NestedLessLess,
		NewLine: NewLine,
		nexist: nexist,
		nexists: nexists,
		Nfr: Nfr,
		nfr: nfr,
		ngE: ngE,
		nge: nge,
		ngeq: ngeq,
		ngeqq: ngeqq,
		ngeqslant: ngeqslant,
		nges: nges,
		nGg: nGg,
		ngsim: ngsim,
		nGt: nGt,
		ngt: ngt,
		ngtr: ngtr,
		nGtv: nGtv,
		nharr: nharr,
		nhArr: nhArr,
		nhpar: nhpar,
		ni: ni,
		nis: nis,
		nisd: nisd,
		niv: niv,
		NJcy: NJcy,
		njcy: njcy,
		nlarr: nlarr,
		nlArr: nlArr,
		nldr: nldr,
		nlE: nlE,
		nle: nle,
		nleftarrow: nleftarrow,
		nLeftarrow: nLeftarrow,
		nleftrightarrow: nleftrightarrow,
		nLeftrightarrow: nLeftrightarrow,
		nleq: nleq,
		nleqq: nleqq,
		nleqslant: nleqslant,
		nles: nles,
		nless: nless,
		nLl: nLl,
		nlsim: nlsim,
		nLt: nLt,
		nlt: nlt,
		nltri: nltri,
		nltrie: nltrie,
		nLtv: nLtv,
		nmid: nmid,
		NoBreak: NoBreak,
		NonBreakingSpace: NonBreakingSpace,
		nopf: nopf,
		Nopf: Nopf,
		Not: Not,
		not: not,
		NotCongruent: NotCongruent,
		NotCupCap: NotCupCap,
		NotDoubleVerticalBar: NotDoubleVerticalBar,
		NotElement: NotElement,
		NotEqual: NotEqual,
		NotEqualTilde: NotEqualTilde,
		NotExists: NotExists,
		NotGreater: NotGreater,
		NotGreaterEqual: NotGreaterEqual,
		NotGreaterFullEqual: NotGreaterFullEqual,
		NotGreaterGreater: NotGreaterGreater,
		NotGreaterLess: NotGreaterLess,
		NotGreaterSlantEqual: NotGreaterSlantEqual,
		NotGreaterTilde: NotGreaterTilde,
		NotHumpDownHump: NotHumpDownHump,
		NotHumpEqual: NotHumpEqual,
		notin: notin,
		notindot: notindot,
		notinE: notinE,
		notinva: notinva,
		notinvb: notinvb,
		notinvc: notinvc,
		NotLeftTriangleBar: NotLeftTriangleBar,
		NotLeftTriangle: NotLeftTriangle,
		NotLeftTriangleEqual: NotLeftTriangleEqual,
		NotLess: NotLess,
		NotLessEqual: NotLessEqual,
		NotLessGreater: NotLessGreater,
		NotLessLess: NotLessLess,
		NotLessSlantEqual: NotLessSlantEqual,
		NotLessTilde: NotLessTilde,
		NotNestedGreaterGreater: NotNestedGreaterGreater,
		NotNestedLessLess: NotNestedLessLess,
		notni: notni,
		notniva: notniva,
		notnivb: notnivb,
		notnivc: notnivc,
		NotPrecedes: NotPrecedes,
		NotPrecedesEqual: NotPrecedesEqual,
		NotPrecedesSlantEqual: NotPrecedesSlantEqual,
		NotReverseElement: NotReverseElement,
		NotRightTriangleBar: NotRightTriangleBar,
		NotRightTriangle: NotRightTriangle,
		NotRightTriangleEqual: NotRightTriangleEqual,
		NotSquareSubset: NotSquareSubset,
		NotSquareSubsetEqual: NotSquareSubsetEqual,
		NotSquareSuperset: NotSquareSuperset,
		NotSquareSupersetEqual: NotSquareSupersetEqual,
		NotSubset: NotSubset,
		NotSubsetEqual: NotSubsetEqual,
		NotSucceeds: NotSucceeds,
		NotSucceedsEqual: NotSucceedsEqual,
		NotSucceedsSlantEqual: NotSucceedsSlantEqual,
		NotSucceedsTilde: NotSucceedsTilde,
		NotSuperset: NotSuperset,
		NotSupersetEqual: NotSupersetEqual,
		NotTilde: NotTilde,
		NotTildeEqual: NotTildeEqual,
		NotTildeFullEqual: NotTildeFullEqual,
		NotTildeTilde: NotTildeTilde,
		NotVerticalBar: NotVerticalBar,
		nparallel: nparallel,
		npar: npar,
		nparsl: nparsl,
		npart: npart,
		npolint: npolint,
		npr: npr,
		nprcue: nprcue,
		nprec: nprec,
		npreceq: npreceq,
		npre: npre,
		nrarrc: nrarrc,
		nrarr: nrarr,
		nrArr: nrArr,
		nrarrw: nrarrw,
		nrightarrow: nrightarrow,
		nRightarrow: nRightarrow,
		nrtri: nrtri,
		nrtrie: nrtrie,
		nsc: nsc,
		nsccue: nsccue,
		nsce: nsce,
		Nscr: Nscr,
		nscr: nscr,
		nshortmid: nshortmid,
		nshortparallel: nshortparallel,
		nsim: nsim,
		nsime: nsime,
		nsimeq: nsimeq,
		nsmid: nsmid,
		nspar: nspar,
		nsqsube: nsqsube,
		nsqsupe: nsqsupe,
		nsub: nsub,
		nsubE: nsubE,
		nsube: nsube,
		nsubset: nsubset,
		nsubseteq: nsubseteq,
		nsubseteqq: nsubseteqq,
		nsucc: nsucc,
		nsucceq: nsucceq,
		nsup: nsup,
		nsupE: nsupE,
		nsupe: nsupe,
		nsupset: nsupset,
		nsupseteq: nsupseteq,
		nsupseteqq: nsupseteqq,
		ntgl: ntgl,
		Ntilde: Ntilde,
		ntilde: ntilde,
		ntlg: ntlg,
		ntriangleleft: ntriangleleft,
		ntrianglelefteq: ntrianglelefteq,
		ntriangleright: ntriangleright,
		ntrianglerighteq: ntrianglerighteq,
		Nu: Nu,
		nu: nu,
		num: num,
		numero: numero,
		numsp: numsp,
		nvap: nvap,
		nvdash: nvdash,
		nvDash: nvDash,
		nVdash: nVdash,
		nVDash: nVDash,
		nvge: nvge,
		nvgt: nvgt,
		nvHarr: nvHarr,
		nvinfin: nvinfin,
		nvlArr: nvlArr,
		nvle: nvle,
		nvlt: nvlt,
		nvltrie: nvltrie,
		nvrArr: nvrArr,
		nvrtrie: nvrtrie,
		nvsim: nvsim,
		nwarhk: nwarhk,
		nwarr: nwarr,
		nwArr: nwArr,
		nwarrow: nwarrow,
		nwnear: nwnear,
		Oacute: Oacute,
		oacute: oacute,
		oast: oast,
		Ocirc: Ocirc,
		ocirc: ocirc,
		ocir: ocir,
		Ocy: Ocy,
		ocy: ocy,
		odash: odash,
		Odblac: Odblac,
		odblac: odblac,
		odiv: odiv,
		odot: odot,
		odsold: odsold,
		OElig: OElig,
		oelig: oelig,
		ofcir: ofcir,
		Ofr: Ofr,
		ofr: ofr,
		ogon: ogon,
		Ograve: Ograve,
		ograve: ograve,
		ogt: ogt,
		ohbar: ohbar,
		ohm: ohm,
		oint: oint,
		olarr: olarr,
		olcir: olcir,
		olcross: olcross,
		oline: oline,
		olt: olt,
		Omacr: Omacr,
		omacr: omacr,
		Omega: Omega,
		omega: omega,
		Omicron: Omicron,
		omicron: omicron,
		omid: omid,
		ominus: ominus,
		Oopf: Oopf,
		oopf: oopf,
		opar: opar,
		OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
		OpenCurlyQuote: OpenCurlyQuote,
		operp: operp,
		oplus: oplus,
		orarr: orarr,
		Or: Or,
		or: or,
		ord: ord,
		order: order,
		orderof: orderof,
		ordf: ordf,
		ordm: ordm,
		origof: origof,
		oror: oror,
		orslope: orslope,
		orv: orv,
		oS: oS,
		Oscr: Oscr,
		oscr: oscr,
		Oslash: Oslash,
		oslash: oslash,
		osol: osol,
		Otilde: Otilde,
		otilde: otilde,
		otimesas: otimesas,
		Otimes: Otimes,
		otimes: otimes,
		Ouml: Ouml,
		ouml: ouml,
		ovbar: ovbar,
		OverBar: OverBar,
		OverBrace: OverBrace,
		OverBracket: OverBracket,
		OverParenthesis: OverParenthesis,
		para: para,
		parallel: parallel,
		par: par,
		parsim: parsim,
		parsl: parsl,
		part: part,
		PartialD: PartialD,
		Pcy: Pcy,
		pcy: pcy,
		percnt: percnt,
		period: period,
		permil: permil,
		perp: perp,
		pertenk: pertenk,
		Pfr: Pfr,
		pfr: pfr,
		Phi: Phi,
		phi: phi,
		phiv: phiv,
		phmmat: phmmat,
		phone: phone,
		Pi: Pi,
		pi: pi,
		pitchfork: pitchfork,
		piv: piv,
		planck: planck,
		planckh: planckh,
		plankv: plankv,
		plusacir: plusacir,
		plusb: plusb,
		pluscir: pluscir,
		plus: plus,
		plusdo: plusdo,
		plusdu: plusdu,
		pluse: pluse,
		PlusMinus: PlusMinus,
		plusmn: plusmn,
		plussim: plussim,
		plustwo: plustwo,
		pm: pm,
		Poincareplane: Poincareplane,
		pointint: pointint,
		popf: popf,
		Popf: Popf,
		pound: pound,
		prap: prap,
		Pr: Pr,
		pr: pr,
		prcue: prcue,
		precapprox: precapprox,
		prec: prec,
		preccurlyeq: preccurlyeq,
		Precedes: Precedes,
		PrecedesEqual: PrecedesEqual,
		PrecedesSlantEqual: PrecedesSlantEqual,
		PrecedesTilde: PrecedesTilde,
		preceq: preceq,
		precnapprox: precnapprox,
		precneqq: precneqq,
		precnsim: precnsim,
		pre: pre,
		prE: prE,
		precsim: precsim,
		prime: prime,
		Prime: Prime,
		primes: primes,
		prnap: prnap,
		prnE: prnE,
		prnsim: prnsim,
		prod: prod,
		Product: Product,
		profalar: profalar,
		profline: profline,
		profsurf: profsurf,
		prop: prop,
		Proportional: Proportional,
		Proportion: Proportion,
		propto: propto,
		prsim: prsim,
		prurel: prurel,
		Pscr: Pscr,
		pscr: pscr,
		Psi: Psi,
		psi: psi,
		puncsp: puncsp,
		Qfr: Qfr,
		qfr: qfr,
		qint: qint,
		qopf: qopf,
		Qopf: Qopf,
		qprime: qprime,
		Qscr: Qscr,
		qscr: qscr,
		quaternions: quaternions,
		quatint: quatint,
		quest: quest,
		questeq: questeq,
		quot: quot,
		QUOT: QUOT,
		rAarr: rAarr,
		race: race,
		Racute: Racute,
		racute: racute,
		radic: radic,
		raemptyv: raemptyv,
		rang: rang,
		Rang: Rang,
		rangd: rangd,
		range: range,
		rangle: rangle,
		raquo: raquo,
		rarrap: rarrap,
		rarrb: rarrb,
		rarrbfs: rarrbfs,
		rarrc: rarrc,
		rarr: rarr,
		Rarr: Rarr,
		rArr: rArr,
		rarrfs: rarrfs,
		rarrhk: rarrhk,
		rarrlp: rarrlp,
		rarrpl: rarrpl,
		rarrsim: rarrsim,
		Rarrtl: Rarrtl,
		rarrtl: rarrtl,
		rarrw: rarrw,
		ratail: ratail,
		rAtail: rAtail,
		ratio: ratio,
		rationals: rationals,
		rbarr: rbarr,
		rBarr: rBarr,
		RBarr: RBarr,
		rbbrk: rbbrk,
		rbrace: rbrace,
		rbrack: rbrack,
		rbrke: rbrke,
		rbrksld: rbrksld,
		rbrkslu: rbrkslu,
		Rcaron: Rcaron,
		rcaron: rcaron,
		Rcedil: Rcedil,
		rcedil: rcedil,
		rceil: rceil,
		rcub: rcub,
		Rcy: Rcy,
		rcy: rcy,
		rdca: rdca,
		rdldhar: rdldhar,
		rdquo: rdquo,
		rdquor: rdquor,
		rdsh: rdsh,
		real: real,
		realine: realine,
		realpart: realpart,
		reals: reals,
		Re: Re,
		rect: rect,
		reg: reg,
		REG: REG,
		ReverseElement: ReverseElement,
		ReverseEquilibrium: ReverseEquilibrium,
		ReverseUpEquilibrium: ReverseUpEquilibrium,
		rfisht: rfisht,
		rfloor: rfloor,
		rfr: rfr,
		Rfr: Rfr,
		rHar: rHar,
		rhard: rhard,
		rharu: rharu,
		rharul: rharul,
		Rho: Rho,
		rho: rho,
		rhov: rhov,
		RightAngleBracket: RightAngleBracket,
		RightArrowBar: RightArrowBar,
		rightarrow: rightarrow,
		RightArrow: RightArrow,
		Rightarrow: Rightarrow,
		RightArrowLeftArrow: RightArrowLeftArrow,
		rightarrowtail: rightarrowtail,
		RightCeiling: RightCeiling,
		RightDoubleBracket: RightDoubleBracket,
		RightDownTeeVector: RightDownTeeVector,
		RightDownVectorBar: RightDownVectorBar,
		RightDownVector: RightDownVector,
		RightFloor: RightFloor,
		rightharpoondown: rightharpoondown,
		rightharpoonup: rightharpoonup,
		rightleftarrows: rightleftarrows,
		rightleftharpoons: rightleftharpoons,
		rightrightarrows: rightrightarrows,
		rightsquigarrow: rightsquigarrow,
		RightTeeArrow: RightTeeArrow,
		RightTee: RightTee,
		RightTeeVector: RightTeeVector,
		rightthreetimes: rightthreetimes,
		RightTriangleBar: RightTriangleBar,
		RightTriangle: RightTriangle,
		RightTriangleEqual: RightTriangleEqual,
		RightUpDownVector: RightUpDownVector,
		RightUpTeeVector: RightUpTeeVector,
		RightUpVectorBar: RightUpVectorBar,
		RightUpVector: RightUpVector,
		RightVectorBar: RightVectorBar,
		RightVector: RightVector,
		ring: ring,
		risingdotseq: risingdotseq,
		rlarr: rlarr,
		rlhar: rlhar,
		rlm: rlm,
		rmoustache: rmoustache,
		rmoust: rmoust,
		rnmid: rnmid,
		roang: roang,
		roarr: roarr,
		robrk: robrk,
		ropar: ropar,
		ropf: ropf,
		Ropf: Ropf,
		roplus: roplus,
		rotimes: rotimes,
		RoundImplies: RoundImplies,
		rpar: rpar,
		rpargt: rpargt,
		rppolint: rppolint,
		rrarr: rrarr,
		Rrightarrow: Rrightarrow,
		rsaquo: rsaquo,
		rscr: rscr,
		Rscr: Rscr,
		rsh: rsh,
		Rsh: Rsh,
		rsqb: rsqb,
		rsquo: rsquo,
		rsquor: rsquor,
		rthree: rthree,
		rtimes: rtimes,
		rtri: rtri,
		rtrie: rtrie,
		rtrif: rtrif,
		rtriltri: rtriltri,
		RuleDelayed: RuleDelayed,
		ruluhar: ruluhar,
		rx: rx,
		Sacute: Sacute,
		sacute: sacute,
		sbquo: sbquo,
		scap: scap,
		Scaron: Scaron,
		scaron: scaron,
		Sc: Sc,
		sc: sc,
		sccue: sccue,
		sce: sce,
		scE: scE,
		Scedil: Scedil,
		scedil: scedil,
		Scirc: Scirc,
		scirc: scirc,
		scnap: scnap,
		scnE: scnE,
		scnsim: scnsim,
		scpolint: scpolint,
		scsim: scsim,
		Scy: Scy,
		scy: scy,
		sdotb: sdotb,
		sdot: sdot,
		sdote: sdote,
		searhk: searhk,
		searr: searr,
		seArr: seArr,
		searrow: searrow,
		sect: sect,
		semi: semi,
		seswar: seswar,
		setminus: setminus,
		setmn: setmn,
		sext: sext,
		Sfr: Sfr,
		sfr: sfr,
		sfrown: sfrown,
		sharp: sharp,
		SHCHcy: SHCHcy,
		shchcy: shchcy,
		SHcy: SHcy,
		shcy: shcy,
		ShortDownArrow: ShortDownArrow,
		ShortLeftArrow: ShortLeftArrow,
		shortmid: shortmid,
		shortparallel: shortparallel,
		ShortRightArrow: ShortRightArrow,
		ShortUpArrow: ShortUpArrow,
		shy: shy,
		Sigma: Sigma,
		sigma: sigma,
		sigmaf: sigmaf,
		sigmav: sigmav,
		sim: sim,
		simdot: simdot,
		sime: sime,
		simeq: simeq,
		simg: simg,
		simgE: simgE,
		siml: siml,
		simlE: simlE,
		simne: simne,
		simplus: simplus,
		simrarr: simrarr,
		slarr: slarr,
		SmallCircle: SmallCircle,
		smallsetminus: smallsetminus,
		smashp: smashp,
		smeparsl: smeparsl,
		smid: smid,
		smile: smile,
		smt: smt,
		smte: smte,
		smtes: smtes,
		SOFTcy: SOFTcy,
		softcy: softcy,
		solbar: solbar,
		solb: solb,
		sol: sol,
		Sopf: Sopf,
		sopf: sopf,
		spades: spades,
		spadesuit: spadesuit,
		spar: spar,
		sqcap: sqcap,
		sqcaps: sqcaps,
		sqcup: sqcup,
		sqcups: sqcups,
		Sqrt: Sqrt,
		sqsub: sqsub,
		sqsube: sqsube,
		sqsubset: sqsubset,
		sqsubseteq: sqsubseteq,
		sqsup: sqsup,
		sqsupe: sqsupe,
		sqsupset: sqsupset,
		sqsupseteq: sqsupseteq,
		square: square,
		Square: Square,
		SquareIntersection: SquareIntersection,
		SquareSubset: SquareSubset,
		SquareSubsetEqual: SquareSubsetEqual,
		SquareSuperset: SquareSuperset,
		SquareSupersetEqual: SquareSupersetEqual,
		SquareUnion: SquareUnion,
		squarf: squarf,
		squ: squ,
		squf: squf,
		srarr: srarr,
		Sscr: Sscr,
		sscr: sscr,
		ssetmn: ssetmn,
		ssmile: ssmile,
		sstarf: sstarf,
		Star: Star,
		star: star,
		starf: starf,
		straightepsilon: straightepsilon,
		straightphi: straightphi,
		strns: strns,
		sub: sub,
		Sub: Sub,
		subdot: subdot,
		subE: subE,
		sube: sube,
		subedot: subedot,
		submult: submult,
		subnE: subnE,
		subne: subne,
		subplus: subplus,
		subrarr: subrarr,
		subset: subset,
		Subset: Subset,
		subseteq: subseteq,
		subseteqq: subseteqq,
		SubsetEqual: SubsetEqual,
		subsetneq: subsetneq,
		subsetneqq: subsetneqq,
		subsim: subsim,
		subsub: subsub,
		subsup: subsup,
		succapprox: succapprox,
		succ: succ,
		succcurlyeq: succcurlyeq,
		Succeeds: Succeeds,
		SucceedsEqual: SucceedsEqual,
		SucceedsSlantEqual: SucceedsSlantEqual,
		SucceedsTilde: SucceedsTilde,
		succeq: succeq,
		succnapprox: succnapprox,
		succneqq: succneqq,
		succnsim: succnsim,
		succsim: succsim,
		SuchThat: SuchThat,
		sum: sum,
		Sum: Sum,
		sung: sung,
		sup1: sup1,
		sup2: sup2,
		sup3: sup3,
		sup: sup,
		Sup: Sup,
		supdot: supdot,
		supdsub: supdsub,
		supE: supE,
		supe: supe,
		supedot: supedot,
		Superset: Superset,
		SupersetEqual: SupersetEqual,
		suphsol: suphsol,
		suphsub: suphsub,
		suplarr: suplarr,
		supmult: supmult,
		supnE: supnE,
		supne: supne,
		supplus: supplus,
		supset: supset,
		Supset: Supset,
		supseteq: supseteq,
		supseteqq: supseteqq,
		supsetneq: supsetneq,
		supsetneqq: supsetneqq,
		supsim: supsim,
		supsub: supsub,
		supsup: supsup,
		swarhk: swarhk,
		swarr: swarr,
		swArr: swArr,
		swarrow: swarrow,
		swnwar: swnwar,
		szlig: szlig,
		Tab: Tab,
		target: target,
		Tau: Tau,
		tau: tau,
		tbrk: tbrk,
		Tcaron: Tcaron,
		tcaron: tcaron,
		Tcedil: Tcedil,
		tcedil: tcedil,
		Tcy: Tcy,
		tcy: tcy,
		tdot: tdot,
		telrec: telrec,
		Tfr: Tfr,
		tfr: tfr,
		there4: there4,
		therefore: therefore,
		Therefore: Therefore,
		Theta: Theta,
		theta: theta,
		thetasym: thetasym,
		thetav: thetav,
		thickapprox: thickapprox,
		thicksim: thicksim,
		ThickSpace: ThickSpace,
		ThinSpace: ThinSpace,
		thinsp: thinsp,
		thkap: thkap,
		thksim: thksim,
		THORN: THORN,
		thorn: thorn,
		tilde: tilde,
		Tilde: Tilde,
		TildeEqual: TildeEqual,
		TildeFullEqual: TildeFullEqual,
		TildeTilde: TildeTilde,
		timesbar: timesbar,
		timesb: timesb,
		times: times,
		timesd: timesd,
		tint: tint,
		toea: toea,
		topbot: topbot,
		topcir: topcir,
		top: top,
		Topf: Topf,
		topf: topf,
		topfork: topfork,
		tosa: tosa,
		tprime: tprime,
		trade: trade,
		TRADE: TRADE,
		triangle: triangle,
		triangledown: triangledown,
		triangleleft: triangleleft,
		trianglelefteq: trianglelefteq,
		triangleq: triangleq,
		triangleright: triangleright,
		trianglerighteq: trianglerighteq,
		tridot: tridot,
		trie: trie,
		triminus: triminus,
		TripleDot: TripleDot,
		triplus: triplus,
		trisb: trisb,
		tritime: tritime,
		trpezium: trpezium,
		Tscr: Tscr,
		tscr: tscr,
		TScy: TScy,
		tscy: tscy,
		TSHcy: TSHcy,
		tshcy: tshcy,
		Tstrok: Tstrok,
		tstrok: tstrok,
		twixt: twixt,
		twoheadleftarrow: twoheadleftarrow,
		twoheadrightarrow: twoheadrightarrow,
		Uacute: Uacute,
		uacute: uacute,
		uarr: uarr,
		Uarr: Uarr,
		uArr: uArr,
		Uarrocir: Uarrocir,
		Ubrcy: Ubrcy,
		ubrcy: ubrcy,
		Ubreve: Ubreve,
		ubreve: ubreve,
		Ucirc: Ucirc,
		ucirc: ucirc,
		Ucy: Ucy,
		ucy: ucy,
		udarr: udarr,
		Udblac: Udblac,
		udblac: udblac,
		udhar: udhar,
		ufisht: ufisht,
		Ufr: Ufr,
		ufr: ufr,
		Ugrave: Ugrave,
		ugrave: ugrave,
		uHar: uHar,
		uharl: uharl,
		uharr: uharr,
		uhblk: uhblk,
		ulcorn: ulcorn,
		ulcorner: ulcorner,
		ulcrop: ulcrop,
		ultri: ultri,
		Umacr: Umacr,
		umacr: umacr,
		uml: uml,
		UnderBar: UnderBar,
		UnderBrace: UnderBrace,
		UnderBracket: UnderBracket,
		UnderParenthesis: UnderParenthesis,
		Union: Union,
		UnionPlus: UnionPlus,
		Uogon: Uogon,
		uogon: uogon,
		Uopf: Uopf,
		uopf: uopf,
		UpArrowBar: UpArrowBar,
		uparrow: uparrow,
		UpArrow: UpArrow,
		Uparrow: Uparrow,
		UpArrowDownArrow: UpArrowDownArrow,
		updownarrow: updownarrow,
		UpDownArrow: UpDownArrow,
		Updownarrow: Updownarrow,
		UpEquilibrium: UpEquilibrium,
		upharpoonleft: upharpoonleft,
		upharpoonright: upharpoonright,
		uplus: uplus,
		UpperLeftArrow: UpperLeftArrow,
		UpperRightArrow: UpperRightArrow,
		upsi: upsi,
		Upsi: Upsi,
		upsih: upsih,
		Upsilon: Upsilon,
		upsilon: upsilon,
		UpTeeArrow: UpTeeArrow,
		UpTee: UpTee,
		upuparrows: upuparrows,
		urcorn: urcorn,
		urcorner: urcorner,
		urcrop: urcrop,
		Uring: Uring,
		uring: uring,
		urtri: urtri,
		Uscr: Uscr,
		uscr: uscr,
		utdot: utdot,
		Utilde: Utilde,
		utilde: utilde,
		utri: utri,
		utrif: utrif,
		uuarr: uuarr,
		Uuml: Uuml,
		uuml: uuml,
		uwangle: uwangle,
		vangrt: vangrt,
		varepsilon: varepsilon,
		varkappa: varkappa,
		varnothing: varnothing,
		varphi: varphi,
		varpi: varpi,
		varpropto: varpropto,
		varr: varr,
		vArr: vArr,
		varrho: varrho,
		varsigma: varsigma,
		varsubsetneq: varsubsetneq,
		varsubsetneqq: varsubsetneqq,
		varsupsetneq: varsupsetneq,
		varsupsetneqq: varsupsetneqq,
		vartheta: vartheta,
		vartriangleleft: vartriangleleft,
		vartriangleright: vartriangleright,
		vBar: vBar,
		Vbar: Vbar,
		vBarv: vBarv,
		Vcy: Vcy,
		vcy: vcy,
		vdash: vdash,
		vDash: vDash,
		Vdash: Vdash,
		VDash: VDash,
		Vdashl: Vdashl,
		veebar: veebar,
		vee: vee,
		Vee: Vee,
		veeeq: veeeq,
		vellip: vellip,
		verbar: verbar,
		Verbar: Verbar,
		vert: vert,
		Vert: Vert,
		VerticalBar: VerticalBar,
		VerticalLine: VerticalLine,
		VerticalSeparator: VerticalSeparator,
		VerticalTilde: VerticalTilde,
		VeryThinSpace: VeryThinSpace,
		Vfr: Vfr,
		vfr: vfr,
		vltri: vltri,
		vnsub: vnsub,
		vnsup: vnsup,
		Vopf: Vopf,
		vopf: vopf,
		vprop: vprop,
		vrtri: vrtri,
		Vscr: Vscr,
		vscr: vscr,
		vsubnE: vsubnE,
		vsubne: vsubne,
		vsupnE: vsupnE,
		vsupne: vsupne,
		Vvdash: Vvdash,
		vzigzag: vzigzag,
		Wcirc: Wcirc,
		wcirc: wcirc,
		wedbar: wedbar,
		wedge: wedge,
		Wedge: Wedge,
		wedgeq: wedgeq,
		weierp: weierp,
		Wfr: Wfr,
		wfr: wfr,
		Wopf: Wopf,
		wopf: wopf,
		wp: wp,
		wr: wr,
		wreath: wreath,
		Wscr: Wscr,
		wscr: wscr,
		xcap: xcap,
		xcirc: xcirc,
		xcup: xcup,
		xdtri: xdtri,
		Xfr: Xfr,
		xfr: xfr,
		xharr: xharr,
		xhArr: xhArr,
		Xi: Xi,
		xi: xi,
		xlarr: xlarr,
		xlArr: xlArr,
		xmap: xmap,
		xnis: xnis,
		xodot: xodot,
		Xopf: Xopf,
		xopf: xopf,
		xoplus: xoplus,
		xotime: xotime,
		xrarr: xrarr,
		xrArr: xrArr,
		Xscr: Xscr,
		xscr: xscr,
		xsqcup: xsqcup,
		xuplus: xuplus,
		xutri: xutri,
		xvee: xvee,
		xwedge: xwedge,
		Yacute: Yacute,
		yacute: yacute,
		YAcy: YAcy,
		yacy: yacy,
		Ycirc: Ycirc,
		ycirc: ycirc,
		Ycy: Ycy,
		ycy: ycy,
		yen: yen,
		Yfr: Yfr,
		yfr: yfr,
		YIcy: YIcy,
		yicy: yicy,
		Yopf: Yopf,
		yopf: yopf,
		Yscr: Yscr,
		yscr: yscr,
		YUcy: YUcy,
		yucy: yucy,
		yuml: yuml,
		Yuml: Yuml,
		Zacute: Zacute,
		zacute: zacute,
		Zcaron: Zcaron,
		zcaron: zcaron,
		Zcy: Zcy,
		zcy: zcy,
		Zdot: Zdot,
		zdot: zdot,
		zeetrf: zeetrf,
		ZeroWidthSpace: ZeroWidthSpace,
		Zeta: Zeta,
		zeta: zeta,
		zfr: zfr,
		Zfr: Zfr,
		ZHcy: ZHcy,
		zhcy: zhcy,
		zigrarr: zigrarr,
		zopf: zopf,
		Zopf: Zopf,
		Zscr: Zscr,
		zscr: zscr,
		zwj: zwj,
		zwnj: zwnj
	};

	var entities$1 = {
		__proto__: null,
		Aacute: Aacute,
		aacute: aacute,
		Abreve: Abreve,
		abreve: abreve,
		ac: ac,
		acd: acd,
		acE: acE,
		Acirc: Acirc,
		acirc: acirc,
		acute: acute,
		Acy: Acy,
		acy: acy,
		AElig: AElig,
		aelig: aelig,
		af: af,
		Afr: Afr,
		afr: afr,
		Agrave: Agrave,
		agrave: agrave,
		alefsym: alefsym,
		aleph: aleph,
		Alpha: Alpha,
		alpha: alpha,
		Amacr: Amacr,
		amacr: amacr,
		amalg: amalg,
		amp: amp,
		AMP: AMP,
		andand: andand,
		And: And,
		and: and,
		andd: andd,
		andslope: andslope,
		andv: andv,
		ang: ang,
		ange: ange,
		angle: angle,
		angmsdaa: angmsdaa,
		angmsdab: angmsdab,
		angmsdac: angmsdac,
		angmsdad: angmsdad,
		angmsdae: angmsdae,
		angmsdaf: angmsdaf,
		angmsdag: angmsdag,
		angmsdah: angmsdah,
		angmsd: angmsd,
		angrt: angrt,
		angrtvb: angrtvb,
		angrtvbd: angrtvbd,
		angsph: angsph,
		angst: angst,
		angzarr: angzarr,
		Aogon: Aogon,
		aogon: aogon,
		Aopf: Aopf,
		aopf: aopf,
		apacir: apacir,
		ap: ap,
		apE: apE,
		ape: ape,
		apid: apid,
		apos: apos,
		ApplyFunction: ApplyFunction,
		approx: approx,
		approxeq: approxeq,
		Aring: Aring,
		aring: aring,
		Ascr: Ascr,
		ascr: ascr,
		Assign: Assign,
		ast: ast,
		asymp: asymp,
		asympeq: asympeq,
		Atilde: Atilde,
		atilde: atilde,
		Auml: Auml,
		auml: auml,
		awconint: awconint,
		awint: awint,
		backcong: backcong,
		backepsilon: backepsilon,
		backprime: backprime,
		backsim: backsim,
		backsimeq: backsimeq,
		Backslash: Backslash,
		Barv: Barv,
		barvee: barvee,
		barwed: barwed,
		Barwed: Barwed,
		barwedge: barwedge,
		bbrk: bbrk,
		bbrktbrk: bbrktbrk,
		bcong: bcong,
		Bcy: Bcy,
		bcy: bcy,
		bdquo: bdquo,
		becaus: becaus,
		because: because,
		Because: Because,
		bemptyv: bemptyv,
		bepsi: bepsi,
		bernou: bernou,
		Bernoullis: Bernoullis,
		Beta: Beta,
		beta: beta,
		beth: beth,
		between: between,
		Bfr: Bfr,
		bfr: bfr,
		bigcap: bigcap,
		bigcirc: bigcirc,
		bigcup: bigcup,
		bigodot: bigodot,
		bigoplus: bigoplus,
		bigotimes: bigotimes,
		bigsqcup: bigsqcup,
		bigstar: bigstar,
		bigtriangledown: bigtriangledown,
		bigtriangleup: bigtriangleup,
		biguplus: biguplus,
		bigvee: bigvee,
		bigwedge: bigwedge,
		bkarow: bkarow,
		blacklozenge: blacklozenge,
		blacksquare: blacksquare,
		blacktriangle: blacktriangle,
		blacktriangledown: blacktriangledown,
		blacktriangleleft: blacktriangleleft,
		blacktriangleright: blacktriangleright,
		blank: blank,
		blk12: blk12,
		blk14: blk14,
		blk34: blk34,
		block: block,
		bne: bne,
		bnequiv: bnequiv,
		bNot: bNot,
		bnot: bnot,
		Bopf: Bopf,
		bopf: bopf,
		bot: bot,
		bottom: bottom,
		bowtie: bowtie,
		boxbox: boxbox,
		boxdl: boxdl,
		boxdL: boxdL,
		boxDl: boxDl,
		boxDL: boxDL,
		boxdr: boxdr,
		boxdR: boxdR,
		boxDr: boxDr,
		boxDR: boxDR,
		boxh: boxh,
		boxH: boxH,
		boxhd: boxhd,
		boxHd: boxHd,
		boxhD: boxhD,
		boxHD: boxHD,
		boxhu: boxhu,
		boxHu: boxHu,
		boxhU: boxhU,
		boxHU: boxHU,
		boxminus: boxminus,
		boxplus: boxplus,
		boxtimes: boxtimes,
		boxul: boxul,
		boxuL: boxuL,
		boxUl: boxUl,
		boxUL: boxUL,
		boxur: boxur,
		boxuR: boxuR,
		boxUr: boxUr,
		boxUR: boxUR,
		boxv: boxv,
		boxV: boxV,
		boxvh: boxvh,
		boxvH: boxvH,
		boxVh: boxVh,
		boxVH: boxVH,
		boxvl: boxvl,
		boxvL: boxvL,
		boxVl: boxVl,
		boxVL: boxVL,
		boxvr: boxvr,
		boxvR: boxvR,
		boxVr: boxVr,
		boxVR: boxVR,
		bprime: bprime,
		breve: breve,
		Breve: Breve,
		brvbar: brvbar,
		bscr: bscr,
		Bscr: Bscr,
		bsemi: bsemi,
		bsim: bsim,
		bsime: bsime,
		bsolb: bsolb,
		bsol: bsol,
		bsolhsub: bsolhsub,
		bull: bull,
		bullet: bullet,
		bump: bump,
		bumpE: bumpE,
		bumpe: bumpe,
		Bumpeq: Bumpeq,
		bumpeq: bumpeq,
		Cacute: Cacute,
		cacute: cacute,
		capand: capand,
		capbrcup: capbrcup,
		capcap: capcap,
		cap: cap,
		Cap: Cap,
		capcup: capcup,
		capdot: capdot,
		CapitalDifferentialD: CapitalDifferentialD,
		caps: caps,
		caret: caret,
		caron: caron,
		Cayleys: Cayleys,
		ccaps: ccaps,
		Ccaron: Ccaron,
		ccaron: ccaron,
		Ccedil: Ccedil,
		ccedil: ccedil,
		Ccirc: Ccirc,
		ccirc: ccirc,
		Cconint: Cconint,
		ccups: ccups,
		ccupssm: ccupssm,
		Cdot: Cdot,
		cdot: cdot,
		cedil: cedil,
		Cedilla: Cedilla,
		cemptyv: cemptyv,
		cent: cent,
		centerdot: centerdot,
		CenterDot: CenterDot,
		cfr: cfr,
		Cfr: Cfr,
		CHcy: CHcy,
		chcy: chcy,
		check: check,
		checkmark: checkmark,
		Chi: Chi,
		chi: chi,
		circ: circ,
		circeq: circeq,
		circlearrowleft: circlearrowleft,
		circlearrowright: circlearrowright,
		circledast: circledast,
		circledcirc: circledcirc,
		circleddash: circleddash,
		CircleDot: CircleDot,
		circledR: circledR,
		circledS: circledS,
		CircleMinus: CircleMinus,
		CirclePlus: CirclePlus,
		CircleTimes: CircleTimes,
		cir: cir,
		cirE: cirE,
		cire: cire,
		cirfnint: cirfnint,
		cirmid: cirmid,
		cirscir: cirscir,
		ClockwiseContourIntegral: ClockwiseContourIntegral,
		CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
		CloseCurlyQuote: CloseCurlyQuote,
		clubs: clubs,
		clubsuit: clubsuit,
		colon: colon,
		Colon: Colon,
		Colone: Colone,
		colone: colone,
		coloneq: coloneq,
		comma: comma,
		commat: commat,
		comp: comp,
		compfn: compfn,
		complement: complement,
		complexes: complexes,
		cong: cong,
		congdot: congdot,
		Congruent: Congruent,
		conint: conint,
		Conint: Conint,
		ContourIntegral: ContourIntegral,
		copf: copf,
		Copf: Copf,
		coprod: coprod,
		Coproduct: Coproduct,
		copy: copy,
		COPY: COPY,
		copysr: copysr,
		CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
		crarr: crarr,
		cross: cross,
		Cross: Cross,
		Cscr: Cscr,
		cscr: cscr,
		csub: csub,
		csube: csube,
		csup: csup,
		csupe: csupe,
		ctdot: ctdot,
		cudarrl: cudarrl,
		cudarrr: cudarrr,
		cuepr: cuepr,
		cuesc: cuesc,
		cularr: cularr,
		cularrp: cularrp,
		cupbrcap: cupbrcap,
		cupcap: cupcap,
		CupCap: CupCap,
		cup: cup,
		Cup: Cup,
		cupcup: cupcup,
		cupdot: cupdot,
		cupor: cupor,
		cups: cups,
		curarr: curarr,
		curarrm: curarrm,
		curlyeqprec: curlyeqprec,
		curlyeqsucc: curlyeqsucc,
		curlyvee: curlyvee,
		curlywedge: curlywedge,
		curren: curren,
		curvearrowleft: curvearrowleft,
		curvearrowright: curvearrowright,
		cuvee: cuvee,
		cuwed: cuwed,
		cwconint: cwconint,
		cwint: cwint,
		cylcty: cylcty,
		dagger: dagger,
		Dagger: Dagger,
		daleth: daleth,
		darr: darr,
		Darr: Darr,
		dArr: dArr,
		dash: dash,
		Dashv: Dashv,
		dashv: dashv,
		dbkarow: dbkarow,
		dblac: dblac,
		Dcaron: Dcaron,
		dcaron: dcaron,
		Dcy: Dcy,
		dcy: dcy,
		ddagger: ddagger,
		ddarr: ddarr,
		DD: DD,
		dd: dd,
		DDotrahd: DDotrahd,
		ddotseq: ddotseq,
		deg: deg,
		Del: Del,
		Delta: Delta,
		delta: delta,
		demptyv: demptyv,
		dfisht: dfisht,
		Dfr: Dfr,
		dfr: dfr,
		dHar: dHar,
		dharl: dharl,
		dharr: dharr,
		DiacriticalAcute: DiacriticalAcute,
		DiacriticalDot: DiacriticalDot,
		DiacriticalDoubleAcute: DiacriticalDoubleAcute,
		DiacriticalGrave: DiacriticalGrave,
		DiacriticalTilde: DiacriticalTilde,
		diam: diam,
		diamond: diamond,
		Diamond: Diamond,
		diamondsuit: diamondsuit,
		diams: diams,
		die: die,
		DifferentialD: DifferentialD,
		digamma: digamma,
		disin: disin,
		div: div,
		divide: divide,
		divideontimes: divideontimes,
		divonx: divonx,
		DJcy: DJcy,
		djcy: djcy,
		dlcorn: dlcorn,
		dlcrop: dlcrop,
		dollar: dollar,
		Dopf: Dopf,
		dopf: dopf,
		Dot: Dot,
		dot: dot,
		DotDot: DotDot,
		doteq: doteq,
		doteqdot: doteqdot,
		DotEqual: DotEqual,
		dotminus: dotminus,
		dotplus: dotplus,
		dotsquare: dotsquare,
		doublebarwedge: doublebarwedge,
		DoubleContourIntegral: DoubleContourIntegral,
		DoubleDot: DoubleDot,
		DoubleDownArrow: DoubleDownArrow,
		DoubleLeftArrow: DoubleLeftArrow,
		DoubleLeftRightArrow: DoubleLeftRightArrow,
		DoubleLeftTee: DoubleLeftTee,
		DoubleLongLeftArrow: DoubleLongLeftArrow,
		DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
		DoubleLongRightArrow: DoubleLongRightArrow,
		DoubleRightArrow: DoubleRightArrow,
		DoubleRightTee: DoubleRightTee,
		DoubleUpArrow: DoubleUpArrow,
		DoubleUpDownArrow: DoubleUpDownArrow,
		DoubleVerticalBar: DoubleVerticalBar,
		DownArrowBar: DownArrowBar,
		downarrow: downarrow,
		DownArrow: DownArrow,
		Downarrow: Downarrow,
		DownArrowUpArrow: DownArrowUpArrow,
		DownBreve: DownBreve,
		downdownarrows: downdownarrows,
		downharpoonleft: downharpoonleft,
		downharpoonright: downharpoonright,
		DownLeftRightVector: DownLeftRightVector,
		DownLeftTeeVector: DownLeftTeeVector,
		DownLeftVectorBar: DownLeftVectorBar,
		DownLeftVector: DownLeftVector,
		DownRightTeeVector: DownRightTeeVector,
		DownRightVectorBar: DownRightVectorBar,
		DownRightVector: DownRightVector,
		DownTeeArrow: DownTeeArrow,
		DownTee: DownTee,
		drbkarow: drbkarow,
		drcorn: drcorn,
		drcrop: drcrop,
		Dscr: Dscr,
		dscr: dscr,
		DScy: DScy,
		dscy: dscy,
		dsol: dsol,
		Dstrok: Dstrok,
		dstrok: dstrok,
		dtdot: dtdot,
		dtri: dtri,
		dtrif: dtrif,
		duarr: duarr,
		duhar: duhar,
		dwangle: dwangle,
		DZcy: DZcy,
		dzcy: dzcy,
		dzigrarr: dzigrarr,
		Eacute: Eacute,
		eacute: eacute,
		easter: easter,
		Ecaron: Ecaron,
		ecaron: ecaron,
		Ecirc: Ecirc,
		ecirc: ecirc,
		ecir: ecir,
		ecolon: ecolon,
		Ecy: Ecy,
		ecy: ecy,
		eDDot: eDDot,
		Edot: Edot,
		edot: edot,
		eDot: eDot,
		ee: ee,
		efDot: efDot,
		Efr: Efr,
		efr: efr,
		eg: eg,
		Egrave: Egrave,
		egrave: egrave,
		egs: egs,
		egsdot: egsdot,
		el: el,
		Element: Element,
		elinters: elinters,
		ell: ell,
		els: els,
		elsdot: elsdot,
		Emacr: Emacr,
		emacr: emacr,
		empty: empty,
		emptyset: emptyset,
		EmptySmallSquare: EmptySmallSquare,
		emptyv: emptyv,
		EmptyVerySmallSquare: EmptyVerySmallSquare,
		emsp13: emsp13,
		emsp14: emsp14,
		emsp: emsp,
		ENG: ENG,
		eng: eng,
		ensp: ensp,
		Eogon: Eogon,
		eogon: eogon,
		Eopf: Eopf,
		eopf: eopf,
		epar: epar,
		eparsl: eparsl,
		eplus: eplus,
		epsi: epsi,
		Epsilon: Epsilon,
		epsilon: epsilon,
		epsiv: epsiv,
		eqcirc: eqcirc,
		eqcolon: eqcolon,
		eqsim: eqsim,
		eqslantgtr: eqslantgtr,
		eqslantless: eqslantless,
		Equal: Equal,
		equals: equals,
		EqualTilde: EqualTilde,
		equest: equest,
		Equilibrium: Equilibrium,
		equiv: equiv,
		equivDD: equivDD,
		eqvparsl: eqvparsl,
		erarr: erarr,
		erDot: erDot,
		escr: escr,
		Escr: Escr,
		esdot: esdot,
		Esim: Esim,
		esim: esim,
		Eta: Eta,
		eta: eta,
		ETH: ETH,
		eth: eth,
		Euml: Euml,
		euml: euml,
		euro: euro,
		excl: excl,
		exist: exist,
		Exists: Exists,
		expectation: expectation,
		exponentiale: exponentiale,
		ExponentialE: ExponentialE,
		fallingdotseq: fallingdotseq,
		Fcy: Fcy,
		fcy: fcy,
		female: female,
		ffilig: ffilig,
		fflig: fflig,
		ffllig: ffllig,
		Ffr: Ffr,
		ffr: ffr,
		filig: filig,
		FilledSmallSquare: FilledSmallSquare,
		FilledVerySmallSquare: FilledVerySmallSquare,
		fjlig: fjlig,
		flat: flat,
		fllig: fllig,
		fltns: fltns,
		fnof: fnof,
		Fopf: Fopf,
		fopf: fopf,
		forall: forall,
		ForAll: ForAll,
		fork: fork,
		forkv: forkv,
		Fouriertrf: Fouriertrf,
		fpartint: fpartint,
		frac12: frac12,
		frac13: frac13,
		frac14: frac14,
		frac15: frac15,
		frac16: frac16,
		frac18: frac18,
		frac23: frac23,
		frac25: frac25,
		frac34: frac34,
		frac35: frac35,
		frac38: frac38,
		frac45: frac45,
		frac56: frac56,
		frac58: frac58,
		frac78: frac78,
		frasl: frasl,
		frown: frown,
		fscr: fscr,
		Fscr: Fscr,
		gacute: gacute,
		Gamma: Gamma,
		gamma: gamma,
		Gammad: Gammad,
		gammad: gammad,
		gap: gap,
		Gbreve: Gbreve,
		gbreve: gbreve,
		Gcedil: Gcedil,
		Gcirc: Gcirc,
		gcirc: gcirc,
		Gcy: Gcy,
		gcy: gcy,
		Gdot: Gdot,
		gdot: gdot,
		ge: ge,
		gE: gE,
		gEl: gEl,
		gel: gel,
		geq: geq,
		geqq: geqq,
		geqslant: geqslant,
		gescc: gescc,
		ges: ges,
		gesdot: gesdot,
		gesdoto: gesdoto,
		gesdotol: gesdotol,
		gesl: gesl,
		gesles: gesles,
		Gfr: Gfr,
		gfr: gfr,
		gg: gg,
		Gg: Gg,
		ggg: ggg,
		gimel: gimel,
		GJcy: GJcy,
		gjcy: gjcy,
		gla: gla,
		gl: gl,
		glE: glE,
		glj: glj,
		gnap: gnap,
		gnapprox: gnapprox,
		gne: gne,
		gnE: gnE,
		gneq: gneq,
		gneqq: gneqq,
		gnsim: gnsim,
		Gopf: Gopf,
		gopf: gopf,
		grave: grave,
		GreaterEqual: GreaterEqual,
		GreaterEqualLess: GreaterEqualLess,
		GreaterFullEqual: GreaterFullEqual,
		GreaterGreater: GreaterGreater,
		GreaterLess: GreaterLess,
		GreaterSlantEqual: GreaterSlantEqual,
		GreaterTilde: GreaterTilde,
		Gscr: Gscr,
		gscr: gscr,
		gsim: gsim,
		gsime: gsime,
		gsiml: gsiml,
		gtcc: gtcc,
		gtcir: gtcir,
		gt: gt,
		GT: GT,
		Gt: Gt,
		gtdot: gtdot,
		gtlPar: gtlPar,
		gtquest: gtquest,
		gtrapprox: gtrapprox,
		gtrarr: gtrarr,
		gtrdot: gtrdot,
		gtreqless: gtreqless,
		gtreqqless: gtreqqless,
		gtrless: gtrless,
		gtrsim: gtrsim,
		gvertneqq: gvertneqq,
		gvnE: gvnE,
		Hacek: Hacek,
		hairsp: hairsp,
		half: half,
		hamilt: hamilt,
		HARDcy: HARDcy,
		hardcy: hardcy,
		harrcir: harrcir,
		harr: harr,
		hArr: hArr,
		harrw: harrw,
		Hat: Hat,
		hbar: hbar,
		Hcirc: Hcirc,
		hcirc: hcirc,
		hearts: hearts,
		heartsuit: heartsuit,
		hellip: hellip,
		hercon: hercon,
		hfr: hfr,
		Hfr: Hfr,
		HilbertSpace: HilbertSpace,
		hksearow: hksearow,
		hkswarow: hkswarow,
		hoarr: hoarr,
		homtht: homtht,
		hookleftarrow: hookleftarrow,
		hookrightarrow: hookrightarrow,
		hopf: hopf,
		Hopf: Hopf,
		horbar: horbar,
		HorizontalLine: HorizontalLine,
		hscr: hscr,
		Hscr: Hscr,
		hslash: hslash,
		Hstrok: Hstrok,
		hstrok: hstrok,
		HumpDownHump: HumpDownHump,
		HumpEqual: HumpEqual,
		hybull: hybull,
		hyphen: hyphen,
		Iacute: Iacute,
		iacute: iacute,
		ic: ic,
		Icirc: Icirc,
		icirc: icirc,
		Icy: Icy,
		icy: icy,
		Idot: Idot,
		IEcy: IEcy,
		iecy: iecy,
		iexcl: iexcl,
		iff: iff,
		ifr: ifr,
		Ifr: Ifr,
		Igrave: Igrave,
		igrave: igrave,
		ii: ii,
		iiiint: iiiint,
		iiint: iiint,
		iinfin: iinfin,
		iiota: iiota,
		IJlig: IJlig,
		ijlig: ijlig,
		Imacr: Imacr,
		imacr: imacr,
		image: image,
		ImaginaryI: ImaginaryI,
		imagline: imagline,
		imagpart: imagpart,
		imath: imath,
		Im: Im,
		imof: imof,
		imped: imped,
		Implies: Implies,
		incare: incare,
		infin: infin,
		infintie: infintie,
		inodot: inodot,
		intcal: intcal,
		int: int,
		Int: Int,
		integers: integers,
		Integral: Integral,
		intercal: intercal,
		Intersection: Intersection,
		intlarhk: intlarhk,
		intprod: intprod,
		InvisibleComma: InvisibleComma,
		InvisibleTimes: InvisibleTimes,
		IOcy: IOcy,
		iocy: iocy,
		Iogon: Iogon,
		iogon: iogon,
		Iopf: Iopf,
		iopf: iopf,
		Iota: Iota,
		iota: iota,
		iprod: iprod,
		iquest: iquest,
		iscr: iscr,
		Iscr: Iscr,
		isin: isin,
		isindot: isindot,
		isinE: isinE,
		isins: isins,
		isinsv: isinsv,
		isinv: isinv,
		it: it,
		Itilde: Itilde,
		itilde: itilde,
		Iukcy: Iukcy,
		iukcy: iukcy,
		Iuml: Iuml,
		iuml: iuml,
		Jcirc: Jcirc,
		jcirc: jcirc,
		Jcy: Jcy,
		jcy: jcy,
		Jfr: Jfr,
		jfr: jfr,
		jmath: jmath,
		Jopf: Jopf,
		jopf: jopf,
		Jscr: Jscr,
		jscr: jscr,
		Jsercy: Jsercy,
		jsercy: jsercy,
		Jukcy: Jukcy,
		jukcy: jukcy,
		Kappa: Kappa,
		kappa: kappa,
		kappav: kappav,
		Kcedil: Kcedil,
		kcedil: kcedil,
		Kcy: Kcy,
		kcy: kcy,
		Kfr: Kfr,
		kfr: kfr,
		kgreen: kgreen,
		KHcy: KHcy,
		khcy: khcy,
		KJcy: KJcy,
		kjcy: kjcy,
		Kopf: Kopf,
		kopf: kopf,
		Kscr: Kscr,
		kscr: kscr,
		lAarr: lAarr,
		Lacute: Lacute,
		lacute: lacute,
		laemptyv: laemptyv,
		lagran: lagran,
		Lambda: Lambda,
		lambda: lambda,
		lang: lang,
		Lang: Lang,
		langd: langd,
		langle: langle,
		lap: lap,
		Laplacetrf: Laplacetrf,
		laquo: laquo,
		larrb: larrb,
		larrbfs: larrbfs,
		larr: larr,
		Larr: Larr,
		lArr: lArr,
		larrfs: larrfs,
		larrhk: larrhk,
		larrlp: larrlp,
		larrpl: larrpl,
		larrsim: larrsim,
		larrtl: larrtl,
		latail: latail,
		lAtail: lAtail,
		lat: lat,
		late: late,
		lates: lates,
		lbarr: lbarr,
		lBarr: lBarr,
		lbbrk: lbbrk,
		lbrace: lbrace,
		lbrack: lbrack,
		lbrke: lbrke,
		lbrksld: lbrksld,
		lbrkslu: lbrkslu,
		Lcaron: Lcaron,
		lcaron: lcaron,
		Lcedil: Lcedil,
		lcedil: lcedil,
		lceil: lceil,
		lcub: lcub,
		Lcy: Lcy,
		lcy: lcy,
		ldca: ldca,
		ldquo: ldquo,
		ldquor: ldquor,
		ldrdhar: ldrdhar,
		ldrushar: ldrushar,
		ldsh: ldsh,
		le: le,
		lE: lE,
		LeftAngleBracket: LeftAngleBracket,
		LeftArrowBar: LeftArrowBar,
		leftarrow: leftarrow,
		LeftArrow: LeftArrow,
		Leftarrow: Leftarrow,
		LeftArrowRightArrow: LeftArrowRightArrow,
		leftarrowtail: leftarrowtail,
		LeftCeiling: LeftCeiling,
		LeftDoubleBracket: LeftDoubleBracket,
		LeftDownTeeVector: LeftDownTeeVector,
		LeftDownVectorBar: LeftDownVectorBar,
		LeftDownVector: LeftDownVector,
		LeftFloor: LeftFloor,
		leftharpoondown: leftharpoondown,
		leftharpoonup: leftharpoonup,
		leftleftarrows: leftleftarrows,
		leftrightarrow: leftrightarrow,
		LeftRightArrow: LeftRightArrow,
		Leftrightarrow: Leftrightarrow,
		leftrightarrows: leftrightarrows,
		leftrightharpoons: leftrightharpoons,
		leftrightsquigarrow: leftrightsquigarrow,
		LeftRightVector: LeftRightVector,
		LeftTeeArrow: LeftTeeArrow,
		LeftTee: LeftTee,
		LeftTeeVector: LeftTeeVector,
		leftthreetimes: leftthreetimes,
		LeftTriangleBar: LeftTriangleBar,
		LeftTriangle: LeftTriangle,
		LeftTriangleEqual: LeftTriangleEqual,
		LeftUpDownVector: LeftUpDownVector,
		LeftUpTeeVector: LeftUpTeeVector,
		LeftUpVectorBar: LeftUpVectorBar,
		LeftUpVector: LeftUpVector,
		LeftVectorBar: LeftVectorBar,
		LeftVector: LeftVector,
		lEg: lEg,
		leg: leg,
		leq: leq,
		leqq: leqq,
		leqslant: leqslant,
		lescc: lescc,
		les: les,
		lesdot: lesdot,
		lesdoto: lesdoto,
		lesdotor: lesdotor,
		lesg: lesg,
		lesges: lesges,
		lessapprox: lessapprox,
		lessdot: lessdot,
		lesseqgtr: lesseqgtr,
		lesseqqgtr: lesseqqgtr,
		LessEqualGreater: LessEqualGreater,
		LessFullEqual: LessFullEqual,
		LessGreater: LessGreater,
		lessgtr: lessgtr,
		LessLess: LessLess,
		lesssim: lesssim,
		LessSlantEqual: LessSlantEqual,
		LessTilde: LessTilde,
		lfisht: lfisht,
		lfloor: lfloor,
		Lfr: Lfr,
		lfr: lfr,
		lg: lg,
		lgE: lgE,
		lHar: lHar,
		lhard: lhard,
		lharu: lharu,
		lharul: lharul,
		lhblk: lhblk,
		LJcy: LJcy,
		ljcy: ljcy,
		llarr: llarr,
		ll: ll,
		Ll: Ll,
		llcorner: llcorner,
		Lleftarrow: Lleftarrow,
		llhard: llhard,
		lltri: lltri,
		Lmidot: Lmidot,
		lmidot: lmidot,
		lmoustache: lmoustache,
		lmoust: lmoust,
		lnap: lnap,
		lnapprox: lnapprox,
		lne: lne,
		lnE: lnE,
		lneq: lneq,
		lneqq: lneqq,
		lnsim: lnsim,
		loang: loang,
		loarr: loarr,
		lobrk: lobrk,
		longleftarrow: longleftarrow,
		LongLeftArrow: LongLeftArrow,
		Longleftarrow: Longleftarrow,
		longleftrightarrow: longleftrightarrow,
		LongLeftRightArrow: LongLeftRightArrow,
		Longleftrightarrow: Longleftrightarrow,
		longmapsto: longmapsto,
		longrightarrow: longrightarrow,
		LongRightArrow: LongRightArrow,
		Longrightarrow: Longrightarrow,
		looparrowleft: looparrowleft,
		looparrowright: looparrowright,
		lopar: lopar,
		Lopf: Lopf,
		lopf: lopf,
		loplus: loplus,
		lotimes: lotimes,
		lowast: lowast,
		lowbar: lowbar,
		LowerLeftArrow: LowerLeftArrow,
		LowerRightArrow: LowerRightArrow,
		loz: loz,
		lozenge: lozenge,
		lozf: lozf,
		lpar: lpar,
		lparlt: lparlt,
		lrarr: lrarr,
		lrcorner: lrcorner,
		lrhar: lrhar,
		lrhard: lrhard,
		lrm: lrm,
		lrtri: lrtri,
		lsaquo: lsaquo,
		lscr: lscr,
		Lscr: Lscr,
		lsh: lsh,
		Lsh: Lsh,
		lsim: lsim,
		lsime: lsime,
		lsimg: lsimg,
		lsqb: lsqb,
		lsquo: lsquo,
		lsquor: lsquor,
		Lstrok: Lstrok,
		lstrok: lstrok,
		ltcc: ltcc,
		ltcir: ltcir,
		lt: lt,
		LT: LT,
		Lt: Lt,
		ltdot: ltdot,
		lthree: lthree,
		ltimes: ltimes,
		ltlarr: ltlarr,
		ltquest: ltquest,
		ltri: ltri,
		ltrie: ltrie,
		ltrif: ltrif,
		ltrPar: ltrPar,
		lurdshar: lurdshar,
		luruhar: luruhar,
		lvertneqq: lvertneqq,
		lvnE: lvnE,
		macr: macr,
		male: male,
		malt: malt,
		maltese: maltese,
		map: map,
		mapsto: mapsto,
		mapstodown: mapstodown,
		mapstoleft: mapstoleft,
		mapstoup: mapstoup,
		marker: marker,
		mcomma: mcomma,
		Mcy: Mcy,
		mcy: mcy,
		mdash: mdash,
		mDDot: mDDot,
		measuredangle: measuredangle,
		MediumSpace: MediumSpace,
		Mellintrf: Mellintrf,
		Mfr: Mfr,
		mfr: mfr,
		mho: mho,
		micro: micro,
		midast: midast,
		midcir: midcir,
		mid: mid,
		middot: middot,
		minusb: minusb,
		minus: minus,
		minusd: minusd,
		minusdu: minusdu,
		MinusPlus: MinusPlus,
		mlcp: mlcp,
		mldr: mldr,
		mnplus: mnplus,
		models: models,
		Mopf: Mopf,
		mopf: mopf,
		mp: mp,
		mscr: mscr,
		Mscr: Mscr,
		mstpos: mstpos,
		Mu: Mu,
		mu: mu,
		multimap: multimap,
		mumap: mumap,
		nabla: nabla,
		Nacute: Nacute,
		nacute: nacute,
		nang: nang,
		nap: nap,
		napE: napE,
		napid: napid,
		napos: napos,
		napprox: napprox,
		natural: natural,
		naturals: naturals,
		natur: natur,
		nbsp: nbsp,
		nbump: nbump,
		nbumpe: nbumpe,
		ncap: ncap,
		Ncaron: Ncaron,
		ncaron: ncaron,
		Ncedil: Ncedil,
		ncedil: ncedil,
		ncong: ncong,
		ncongdot: ncongdot,
		ncup: ncup,
		Ncy: Ncy,
		ncy: ncy,
		ndash: ndash,
		nearhk: nearhk,
		nearr: nearr,
		neArr: neArr,
		nearrow: nearrow,
		ne: ne,
		nedot: nedot,
		NegativeMediumSpace: NegativeMediumSpace,
		NegativeThickSpace: NegativeThickSpace,
		NegativeThinSpace: NegativeThinSpace,
		NegativeVeryThinSpace: NegativeVeryThinSpace,
		nequiv: nequiv,
		nesear: nesear,
		nesim: nesim,
		NestedGreaterGreater: NestedGreaterGreater,
		NestedLessLess: NestedLessLess,
		NewLine: NewLine,
		nexist: nexist,
		nexists: nexists,
		Nfr: Nfr,
		nfr: nfr,
		ngE: ngE,
		nge: nge,
		ngeq: ngeq,
		ngeqq: ngeqq,
		ngeqslant: ngeqslant,
		nges: nges,
		nGg: nGg,
		ngsim: ngsim,
		nGt: nGt,
		ngt: ngt,
		ngtr: ngtr,
		nGtv: nGtv,
		nharr: nharr,
		nhArr: nhArr,
		nhpar: nhpar,
		ni: ni,
		nis: nis,
		nisd: nisd,
		niv: niv,
		NJcy: NJcy,
		njcy: njcy,
		nlarr: nlarr,
		nlArr: nlArr,
		nldr: nldr,
		nlE: nlE,
		nle: nle,
		nleftarrow: nleftarrow,
		nLeftarrow: nLeftarrow,
		nleftrightarrow: nleftrightarrow,
		nLeftrightarrow: nLeftrightarrow,
		nleq: nleq,
		nleqq: nleqq,
		nleqslant: nleqslant,
		nles: nles,
		nless: nless,
		nLl: nLl,
		nlsim: nlsim,
		nLt: nLt,
		nlt: nlt,
		nltri: nltri,
		nltrie: nltrie,
		nLtv: nLtv,
		nmid: nmid,
		NoBreak: NoBreak,
		NonBreakingSpace: NonBreakingSpace,
		nopf: nopf,
		Nopf: Nopf,
		Not: Not,
		not: not,
		NotCongruent: NotCongruent,
		NotCupCap: NotCupCap,
		NotDoubleVerticalBar: NotDoubleVerticalBar,
		NotElement: NotElement,
		NotEqual: NotEqual,
		NotEqualTilde: NotEqualTilde,
		NotExists: NotExists,
		NotGreater: NotGreater,
		NotGreaterEqual: NotGreaterEqual,
		NotGreaterFullEqual: NotGreaterFullEqual,
		NotGreaterGreater: NotGreaterGreater,
		NotGreaterLess: NotGreaterLess,
		NotGreaterSlantEqual: NotGreaterSlantEqual,
		NotGreaterTilde: NotGreaterTilde,
		NotHumpDownHump: NotHumpDownHump,
		NotHumpEqual: NotHumpEqual,
		notin: notin,
		notindot: notindot,
		notinE: notinE,
		notinva: notinva,
		notinvb: notinvb,
		notinvc: notinvc,
		NotLeftTriangleBar: NotLeftTriangleBar,
		NotLeftTriangle: NotLeftTriangle,
		NotLeftTriangleEqual: NotLeftTriangleEqual,
		NotLess: NotLess,
		NotLessEqual: NotLessEqual,
		NotLessGreater: NotLessGreater,
		NotLessLess: NotLessLess,
		NotLessSlantEqual: NotLessSlantEqual,
		NotLessTilde: NotLessTilde,
		NotNestedGreaterGreater: NotNestedGreaterGreater,
		NotNestedLessLess: NotNestedLessLess,
		notni: notni,
		notniva: notniva,
		notnivb: notnivb,
		notnivc: notnivc,
		NotPrecedes: NotPrecedes,
		NotPrecedesEqual: NotPrecedesEqual,
		NotPrecedesSlantEqual: NotPrecedesSlantEqual,
		NotReverseElement: NotReverseElement,
		NotRightTriangleBar: NotRightTriangleBar,
		NotRightTriangle: NotRightTriangle,
		NotRightTriangleEqual: NotRightTriangleEqual,
		NotSquareSubset: NotSquareSubset,
		NotSquareSubsetEqual: NotSquareSubsetEqual,
		NotSquareSuperset: NotSquareSuperset,
		NotSquareSupersetEqual: NotSquareSupersetEqual,
		NotSubset: NotSubset,
		NotSubsetEqual: NotSubsetEqual,
		NotSucceeds: NotSucceeds,
		NotSucceedsEqual: NotSucceedsEqual,
		NotSucceedsSlantEqual: NotSucceedsSlantEqual,
		NotSucceedsTilde: NotSucceedsTilde,
		NotSuperset: NotSuperset,
		NotSupersetEqual: NotSupersetEqual,
		NotTilde: NotTilde,
		NotTildeEqual: NotTildeEqual,
		NotTildeFullEqual: NotTildeFullEqual,
		NotTildeTilde: NotTildeTilde,
		NotVerticalBar: NotVerticalBar,
		nparallel: nparallel,
		npar: npar,
		nparsl: nparsl,
		npart: npart,
		npolint: npolint,
		npr: npr,
		nprcue: nprcue,
		nprec: nprec,
		npreceq: npreceq,
		npre: npre,
		nrarrc: nrarrc,
		nrarr: nrarr,
		nrArr: nrArr,
		nrarrw: nrarrw,
		nrightarrow: nrightarrow,
		nRightarrow: nRightarrow,
		nrtri: nrtri,
		nrtrie: nrtrie,
		nsc: nsc,
		nsccue: nsccue,
		nsce: nsce,
		Nscr: Nscr,
		nscr: nscr,
		nshortmid: nshortmid,
		nshortparallel: nshortparallel,
		nsim: nsim,
		nsime: nsime,
		nsimeq: nsimeq,
		nsmid: nsmid,
		nspar: nspar,
		nsqsube: nsqsube,
		nsqsupe: nsqsupe,
		nsub: nsub,
		nsubE: nsubE,
		nsube: nsube,
		nsubset: nsubset,
		nsubseteq: nsubseteq,
		nsubseteqq: nsubseteqq,
		nsucc: nsucc,
		nsucceq: nsucceq,
		nsup: nsup,
		nsupE: nsupE,
		nsupe: nsupe,
		nsupset: nsupset,
		nsupseteq: nsupseteq,
		nsupseteqq: nsupseteqq,
		ntgl: ntgl,
		Ntilde: Ntilde,
		ntilde: ntilde,
		ntlg: ntlg,
		ntriangleleft: ntriangleleft,
		ntrianglelefteq: ntrianglelefteq,
		ntriangleright: ntriangleright,
		ntrianglerighteq: ntrianglerighteq,
		Nu: Nu,
		nu: nu,
		num: num,
		numero: numero,
		numsp: numsp,
		nvap: nvap,
		nvdash: nvdash,
		nvDash: nvDash,
		nVdash: nVdash,
		nVDash: nVDash,
		nvge: nvge,
		nvgt: nvgt,
		nvHarr: nvHarr,
		nvinfin: nvinfin,
		nvlArr: nvlArr,
		nvle: nvle,
		nvlt: nvlt,
		nvltrie: nvltrie,
		nvrArr: nvrArr,
		nvrtrie: nvrtrie,
		nvsim: nvsim,
		nwarhk: nwarhk,
		nwarr: nwarr,
		nwArr: nwArr,
		nwarrow: nwarrow,
		nwnear: nwnear,
		Oacute: Oacute,
		oacute: oacute,
		oast: oast,
		Ocirc: Ocirc,
		ocirc: ocirc,
		ocir: ocir,
		Ocy: Ocy,
		ocy: ocy,
		odash: odash,
		Odblac: Odblac,
		odblac: odblac,
		odiv: odiv,
		odot: odot,
		odsold: odsold,
		OElig: OElig,
		oelig: oelig,
		ofcir: ofcir,
		Ofr: Ofr,
		ofr: ofr,
		ogon: ogon,
		Ograve: Ograve,
		ograve: ograve,
		ogt: ogt,
		ohbar: ohbar,
		ohm: ohm,
		oint: oint,
		olarr: olarr,
		olcir: olcir,
		olcross: olcross,
		oline: oline,
		olt: olt,
		Omacr: Omacr,
		omacr: omacr,
		Omega: Omega,
		omega: omega,
		Omicron: Omicron,
		omicron: omicron,
		omid: omid,
		ominus: ominus,
		Oopf: Oopf,
		oopf: oopf,
		opar: opar,
		OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
		OpenCurlyQuote: OpenCurlyQuote,
		operp: operp,
		oplus: oplus,
		orarr: orarr,
		Or: Or,
		or: or,
		ord: ord,
		order: order,
		orderof: orderof,
		ordf: ordf,
		ordm: ordm,
		origof: origof,
		oror: oror,
		orslope: orslope,
		orv: orv,
		oS: oS,
		Oscr: Oscr,
		oscr: oscr,
		Oslash: Oslash,
		oslash: oslash,
		osol: osol,
		Otilde: Otilde,
		otilde: otilde,
		otimesas: otimesas,
		Otimes: Otimes,
		otimes: otimes,
		Ouml: Ouml,
		ouml: ouml,
		ovbar: ovbar,
		OverBar: OverBar,
		OverBrace: OverBrace,
		OverBracket: OverBracket,
		OverParenthesis: OverParenthesis,
		para: para,
		parallel: parallel,
		par: par,
		parsim: parsim,
		parsl: parsl,
		part: part,
		PartialD: PartialD,
		Pcy: Pcy,
		pcy: pcy,
		percnt: percnt,
		period: period,
		permil: permil,
		perp: perp,
		pertenk: pertenk,
		Pfr: Pfr,
		pfr: pfr,
		Phi: Phi,
		phi: phi,
		phiv: phiv,
		phmmat: phmmat,
		phone: phone,
		Pi: Pi,
		pi: pi,
		pitchfork: pitchfork,
		piv: piv,
		planck: planck,
		planckh: planckh,
		plankv: plankv,
		plusacir: plusacir,
		plusb: plusb,
		pluscir: pluscir,
		plus: plus,
		plusdo: plusdo,
		plusdu: plusdu,
		pluse: pluse,
		PlusMinus: PlusMinus,
		plusmn: plusmn,
		plussim: plussim,
		plustwo: plustwo,
		pm: pm,
		Poincareplane: Poincareplane,
		pointint: pointint,
		popf: popf,
		Popf: Popf,
		pound: pound,
		prap: prap,
		Pr: Pr,
		pr: pr,
		prcue: prcue,
		precapprox: precapprox,
		prec: prec,
		preccurlyeq: preccurlyeq,
		Precedes: Precedes,
		PrecedesEqual: PrecedesEqual,
		PrecedesSlantEqual: PrecedesSlantEqual,
		PrecedesTilde: PrecedesTilde,
		preceq: preceq,
		precnapprox: precnapprox,
		precneqq: precneqq,
		precnsim: precnsim,
		pre: pre,
		prE: prE,
		precsim: precsim,
		prime: prime,
		Prime: Prime,
		primes: primes,
		prnap: prnap,
		prnE: prnE,
		prnsim: prnsim,
		prod: prod,
		Product: Product,
		profalar: profalar,
		profline: profline,
		profsurf: profsurf,
		prop: prop,
		Proportional: Proportional,
		Proportion: Proportion,
		propto: propto,
		prsim: prsim,
		prurel: prurel,
		Pscr: Pscr,
		pscr: pscr,
		Psi: Psi,
		psi: psi,
		puncsp: puncsp,
		Qfr: Qfr,
		qfr: qfr,
		qint: qint,
		qopf: qopf,
		Qopf: Qopf,
		qprime: qprime,
		Qscr: Qscr,
		qscr: qscr,
		quaternions: quaternions,
		quatint: quatint,
		quest: quest,
		questeq: questeq,
		quot: quot,
		QUOT: QUOT,
		rAarr: rAarr,
		race: race,
		Racute: Racute,
		racute: racute,
		radic: radic,
		raemptyv: raemptyv,
		rang: rang,
		Rang: Rang,
		rangd: rangd,
		range: range,
		rangle: rangle,
		raquo: raquo,
		rarrap: rarrap,
		rarrb: rarrb,
		rarrbfs: rarrbfs,
		rarrc: rarrc,
		rarr: rarr,
		Rarr: Rarr,
		rArr: rArr,
		rarrfs: rarrfs,
		rarrhk: rarrhk,
		rarrlp: rarrlp,
		rarrpl: rarrpl,
		rarrsim: rarrsim,
		Rarrtl: Rarrtl,
		rarrtl: rarrtl,
		rarrw: rarrw,
		ratail: ratail,
		rAtail: rAtail,
		ratio: ratio,
		rationals: rationals,
		rbarr: rbarr,
		rBarr: rBarr,
		RBarr: RBarr,
		rbbrk: rbbrk,
		rbrace: rbrace,
		rbrack: rbrack,
		rbrke: rbrke,
		rbrksld: rbrksld,
		rbrkslu: rbrkslu,
		Rcaron: Rcaron,
		rcaron: rcaron,
		Rcedil: Rcedil,
		rcedil: rcedil,
		rceil: rceil,
		rcub: rcub,
		Rcy: Rcy,
		rcy: rcy,
		rdca: rdca,
		rdldhar: rdldhar,
		rdquo: rdquo,
		rdquor: rdquor,
		rdsh: rdsh,
		real: real,
		realine: realine,
		realpart: realpart,
		reals: reals,
		Re: Re,
		rect: rect,
		reg: reg,
		REG: REG,
		ReverseElement: ReverseElement,
		ReverseEquilibrium: ReverseEquilibrium,
		ReverseUpEquilibrium: ReverseUpEquilibrium,
		rfisht: rfisht,
		rfloor: rfloor,
		rfr: rfr,
		Rfr: Rfr,
		rHar: rHar,
		rhard: rhard,
		rharu: rharu,
		rharul: rharul,
		Rho: Rho,
		rho: rho,
		rhov: rhov,
		RightAngleBracket: RightAngleBracket,
		RightArrowBar: RightArrowBar,
		rightarrow: rightarrow,
		RightArrow: RightArrow,
		Rightarrow: Rightarrow,
		RightArrowLeftArrow: RightArrowLeftArrow,
		rightarrowtail: rightarrowtail,
		RightCeiling: RightCeiling,
		RightDoubleBracket: RightDoubleBracket,
		RightDownTeeVector: RightDownTeeVector,
		RightDownVectorBar: RightDownVectorBar,
		RightDownVector: RightDownVector,
		RightFloor: RightFloor,
		rightharpoondown: rightharpoondown,
		rightharpoonup: rightharpoonup,
		rightleftarrows: rightleftarrows,
		rightleftharpoons: rightleftharpoons,
		rightrightarrows: rightrightarrows,
		rightsquigarrow: rightsquigarrow,
		RightTeeArrow: RightTeeArrow,
		RightTee: RightTee,
		RightTeeVector: RightTeeVector,
		rightthreetimes: rightthreetimes,
		RightTriangleBar: RightTriangleBar,
		RightTriangle: RightTriangle,
		RightTriangleEqual: RightTriangleEqual,
		RightUpDownVector: RightUpDownVector,
		RightUpTeeVector: RightUpTeeVector,
		RightUpVectorBar: RightUpVectorBar,
		RightUpVector: RightUpVector,
		RightVectorBar: RightVectorBar,
		RightVector: RightVector,
		ring: ring,
		risingdotseq: risingdotseq,
		rlarr: rlarr,
		rlhar: rlhar,
		rlm: rlm,
		rmoustache: rmoustache,
		rmoust: rmoust,
		rnmid: rnmid,
		roang: roang,
		roarr: roarr,
		robrk: robrk,
		ropar: ropar,
		ropf: ropf,
		Ropf: Ropf,
		roplus: roplus,
		rotimes: rotimes,
		RoundImplies: RoundImplies,
		rpar: rpar,
		rpargt: rpargt,
		rppolint: rppolint,
		rrarr: rrarr,
		Rrightarrow: Rrightarrow,
		rsaquo: rsaquo,
		rscr: rscr,
		Rscr: Rscr,
		rsh: rsh,
		Rsh: Rsh,
		rsqb: rsqb,
		rsquo: rsquo,
		rsquor: rsquor,
		rthree: rthree,
		rtimes: rtimes,
		rtri: rtri,
		rtrie: rtrie,
		rtrif: rtrif,
		rtriltri: rtriltri,
		RuleDelayed: RuleDelayed,
		ruluhar: ruluhar,
		rx: rx,
		Sacute: Sacute,
		sacute: sacute,
		sbquo: sbquo,
		scap: scap,
		Scaron: Scaron,
		scaron: scaron,
		Sc: Sc,
		sc: sc,
		sccue: sccue,
		sce: sce,
		scE: scE,
		Scedil: Scedil,
		scedil: scedil,
		Scirc: Scirc,
		scirc: scirc,
		scnap: scnap,
		scnE: scnE,
		scnsim: scnsim,
		scpolint: scpolint,
		scsim: scsim,
		Scy: Scy,
		scy: scy,
		sdotb: sdotb,
		sdot: sdot,
		sdote: sdote,
		searhk: searhk,
		searr: searr,
		seArr: seArr,
		searrow: searrow,
		sect: sect,
		semi: semi,
		seswar: seswar,
		setminus: setminus,
		setmn: setmn,
		sext: sext,
		Sfr: Sfr,
		sfr: sfr,
		sfrown: sfrown,
		sharp: sharp,
		SHCHcy: SHCHcy,
		shchcy: shchcy,
		SHcy: SHcy,
		shcy: shcy,
		ShortDownArrow: ShortDownArrow,
		ShortLeftArrow: ShortLeftArrow,
		shortmid: shortmid,
		shortparallel: shortparallel,
		ShortRightArrow: ShortRightArrow,
		ShortUpArrow: ShortUpArrow,
		shy: shy,
		Sigma: Sigma,
		sigma: sigma,
		sigmaf: sigmaf,
		sigmav: sigmav,
		sim: sim,
		simdot: simdot,
		sime: sime,
		simeq: simeq,
		simg: simg,
		simgE: simgE,
		siml: siml,
		simlE: simlE,
		simne: simne,
		simplus: simplus,
		simrarr: simrarr,
		slarr: slarr,
		SmallCircle: SmallCircle,
		smallsetminus: smallsetminus,
		smashp: smashp,
		smeparsl: smeparsl,
		smid: smid,
		smile: smile,
		smt: smt,
		smte: smte,
		smtes: smtes,
		SOFTcy: SOFTcy,
		softcy: softcy,
		solbar: solbar,
		solb: solb,
		sol: sol,
		Sopf: Sopf,
		sopf: sopf,
		spades: spades,
		spadesuit: spadesuit,
		spar: spar,
		sqcap: sqcap,
		sqcaps: sqcaps,
		sqcup: sqcup,
		sqcups: sqcups,
		Sqrt: Sqrt,
		sqsub: sqsub,
		sqsube: sqsube,
		sqsubset: sqsubset,
		sqsubseteq: sqsubseteq,
		sqsup: sqsup,
		sqsupe: sqsupe,
		sqsupset: sqsupset,
		sqsupseteq: sqsupseteq,
		square: square,
		Square: Square,
		SquareIntersection: SquareIntersection,
		SquareSubset: SquareSubset,
		SquareSubsetEqual: SquareSubsetEqual,
		SquareSuperset: SquareSuperset,
		SquareSupersetEqual: SquareSupersetEqual,
		SquareUnion: SquareUnion,
		squarf: squarf,
		squ: squ,
		squf: squf,
		srarr: srarr,
		Sscr: Sscr,
		sscr: sscr,
		ssetmn: ssetmn,
		ssmile: ssmile,
		sstarf: sstarf,
		Star: Star,
		star: star,
		starf: starf,
		straightepsilon: straightepsilon,
		straightphi: straightphi,
		strns: strns,
		sub: sub,
		Sub: Sub,
		subdot: subdot,
		subE: subE,
		sube: sube,
		subedot: subedot,
		submult: submult,
		subnE: subnE,
		subne: subne,
		subplus: subplus,
		subrarr: subrarr,
		subset: subset,
		Subset: Subset,
		subseteq: subseteq,
		subseteqq: subseteqq,
		SubsetEqual: SubsetEqual,
		subsetneq: subsetneq,
		subsetneqq: subsetneqq,
		subsim: subsim,
		subsub: subsub,
		subsup: subsup,
		succapprox: succapprox,
		succ: succ,
		succcurlyeq: succcurlyeq,
		Succeeds: Succeeds,
		SucceedsEqual: SucceedsEqual,
		SucceedsSlantEqual: SucceedsSlantEqual,
		SucceedsTilde: SucceedsTilde,
		succeq: succeq,
		succnapprox: succnapprox,
		succneqq: succneqq,
		succnsim: succnsim,
		succsim: succsim,
		SuchThat: SuchThat,
		sum: sum,
		Sum: Sum,
		sung: sung,
		sup1: sup1,
		sup2: sup2,
		sup3: sup3,
		sup: sup,
		Sup: Sup,
		supdot: supdot,
		supdsub: supdsub,
		supE: supE,
		supe: supe,
		supedot: supedot,
		Superset: Superset,
		SupersetEqual: SupersetEqual,
		suphsol: suphsol,
		suphsub: suphsub,
		suplarr: suplarr,
		supmult: supmult,
		supnE: supnE,
		supne: supne,
		supplus: supplus,
		supset: supset,
		Supset: Supset,
		supseteq: supseteq,
		supseteqq: supseteqq,
		supsetneq: supsetneq,
		supsetneqq: supsetneqq,
		supsim: supsim,
		supsub: supsub,
		supsup: supsup,
		swarhk: swarhk,
		swarr: swarr,
		swArr: swArr,
		swarrow: swarrow,
		swnwar: swnwar,
		szlig: szlig,
		Tab: Tab,
		target: target,
		Tau: Tau,
		tau: tau,
		tbrk: tbrk,
		Tcaron: Tcaron,
		tcaron: tcaron,
		Tcedil: Tcedil,
		tcedil: tcedil,
		Tcy: Tcy,
		tcy: tcy,
		tdot: tdot,
		telrec: telrec,
		Tfr: Tfr,
		tfr: tfr,
		there4: there4,
		therefore: therefore,
		Therefore: Therefore,
		Theta: Theta,
		theta: theta,
		thetasym: thetasym,
		thetav: thetav,
		thickapprox: thickapprox,
		thicksim: thicksim,
		ThickSpace: ThickSpace,
		ThinSpace: ThinSpace,
		thinsp: thinsp,
		thkap: thkap,
		thksim: thksim,
		THORN: THORN,
		thorn: thorn,
		tilde: tilde,
		Tilde: Tilde,
		TildeEqual: TildeEqual,
		TildeFullEqual: TildeFullEqual,
		TildeTilde: TildeTilde,
		timesbar: timesbar,
		timesb: timesb,
		times: times,
		timesd: timesd,
		tint: tint,
		toea: toea,
		topbot: topbot,
		topcir: topcir,
		top: top,
		Topf: Topf,
		topf: topf,
		topfork: topfork,
		tosa: tosa,
		tprime: tprime,
		trade: trade,
		TRADE: TRADE,
		triangle: triangle,
		triangledown: triangledown,
		triangleleft: triangleleft,
		trianglelefteq: trianglelefteq,
		triangleq: triangleq,
		triangleright: triangleright,
		trianglerighteq: trianglerighteq,
		tridot: tridot,
		trie: trie,
		triminus: triminus,
		TripleDot: TripleDot,
		triplus: triplus,
		trisb: trisb,
		tritime: tritime,
		trpezium: trpezium,
		Tscr: Tscr,
		tscr: tscr,
		TScy: TScy,
		tscy: tscy,
		TSHcy: TSHcy,
		tshcy: tshcy,
		Tstrok: Tstrok,
		tstrok: tstrok,
		twixt: twixt,
		twoheadleftarrow: twoheadleftarrow,
		twoheadrightarrow: twoheadrightarrow,
		Uacute: Uacute,
		uacute: uacute,
		uarr: uarr,
		Uarr: Uarr,
		uArr: uArr,
		Uarrocir: Uarrocir,
		Ubrcy: Ubrcy,
		ubrcy: ubrcy,
		Ubreve: Ubreve,
		ubreve: ubreve,
		Ucirc: Ucirc,
		ucirc: ucirc,
		Ucy: Ucy,
		ucy: ucy,
		udarr: udarr,
		Udblac: Udblac,
		udblac: udblac,
		udhar: udhar,
		ufisht: ufisht,
		Ufr: Ufr,
		ufr: ufr,
		Ugrave: Ugrave,
		ugrave: ugrave,
		uHar: uHar,
		uharl: uharl,
		uharr: uharr,
		uhblk: uhblk,
		ulcorn: ulcorn,
		ulcorner: ulcorner,
		ulcrop: ulcrop,
		ultri: ultri,
		Umacr: Umacr,
		umacr: umacr,
		uml: uml,
		UnderBar: UnderBar,
		UnderBrace: UnderBrace,
		UnderBracket: UnderBracket,
		UnderParenthesis: UnderParenthesis,
		Union: Union,
		UnionPlus: UnionPlus,
		Uogon: Uogon,
		uogon: uogon,
		Uopf: Uopf,
		uopf: uopf,
		UpArrowBar: UpArrowBar,
		uparrow: uparrow,
		UpArrow: UpArrow,
		Uparrow: Uparrow,
		UpArrowDownArrow: UpArrowDownArrow,
		updownarrow: updownarrow,
		UpDownArrow: UpDownArrow,
		Updownarrow: Updownarrow,
		UpEquilibrium: UpEquilibrium,
		upharpoonleft: upharpoonleft,
		upharpoonright: upharpoonright,
		uplus: uplus,
		UpperLeftArrow: UpperLeftArrow,
		UpperRightArrow: UpperRightArrow,
		upsi: upsi,
		Upsi: Upsi,
		upsih: upsih,
		Upsilon: Upsilon,
		upsilon: upsilon,
		UpTeeArrow: UpTeeArrow,
		UpTee: UpTee,
		upuparrows: upuparrows,
		urcorn: urcorn,
		urcorner: urcorner,
		urcrop: urcrop,
		Uring: Uring,
		uring: uring,
		urtri: urtri,
		Uscr: Uscr,
		uscr: uscr,
		utdot: utdot,
		Utilde: Utilde,
		utilde: utilde,
		utri: utri,
		utrif: utrif,
		uuarr: uuarr,
		Uuml: Uuml,
		uuml: uuml,
		uwangle: uwangle,
		vangrt: vangrt,
		varepsilon: varepsilon,
		varkappa: varkappa,
		varnothing: varnothing,
		varphi: varphi,
		varpi: varpi,
		varpropto: varpropto,
		varr: varr,
		vArr: vArr,
		varrho: varrho,
		varsigma: varsigma,
		varsubsetneq: varsubsetneq,
		varsubsetneqq: varsubsetneqq,
		varsupsetneq: varsupsetneq,
		varsupsetneqq: varsupsetneqq,
		vartheta: vartheta,
		vartriangleleft: vartriangleleft,
		vartriangleright: vartriangleright,
		vBar: vBar,
		Vbar: Vbar,
		vBarv: vBarv,
		Vcy: Vcy,
		vcy: vcy,
		vdash: vdash,
		vDash: vDash,
		Vdash: Vdash,
		VDash: VDash,
		Vdashl: Vdashl,
		veebar: veebar,
		vee: vee,
		Vee: Vee,
		veeeq: veeeq,
		vellip: vellip,
		verbar: verbar,
		Verbar: Verbar,
		vert: vert,
		Vert: Vert,
		VerticalBar: VerticalBar,
		VerticalLine: VerticalLine,
		VerticalSeparator: VerticalSeparator,
		VerticalTilde: VerticalTilde,
		VeryThinSpace: VeryThinSpace,
		Vfr: Vfr,
		vfr: vfr,
		vltri: vltri,
		vnsub: vnsub,
		vnsup: vnsup,
		Vopf: Vopf,
		vopf: vopf,
		vprop: vprop,
		vrtri: vrtri,
		Vscr: Vscr,
		vscr: vscr,
		vsubnE: vsubnE,
		vsubne: vsubne,
		vsupnE: vsupnE,
		vsupne: vsupne,
		Vvdash: Vvdash,
		vzigzag: vzigzag,
		Wcirc: Wcirc,
		wcirc: wcirc,
		wedbar: wedbar,
		wedge: wedge,
		Wedge: Wedge,
		wedgeq: wedgeq,
		weierp: weierp,
		Wfr: Wfr,
		wfr: wfr,
		Wopf: Wopf,
		wopf: wopf,
		wp: wp,
		wr: wr,
		wreath: wreath,
		Wscr: Wscr,
		wscr: wscr,
		xcap: xcap,
		xcirc: xcirc,
		xcup: xcup,
		xdtri: xdtri,
		Xfr: Xfr,
		xfr: xfr,
		xharr: xharr,
		xhArr: xhArr,
		Xi: Xi,
		xi: xi,
		xlarr: xlarr,
		xlArr: xlArr,
		xmap: xmap,
		xnis: xnis,
		xodot: xodot,
		Xopf: Xopf,
		xopf: xopf,
		xoplus: xoplus,
		xotime: xotime,
		xrarr: xrarr,
		xrArr: xrArr,
		Xscr: Xscr,
		xscr: xscr,
		xsqcup: xsqcup,
		xuplus: xuplus,
		xutri: xutri,
		xvee: xvee,
		xwedge: xwedge,
		Yacute: Yacute,
		yacute: yacute,
		YAcy: YAcy,
		yacy: yacy,
		Ycirc: Ycirc,
		ycirc: ycirc,
		Ycy: Ycy,
		ycy: ycy,
		yen: yen,
		Yfr: Yfr,
		yfr: yfr,
		YIcy: YIcy,
		yicy: yicy,
		Yopf: Yopf,
		yopf: yopf,
		Yscr: Yscr,
		yscr: yscr,
		YUcy: YUcy,
		yucy: yucy,
		yuml: yuml,
		Yuml: Yuml,
		Zacute: Zacute,
		zacute: zacute,
		Zcaron: Zcaron,
		zcaron: zcaron,
		Zcy: Zcy,
		zcy: zcy,
		Zdot: Zdot,
		zdot: zdot,
		zeetrf: zeetrf,
		ZeroWidthSpace: ZeroWidthSpace,
		Zeta: Zeta,
		zeta: zeta,
		zfr: zfr,
		Zfr: Zfr,
		ZHcy: ZHcy,
		zhcy: zhcy,
		zigrarr: zigrarr,
		zopf: zopf,
		Zopf: Zopf,
		Zscr: Zscr,
		zscr: zscr,
		zwj: zwj,
		zwnj: zwnj,
		'default': entities
	};

	var Aacute$1 = "Á";
	var aacute$1 = "á";
	var Acirc$1 = "Â";
	var acirc$1 = "â";
	var acute$1 = "´";
	var AElig$1 = "Æ";
	var aelig$1 = "æ";
	var Agrave$1 = "À";
	var agrave$1 = "à";
	var amp$1 = "&";
	var AMP$1 = "&";
	var Aring$1 = "Å";
	var aring$1 = "å";
	var Atilde$1 = "Ã";
	var atilde$1 = "ã";
	var Auml$1 = "Ä";
	var auml$1 = "ä";
	var brvbar$1 = "¦";
	var Ccedil$1 = "Ç";
	var ccedil$1 = "ç";
	var cedil$1 = "¸";
	var cent$1 = "¢";
	var copy$1 = "©";
	var COPY$1 = "©";
	var curren$1 = "¤";
	var deg$1 = "°";
	var divide$1 = "÷";
	var Eacute$1 = "É";
	var eacute$1 = "é";
	var Ecirc$1 = "Ê";
	var ecirc$1 = "ê";
	var Egrave$1 = "È";
	var egrave$1 = "è";
	var ETH$1 = "Ð";
	var eth$1 = "ð";
	var Euml$1 = "Ë";
	var euml$1 = "ë";
	var frac12$1 = "½";
	var frac14$1 = "¼";
	var frac34$1 = "¾";
	var gt$1 = ">";
	var GT$1 = ">";
	var Iacute$1 = "Í";
	var iacute$1 = "í";
	var Icirc$1 = "Î";
	var icirc$1 = "î";
	var iexcl$1 = "¡";
	var Igrave$1 = "Ì";
	var igrave$1 = "ì";
	var iquest$1 = "¿";
	var Iuml$1 = "Ï";
	var iuml$1 = "ï";
	var laquo$1 = "«";
	var lt$1 = "<";
	var LT$1 = "<";
	var macr$1 = "¯";
	var micro$1 = "µ";
	var middot$1 = "·";
	var nbsp$1 = " ";
	var not$1 = "¬";
	var Ntilde$1 = "Ñ";
	var ntilde$1 = "ñ";
	var Oacute$1 = "Ó";
	var oacute$1 = "ó";
	var Ocirc$1 = "Ô";
	var ocirc$1 = "ô";
	var Ograve$1 = "Ò";
	var ograve$1 = "ò";
	var ordf$1 = "ª";
	var ordm$1 = "º";
	var Oslash$1 = "Ø";
	var oslash$1 = "ø";
	var Otilde$1 = "Õ";
	var otilde$1 = "õ";
	var Ouml$1 = "Ö";
	var ouml$1 = "ö";
	var para$1 = "¶";
	var plusmn$1 = "±";
	var pound$1 = "£";
	var quot$1 = "\"";
	var QUOT$1 = "\"";
	var raquo$1 = "»";
	var reg$1 = "®";
	var REG$1 = "®";
	var sect$1 = "§";
	var shy$1 = "­";
	var sup1$1 = "¹";
	var sup2$1 = "²";
	var sup3$1 = "³";
	var szlig$1 = "ß";
	var THORN$1 = "Þ";
	var thorn$1 = "þ";
	var times$1 = "×";
	var Uacute$1 = "Ú";
	var uacute$1 = "ú";
	var Ucirc$1 = "Û";
	var ucirc$1 = "û";
	var Ugrave$1 = "Ù";
	var ugrave$1 = "ù";
	var uml$1 = "¨";
	var Uuml$1 = "Ü";
	var uuml$1 = "ü";
	var Yacute$1 = "Ý";
	var yacute$1 = "ý";
	var yen$1 = "¥";
	var yuml$1 = "ÿ";
	var legacy = {
		Aacute: Aacute$1,
		aacute: aacute$1,
		Acirc: Acirc$1,
		acirc: acirc$1,
		acute: acute$1,
		AElig: AElig$1,
		aelig: aelig$1,
		Agrave: Agrave$1,
		agrave: agrave$1,
		amp: amp$1,
		AMP: AMP$1,
		Aring: Aring$1,
		aring: aring$1,
		Atilde: Atilde$1,
		atilde: atilde$1,
		Auml: Auml$1,
		auml: auml$1,
		brvbar: brvbar$1,
		Ccedil: Ccedil$1,
		ccedil: ccedil$1,
		cedil: cedil$1,
		cent: cent$1,
		copy: copy$1,
		COPY: COPY$1,
		curren: curren$1,
		deg: deg$1,
		divide: divide$1,
		Eacute: Eacute$1,
		eacute: eacute$1,
		Ecirc: Ecirc$1,
		ecirc: ecirc$1,
		Egrave: Egrave$1,
		egrave: egrave$1,
		ETH: ETH$1,
		eth: eth$1,
		Euml: Euml$1,
		euml: euml$1,
		frac12: frac12$1,
		frac14: frac14$1,
		frac34: frac34$1,
		gt: gt$1,
		GT: GT$1,
		Iacute: Iacute$1,
		iacute: iacute$1,
		Icirc: Icirc$1,
		icirc: icirc$1,
		iexcl: iexcl$1,
		Igrave: Igrave$1,
		igrave: igrave$1,
		iquest: iquest$1,
		Iuml: Iuml$1,
		iuml: iuml$1,
		laquo: laquo$1,
		lt: lt$1,
		LT: LT$1,
		macr: macr$1,
		micro: micro$1,
		middot: middot$1,
		nbsp: nbsp$1,
		not: not$1,
		Ntilde: Ntilde$1,
		ntilde: ntilde$1,
		Oacute: Oacute$1,
		oacute: oacute$1,
		Ocirc: Ocirc$1,
		ocirc: ocirc$1,
		Ograve: Ograve$1,
		ograve: ograve$1,
		ordf: ordf$1,
		ordm: ordm$1,
		Oslash: Oslash$1,
		oslash: oslash$1,
		Otilde: Otilde$1,
		otilde: otilde$1,
		Ouml: Ouml$1,
		ouml: ouml$1,
		para: para$1,
		plusmn: plusmn$1,
		pound: pound$1,
		quot: quot$1,
		QUOT: QUOT$1,
		raquo: raquo$1,
		reg: reg$1,
		REG: REG$1,
		sect: sect$1,
		shy: shy$1,
		sup1: sup1$1,
		sup2: sup2$1,
		sup3: sup3$1,
		szlig: szlig$1,
		THORN: THORN$1,
		thorn: thorn$1,
		times: times$1,
		Uacute: Uacute$1,
		uacute: uacute$1,
		Ucirc: Ucirc$1,
		ucirc: ucirc$1,
		Ugrave: Ugrave$1,
		ugrave: ugrave$1,
		uml: uml$1,
		Uuml: Uuml$1,
		uuml: uuml$1,
		Yacute: Yacute$1,
		yacute: yacute$1,
		yen: yen$1,
		yuml: yuml$1
	};

	var legacy$1 = {
		__proto__: null,
		Aacute: Aacute$1,
		aacute: aacute$1,
		Acirc: Acirc$1,
		acirc: acirc$1,
		acute: acute$1,
		AElig: AElig$1,
		aelig: aelig$1,
		Agrave: Agrave$1,
		agrave: agrave$1,
		amp: amp$1,
		AMP: AMP$1,
		Aring: Aring$1,
		aring: aring$1,
		Atilde: Atilde$1,
		atilde: atilde$1,
		Auml: Auml$1,
		auml: auml$1,
		brvbar: brvbar$1,
		Ccedil: Ccedil$1,
		ccedil: ccedil$1,
		cedil: cedil$1,
		cent: cent$1,
		copy: copy$1,
		COPY: COPY$1,
		curren: curren$1,
		deg: deg$1,
		divide: divide$1,
		Eacute: Eacute$1,
		eacute: eacute$1,
		Ecirc: Ecirc$1,
		ecirc: ecirc$1,
		Egrave: Egrave$1,
		egrave: egrave$1,
		ETH: ETH$1,
		eth: eth$1,
		Euml: Euml$1,
		euml: euml$1,
		frac12: frac12$1,
		frac14: frac14$1,
		frac34: frac34$1,
		gt: gt$1,
		GT: GT$1,
		Iacute: Iacute$1,
		iacute: iacute$1,
		Icirc: Icirc$1,
		icirc: icirc$1,
		iexcl: iexcl$1,
		Igrave: Igrave$1,
		igrave: igrave$1,
		iquest: iquest$1,
		Iuml: Iuml$1,
		iuml: iuml$1,
		laquo: laquo$1,
		lt: lt$1,
		LT: LT$1,
		macr: macr$1,
		micro: micro$1,
		middot: middot$1,
		nbsp: nbsp$1,
		not: not$1,
		Ntilde: Ntilde$1,
		ntilde: ntilde$1,
		Oacute: Oacute$1,
		oacute: oacute$1,
		Ocirc: Ocirc$1,
		ocirc: ocirc$1,
		Ograve: Ograve$1,
		ograve: ograve$1,
		ordf: ordf$1,
		ordm: ordm$1,
		Oslash: Oslash$1,
		oslash: oslash$1,
		Otilde: Otilde$1,
		otilde: otilde$1,
		Ouml: Ouml$1,
		ouml: ouml$1,
		para: para$1,
		plusmn: plusmn$1,
		pound: pound$1,
		quot: quot$1,
		QUOT: QUOT$1,
		raquo: raquo$1,
		reg: reg$1,
		REG: REG$1,
		sect: sect$1,
		shy: shy$1,
		sup1: sup1$1,
		sup2: sup2$1,
		sup3: sup3$1,
		szlig: szlig$1,
		THORN: THORN$1,
		thorn: thorn$1,
		times: times$1,
		Uacute: Uacute$1,
		uacute: uacute$1,
		Ucirc: Ucirc$1,
		ucirc: ucirc$1,
		Ugrave: Ugrave$1,
		ugrave: ugrave$1,
		uml: uml$1,
		Uuml: Uuml$1,
		uuml: uuml$1,
		Yacute: Yacute$1,
		yacute: yacute$1,
		yen: yen$1,
		yuml: yuml$1,
		'default': legacy
	};

	var amp$2 = "&";
	var apos$1 = "'";
	var gt$2 = ">";
	var lt$2 = "<";
	var quot$2 = "\"";
	var xml = {
		amp: amp$2,
		apos: apos$1,
		gt: gt$2,
		lt: lt$2,
		quot: quot$2
	};

	var xml$1 = {
		__proto__: null,
		amp: amp$2,
		apos: apos$1,
		gt: gt$2,
		lt: lt$2,
		quot: quot$2,
		'default': xml
	};

	var decode = {
		"0": 65533,
		"128": 8364,
		"130": 8218,
		"131": 402,
		"132": 8222,
		"133": 8230,
		"134": 8224,
		"135": 8225,
		"136": 710,
		"137": 8240,
		"138": 352,
		"139": 8249,
		"140": 338,
		"142": 381,
		"145": 8216,
		"146": 8217,
		"147": 8220,
		"148": 8221,
		"149": 8226,
		"150": 8211,
		"151": 8212,
		"152": 732,
		"153": 8482,
		"154": 353,
		"155": 8250,
		"156": 339,
		"158": 382,
		"159": 376
	};

	var decode$1 = {
		__proto__: null,
		'default': decode
	};

	var require$$0 = getCjsExportFromNamespace(decode$1);

	var decode_codepoint = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	var decode_json_1 = __importDefault(require$$0);
	// modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
	function decodeCodePoint(codePoint) {
	    if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
	        return "\uFFFD";
	    }
	    if (codePoint in decode_json_1.default) {
	        codePoint = decode_json_1.default[codePoint];
	    }
	    var output = "";
	    if (codePoint > 0xffff) {
	        codePoint -= 0x10000;
	        output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
	        codePoint = 0xdc00 | (codePoint & 0x3ff);
	    }
	    output += String.fromCharCode(codePoint);
	    return output;
	}
	exports.default = decodeCodePoint;
	});

	var require$$1 = getCjsExportFromNamespace(entities$1);

	var require$$1$1 = getCjsExportFromNamespace(legacy$1);

	var require$$0$1 = getCjsExportFromNamespace(xml$1);

	var decode$2 = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decodeHTML = exports.decodeHTMLStrict = exports.decodeXML = void 0;
	var entities_json_1 = __importDefault(require$$1);
	var legacy_json_1 = __importDefault(require$$1$1);
	var xml_json_1 = __importDefault(require$$0$1);
	var decode_codepoint_1 = __importDefault(decode_codepoint);
	exports.decodeXML = getStrictDecoder(xml_json_1.default);
	exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
	function getStrictDecoder(map) {
	    var keys = Object.keys(map).join("|");
	    var replace = getReplacer(map);
	    keys += "|#[xX][\\da-fA-F]+|#\\d+";
	    var re = new RegExp("&(?:" + keys + ");", "g");
	    return function (str) { return String(str).replace(re, replace); };
	}
	var sorter = function (a, b) { return (a < b ? 1 : -1); };
	exports.decodeHTML = (function () {
	    var legacy = Object.keys(legacy_json_1.default).sort(sorter);
	    var keys = Object.keys(entities_json_1.default).sort(sorter);
	    for (var i = 0, j = 0; i < keys.length; i++) {
	        if (legacy[j] === keys[i]) {
	            keys[i] += ";?";
	            j++;
	        }
	        else {
	            keys[i] += ";";
	        }
	    }
	    var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
	    var replace = getReplacer(entities_json_1.default);
	    function replacer(str) {
	        if (str.substr(-1) !== ";")
	            str += ";";
	        return replace(str);
	    }
	    //TODO consider creating a merged map
	    return function (str) { return String(str).replace(re, replacer); };
	})();
	function getReplacer(map) {
	    return function replace(str) {
	        if (str.charAt(1) === "#") {
	            var secondChar = str.charAt(2);
	            if (secondChar === "X" || secondChar === "x") {
	                return decode_codepoint_1.default(parseInt(str.substr(3), 16));
	            }
	            return decode_codepoint_1.default(parseInt(str.substr(2), 10));
	        }
	        return map[str.slice(1, -1)];
	    };
	}
	});

	var encode = createCommonjsModule(function (module, exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.escape = exports.encodeHTML = exports.encodeXML = void 0;
	var xml_json_1 = __importDefault(require$$0$1);
	var inverseXML = getInverseObj(xml_json_1.default);
	var xmlReplacer = getInverseReplacer(inverseXML);
	exports.encodeXML = getInverse(inverseXML, xmlReplacer);
	var entities_json_1 = __importDefault(require$$1);
	var inverseHTML = getInverseObj(entities_json_1.default);
	var htmlReplacer = getInverseReplacer(inverseHTML);
	exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
	function getInverseObj(obj) {
	    return Object.keys(obj)
	        .sort()
	        .reduce(function (inverse, name) {
	        inverse[obj[name]] = "&" + name + ";";
	        return inverse;
	    }, {});
	}
	function getInverseReplacer(inverse) {
	    var single = [];
	    var multiple = [];
	    for (var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++) {
	        var k = _a[_i];
	        if (k.length === 1) {
	            // Add value to single array
	            single.push("\\" + k);
	        }
	        else {
	            // Add value to multiple array
	            multiple.push(k);
	        }
	    }
	    // Add ranges to single characters.
	    single.sort();
	    for (var start = 0; start < single.length - 1; start++) {
	        // Find the end of a run of characters
	        var end = start;
	        while (end < single.length - 1 &&
	            single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
	            end += 1;
	        }
	        var count = 1 + end - start;
	        // We want to replace at least three characters
	        if (count < 3)
	            continue;
	        single.splice(start, count, single[start] + "-" + single[end]);
	    }
	    multiple.unshift("[" + single.join("") + "]");
	    return new RegExp(multiple.join("|"), "g");
	}
	var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
	function singleCharReplacer(c) {
	    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	    return "&#x" + c.codePointAt(0).toString(16).toUpperCase() + ";";
	}
	function getInverse(inverse, re) {
	    return function (data) {
	        return data
	            .replace(re, function (name) { return inverse[name]; })
	            .replace(reNonASCII, singleCharReplacer);
	    };
	}
	var reXmlChars = getInverseReplacer(inverseXML);
	function escape(data) {
	    return data
	        .replace(reXmlChars, singleCharReplacer)
	        .replace(reNonASCII, singleCharReplacer);
	}
	exports.escape = escape;
	});

	var lib$1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encode = exports.decodeStrict = exports.decode = void 0;


	/**
	 * Decodes a string with entities.
	 *
	 * @param data String to decode.
	 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
	 */
	function decode(data, level) {
	    return (!level || level <= 0 ? decode$2.decodeXML : decode$2.decodeHTML)(data);
	}
	exports.decode = decode;
	/**
	 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
	 *
	 * @param data String to decode.
	 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
	 */
	function decodeStrict(data, level) {
	    return (!level || level <= 0 ? decode$2.decodeXML : decode$2.decodeHTMLStrict)(data);
	}
	exports.decodeStrict = decodeStrict;
	/**
	 * Encodes a string with entities.
	 *
	 * @param data String to encode.
	 * @param level Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
	 */
	function encode$1(data, level) {
	    return (!level || level <= 0 ? encode.encodeXML : encode.encodeHTML)(data);
	}
	exports.encode = encode$1;
	var encode_2 = encode;
	Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function () { return encode_2.encodeXML; } });
	Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
	Object.defineProperty(exports, "escape", { enumerable: true, get: function () { return encode_2.escape; } });
	// Legacy aliases
	Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
	Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
	var decode_2 = decode$2;
	Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function () { return decode_2.decodeXML; } });
	Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
	Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
	// Legacy aliases
	Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
	Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
	Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
	Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
	Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function () { return decode_2.decodeXML; } });
	});

	var elementNames = {
		altglyph: "altGlyph",
		altglyphdef: "altGlyphDef",
		altglyphitem: "altGlyphItem",
		animatecolor: "animateColor",
		animatemotion: "animateMotion",
		animatetransform: "animateTransform",
		clippath: "clipPath",
		feblend: "feBlend",
		fecolormatrix: "feColorMatrix",
		fecomponenttransfer: "feComponentTransfer",
		fecomposite: "feComposite",
		feconvolvematrix: "feConvolveMatrix",
		fediffuselighting: "feDiffuseLighting",
		fedisplacementmap: "feDisplacementMap",
		fedistantlight: "feDistantLight",
		fedropshadow: "feDropShadow",
		feflood: "feFlood",
		fefunca: "feFuncA",
		fefuncb: "feFuncB",
		fefuncg: "feFuncG",
		fefuncr: "feFuncR",
		fegaussianblur: "feGaussianBlur",
		feimage: "feImage",
		femerge: "feMerge",
		femergenode: "feMergeNode",
		femorphology: "feMorphology",
		feoffset: "feOffset",
		fepointlight: "fePointLight",
		fespecularlighting: "feSpecularLighting",
		fespotlight: "feSpotLight",
		fetile: "feTile",
		feturbulence: "feTurbulence",
		foreignobject: "foreignObject",
		glyphref: "glyphRef",
		lineargradient: "linearGradient",
		radialgradient: "radialGradient",
		textpath: "textPath"
	};
	var attributeNames = {
		definitionurl: "definitionURL",
		attributename: "attributeName",
		attributetype: "attributeType",
		basefrequency: "baseFrequency",
		baseprofile: "baseProfile",
		calcmode: "calcMode",
		clippathunits: "clipPathUnits",
		diffuseconstant: "diffuseConstant",
		edgemode: "edgeMode",
		filterunits: "filterUnits",
		glyphref: "glyphRef",
		gradienttransform: "gradientTransform",
		gradientunits: "gradientUnits",
		kernelmatrix: "kernelMatrix",
		kernelunitlength: "kernelUnitLength",
		keypoints: "keyPoints",
		keysplines: "keySplines",
		keytimes: "keyTimes",
		lengthadjust: "lengthAdjust",
		limitingconeangle: "limitingConeAngle",
		markerheight: "markerHeight",
		markerunits: "markerUnits",
		markerwidth: "markerWidth",
		maskcontentunits: "maskContentUnits",
		maskunits: "maskUnits",
		numoctaves: "numOctaves",
		pathlength: "pathLength",
		patterncontentunits: "patternContentUnits",
		patterntransform: "patternTransform",
		patternunits: "patternUnits",
		pointsatx: "pointsAtX",
		pointsaty: "pointsAtY",
		pointsatz: "pointsAtZ",
		preservealpha: "preserveAlpha",
		preserveaspectratio: "preserveAspectRatio",
		primitiveunits: "primitiveUnits",
		refx: "refX",
		refy: "refY",
		repeatcount: "repeatCount",
		repeatdur: "repeatDur",
		requiredextensions: "requiredExtensions",
		requiredfeatures: "requiredFeatures",
		specularconstant: "specularConstant",
		specularexponent: "specularExponent",
		spreadmethod: "spreadMethod",
		startoffset: "startOffset",
		stddeviation: "stdDeviation",
		stitchtiles: "stitchTiles",
		surfacescale: "surfaceScale",
		systemlanguage: "systemLanguage",
		tablevalues: "tableValues",
		targetx: "targetX",
		targety: "targetY",
		textlength: "textLength",
		viewbox: "viewBox",
		viewtarget: "viewTarget",
		xchannelselector: "xChannelSelector",
		ychannelselector: "yChannelSelector",
		zoomandpan: "zoomAndPan"
	};
	var foreignNames = {
		elementNames: elementNames,
		attributeNames: attributeNames
	};

	var foreignNames$1 = {
		__proto__: null,
		elementNames: elementNames,
		attributeNames: attributeNames,
		'default': foreignNames
	};

	var foreignNames$2 = getCjsExportFromNamespace(foreignNames$1);

	var domSerializer = createCommonjsModule(function (module) {
	/*
	  Module dependencies
	*/



	/* mixed-case SVG and MathML tags & attributes
	   recognized by the HTML parser, see
	   https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign
	*/

	foreignNames$2.elementNames.__proto__ = null; /* use as a simple dictionary */
	foreignNames$2.attributeNames.__proto__ = null;

	var unencodedElements = {
	  __proto__: null,
	  style: true,
	  script: true,
	  xmp: true,
	  iframe: true,
	  noembed: true,
	  noframes: true,
	  plaintext: true,
	  noscript: true
	};

	/*
	  Format attributes
	*/
	function formatAttrs(attributes, opts) {
	  if (!attributes) return;

	  var output = '';
	  var value;

	  // Loop through the attributes
	  for (var key in attributes) {
	    value = attributes[key];
	    if (output) {
	      output += ' ';
	    }

	    if (opts.xmlMode === 'foreign') {
	      /* fix up mixed-case attribute names */
	      key = foreignNames$2.attributeNames[key] || key;
	    }
	    output += key;
	    if ((value !== null && value !== '') || opts.xmlMode) {
	      output +=
	        '="' +
	        (opts.decodeEntities
	          ? lib$1.encodeXML(value)
	          : value.replace(/\"/g, '&quot;')) +
	        '"';
	    }
	  }

	  return output;
	}

	/*
	  Self-enclosing tags (stolen from node-htmlparser)
	*/
	var singleTag = {
	  __proto__: null,
	  area: true,
	  base: true,
	  basefont: true,
	  br: true,
	  col: true,
	  command: true,
	  embed: true,
	  frame: true,
	  hr: true,
	  img: true,
	  input: true,
	  isindex: true,
	  keygen: true,
	  link: true,
	  meta: true,
	  param: true,
	  source: true,
	  track: true,
	  wbr: true
	};

	var render = (module.exports = function(dom, opts) {
	  if (!Array.isArray(dom) && !dom.cheerio) dom = [dom];
	  opts = opts || {};

	  var output = '';

	  for (var i = 0; i < dom.length; i++) {
	    var elem = dom[i];

	    if (elem.type === 'root') output += render(elem.children, opts);
	    else if (lib.isTag(elem)) output += renderTag(elem, opts);
	    else if (elem.type === lib.Directive)
	      output += renderDirective(elem);
	    else if (elem.type === lib.Comment) output += renderComment(elem);
	    else if (elem.type === lib.CDATA) output += renderCdata(elem);
	    else output += renderText(elem, opts);
	  }

	  return output;
	});

	var foreignModeIntegrationPoints = [
	  'mi',
	  'mo',
	  'mn',
	  'ms',
	  'mtext',
	  'annotation-xml',
	  'foreignObject',
	  'desc',
	  'title'
	];

	function renderTag(elem, opts) {
	  // Handle SVG / MathML in HTML
	  if (opts.xmlMode === 'foreign') {
	    /* fix up mixed-case element names */
	    elem.name = foreignNames$2.elementNames[elem.name] || elem.name;
	    /* exit foreign mode at integration points */
	    if (
	      elem.parent &&
	      foreignModeIntegrationPoints.indexOf(elem.parent.name) >= 0
	    )
	      opts = Object.assign({}, opts, { xmlMode: false });
	  }
	  if (!opts.xmlMode && ['svg', 'math'].indexOf(elem.name) >= 0) {
	    opts = Object.assign({}, opts, { xmlMode: 'foreign' });
	  }

	  var tag = '<' + elem.name;
	  var attribs = formatAttrs(elem.attribs, opts);

	  if (attribs) {
	    tag += ' ' + attribs;
	  }

	  if (opts.xmlMode && (!elem.children || elem.children.length === 0)) {
	    tag += '/>';
	  } else {
	    tag += '>';
	    if (elem.children) {
	      tag += render(elem.children, opts);
	    }

	    if (!singleTag[elem.name] || opts.xmlMode) {
	      tag += '</' + elem.name + '>';
	    }
	  }

	  return tag;
	}

	function renderDirective(elem) {
	  return '<' + elem.data + '>';
	}

	function renderText(elem, opts) {
	  var data = elem.data || '';

	  // if entities weren't decoded, no need to encode them back
	  if (
	    opts.decodeEntities &&
	    !(elem.parent && elem.parent.name in unencodedElements)
	  ) {
	    data = lib$1.encodeXML(data);
	  }

	  return data;
	}

	function renderCdata(elem) {
	  return '<![CDATA[' + elem.children[0].data + ']]>';
	}

	function renderComment(elem) {
	  return '<!--' + elem.data + '-->';
	}
	});

	var isTag = domelementtype.isTag;

	var stringify = {
		getInnerHTML: getInnerHTML,
		getOuterHTML: domSerializer,
		getText: getText
	};

	function getInnerHTML(elem, opts){
		return elem.children ? elem.children.map(function(elem){
			return domSerializer(elem, opts);
		}).join("") : "";
	}

	function getText(elem){
		if(Array.isArray(elem)) return elem.map(getText).join("");
		if(isTag(elem) || elem.type === domelementtype.CDATA) return getText(elem.children);
		if(elem.type === domelementtype.Text) return elem.data;
		return "";
	}

	var traversal = createCommonjsModule(function (module, exports) {
	var getChildren = exports.getChildren = function(elem){
		return elem.children;
	};

	var getParent = exports.getParent = function(elem){
		return elem.parent;
	};

	exports.getSiblings = function(elem){
		var parent = getParent(elem);
		return parent ? getChildren(parent) : [elem];
	};

	exports.getAttributeValue = function(elem, name){
		return elem.attribs && elem.attribs[name];
	};

	exports.hasAttrib = function(elem, name){
		return !!elem.attribs && hasOwnProperty.call(elem.attribs, name);
	};

	exports.getName = function(elem){
		return elem.name;
	};
	});

	var removeElement = function(elem){
		if(elem.prev) elem.prev.next = elem.next;
		if(elem.next) elem.next.prev = elem.prev;

		if(elem.parent){
			var childs = elem.parent.children;
			childs.splice(childs.lastIndexOf(elem), 1);
		}
	};

	var replaceElement = function(elem, replacement){
		var prev = replacement.prev = elem.prev;
		if(prev){
			prev.next = replacement;
		}

		var next = replacement.next = elem.next;
		if(next){
			next.prev = replacement;
		}

		var parent = replacement.parent = elem.parent;
		if(parent){
			var childs = parent.children;
			childs[childs.lastIndexOf(elem)] = replacement;
		}
	};

	var appendChild = function(elem, child){
		child.parent = elem;

		if(elem.children.push(child) !== 1){
			var sibling = elem.children[elem.children.length - 2];
			sibling.next = child;
			child.prev = sibling;
			child.next = null;
		}
	};

	var append = function(elem, next){
		var parent = elem.parent,
			currNext = elem.next;

		next.next = currNext;
		next.prev = elem;
		elem.next = next;
		next.parent = parent;

		if(currNext){
			currNext.prev = next;
			if(parent){
				var childs = parent.children;
				childs.splice(childs.lastIndexOf(currNext), 0, next);
			}
		} else if(parent){
			parent.children.push(next);
		}
	};

	var prepend = function(elem, prev){
		var parent = elem.parent;
		if(parent){
			var childs = parent.children;
			childs.splice(childs.lastIndexOf(elem), 0, prev);
		}

		if(elem.prev){
			elem.prev.next = prev;
		}
		
		prev.parent = parent;
		prev.prev = elem.prev;
		prev.next = elem;
		elem.prev = prev;
	};

	var manipulation = {
		removeElement: removeElement,
		replaceElement: replaceElement,
		appendChild: appendChild,
		append: append,
		prepend: prepend
	};

	var isTag$1 = domelementtype.isTag;

	var querying = {
		filter: filter,
		find: find,
		findOneChild: findOneChild,
		findOne: findOne,
		existsOne: existsOne,
		findAll: findAll
	};

	function filter(test, element, recurse, limit){
		if(!Array.isArray(element)) element = [element];

		if(typeof limit !== "number" || !isFinite(limit)){
			limit = Infinity;
		}
		return find(test, element, recurse !== false, limit);
	}

	function find(test, elems, recurse, limit){
		var result = [], childs;

		for(var i = 0, j = elems.length; i < j; i++){
			if(test(elems[i])){
				result.push(elems[i]);
				if(--limit <= 0) break;
			}

			childs = elems[i].children;
			if(recurse && childs && childs.length > 0){
				childs = find(test, childs, recurse, limit);
				result = result.concat(childs);
				limit -= childs.length;
				if(limit <= 0) break;
			}
		}

		return result;
	}

	function findOneChild(test, elems){
		for(var i = 0, l = elems.length; i < l; i++){
			if(test(elems[i])) return elems[i];
		}

		return null;
	}

	function findOne(test, elems){
		var elem = null;

		for(var i = 0, l = elems.length; i < l && !elem; i++){
			if(!isTag$1(elems[i])){
				continue;
			} else if(test(elems[i])){
				elem = elems[i];
			} else if(elems[i].children.length > 0){
				elem = findOne(test, elems[i].children);
			}
		}

		return elem;
	}

	function existsOne(test, elems){
		for(var i = 0, l = elems.length; i < l; i++){
			if(
				isTag$1(elems[i]) && (
					test(elems[i]) || (
						elems[i].children.length > 0 &&
						existsOne(test, elems[i].children)
					)
				)
			){
				return true;
			}
		}

		return false;
	}

	function findAll(test, elems){
		var result = [];
		for(var i = 0, j = elems.length; i < j; i++){
			if(!isTag$1(elems[i])) continue;
			if(test(elems[i])) result.push(elems[i]);

			if(elems[i].children.length > 0){
				result = result.concat(findAll(test, elems[i].children));
			}
		}
		return result;
	}

	var legacy$2 = createCommonjsModule(function (module, exports) {
	var isTag = exports.isTag = domelementtype.isTag;

	exports.testElement = function(options, element){
		for(var key in options){
			if(!options.hasOwnProperty(key));
			else if(key === "tag_name"){
				if(!isTag(element) || !options.tag_name(element.name)){
					return false;
				}
			} else if(key === "tag_type"){
				if(!options.tag_type(element.type)) return false;
			} else if(key === "tag_contains"){
				if(isTag(element) || !options.tag_contains(element.data)){
					return false;
				}
			} else if(!element.attribs || !options[key](element.attribs[key])){
				return false;
			}
		}
		return true;
	};

	var Checks = {
		tag_name: function(name){
			if(typeof name === "function"){
				return function(elem){ return isTag(elem) && name(elem.name); };
			} else if(name === "*"){
				return isTag;
			} else {
				return function(elem){ return isTag(elem) && elem.name === name; };
			}
		},
		tag_type: function(type){
			if(typeof type === "function"){
				return function(elem){ return type(elem.type); };
			} else {
				return function(elem){ return elem.type === type; };
			}
		},
		tag_contains: function(data){
			if(typeof data === "function"){
				return function(elem){ return !isTag(elem) && data(elem.data); };
			} else {
				return function(elem){ return !isTag(elem) && elem.data === data; };
			}
		}
	};

	function getAttribCheck(attrib, value){
		if(typeof value === "function"){
			return function(elem){ return elem.attribs && value(elem.attribs[attrib]); };
		} else {
			return function(elem){ return elem.attribs && elem.attribs[attrib] === value; };
		}
	}

	function combineFuncs(a, b){
		return function(elem){
			return a(elem) || b(elem);
		};
	}

	exports.getElements = function(options, element, recurse, limit){
		var funcs = Object.keys(options).map(function(key){
			var value = options[key];
			return key in Checks ? Checks[key](value) : getAttribCheck(key, value);
		});

		return funcs.length === 0 ? [] : this.filter(
			funcs.reduce(combineFuncs),
			element, recurse, limit
		);
	};

	exports.getElementById = function(id, element, recurse){
		if(!Array.isArray(element)) element = [element];
		return this.findOne(getAttribCheck("id", id), element, recurse !== false);
	};

	exports.getElementsByTagName = function(name, element, recurse, limit){
		return this.filter(Checks.tag_name(name), element, recurse, limit);
	};

	exports.getElementsByTagType = function(type, element, recurse, limit){
		return this.filter(Checks.tag_type(type), element, recurse, limit);
	};
	});

	var helpers = createCommonjsModule(function (module, exports) {
	// removeSubsets
	// Given an array of nodes, remove any member that is contained by another.
	exports.removeSubsets = function(nodes) {
		var idx = nodes.length, node, ancestor, replace;

		// Check if each node (or one of its ancestors) is already contained in the
		// array.
		while (--idx > -1) {
			node = ancestor = nodes[idx];

			// Temporarily remove the node under consideration
			nodes[idx] = null;
			replace = true;

			while (ancestor) {
				if (nodes.indexOf(ancestor) > -1) {
					replace = false;
					nodes.splice(idx, 1);
					break;
				}
				ancestor = ancestor.parent;
			}

			// If the node has been found to be unique, re-insert it.
			if (replace) {
				nodes[idx] = node;
			}
		}

		return nodes;
	};

	// Source: http://dom.spec.whatwg.org/#dom-node-comparedocumentposition
	var POSITION = {
		DISCONNECTED: 1,
		PRECEDING: 2,
		FOLLOWING: 4,
		CONTAINS: 8,
		CONTAINED_BY: 16
	};

	// Compare the position of one node against another node in any other document.
	// The return value is a bitmask with the following values:
	//
	// document order:
	// > There is an ordering, document order, defined on all the nodes in the
	// > document corresponding to the order in which the first character of the
	// > XML representation of each node occurs in the XML representation of the
	// > document after expansion of general entities. Thus, the document element
	// > node will be the first node. Element nodes occur before their children.
	// > Thus, document order orders element nodes in order of the occurrence of
	// > their start-tag in the XML (after expansion of entities). The attribute
	// > nodes of an element occur after the element and before its children. The
	// > relative order of attribute nodes is implementation-dependent./
	// Source:
	// http://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-document-order
	//
	// @argument {Node} nodaA The first node to use in the comparison
	// @argument {Node} nodeB The second node to use in the comparison
	//
	// @return {Number} A bitmask describing the input nodes' relative position.
	//         See http://dom.spec.whatwg.org/#dom-node-comparedocumentposition for
	//         a description of these values.
	var comparePos = exports.compareDocumentPosition = function(nodeA, nodeB) {
		var aParents = [];
		var bParents = [];
		var current, sharedParent, siblings, aSibling, bSibling, idx;

		if (nodeA === nodeB) {
			return 0;
		}

		current = nodeA;
		while (current) {
			aParents.unshift(current);
			current = current.parent;
		}
		current = nodeB;
		while (current) {
			bParents.unshift(current);
			current = current.parent;
		}

		idx = 0;
		while (aParents[idx] === bParents[idx]) {
			idx++;
		}

		if (idx === 0) {
			return POSITION.DISCONNECTED;
		}

		sharedParent = aParents[idx - 1];
		siblings = sharedParent.children;
		aSibling = aParents[idx];
		bSibling = bParents[idx];

		if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
			if (sharedParent === nodeB) {
				return POSITION.FOLLOWING | POSITION.CONTAINED_BY;
			}
			return POSITION.FOLLOWING;
		} else {
			if (sharedParent === nodeA) {
				return POSITION.PRECEDING | POSITION.CONTAINS;
			}
			return POSITION.PRECEDING;
		}
	};

	// Sort an array of nodes based on their relative position in the document and
	// remove any duplicate nodes. If the array contains nodes that do not belong
	// to the same document, sort order is unspecified.
	//
	// @argument {Array} nodes Array of DOM nodes
	//
	// @returns {Array} collection of unique nodes, sorted in document order
	exports.uniqueSort = function(nodes) {
		var idx = nodes.length, node, position;

		nodes = nodes.slice();

		while (--idx > -1) {
			node = nodes[idx];
			position = nodes.indexOf(node);
			if (position > -1 && position < idx) {
				nodes.splice(idx, 1);
			}
		}
		nodes.sort(function(a, b) {
			var relative = comparePos(a, b);
			if (relative & POSITION.PRECEDING) {
				return -1;
			} else if (relative & POSITION.FOLLOWING) {
				return 1;
			}
			return 0;
		});

		return nodes;
	};
	});

	var domutils = createCommonjsModule(function (module) {
	var DomUtils = module.exports;

	[
		stringify,
		traversal,
		manipulation,
		querying,
		legacy$2,
		helpers
	].forEach(function(ext){
		Object.keys(ext).forEach(function(key){
			DomUtils[key] = ext[key].bind(DomUtils);
		});
	});
	});

	var parse_1 = parse;

	//following http://www.w3.org/TR/css3-selectors/#nth-child-pseudo

	//[ ['-'|'+']? INTEGER? {N} [ S* ['-'|'+'] S* INTEGER ]?
	var re_nthElement = /^([+\-]?\d*n)?\s*(?:([+\-]?)\s*(\d+))?$/;

	/*
		parses a nth-check formula, returns an array of two numbers
	*/
	function parse(formula){
		formula = formula.trim().toLowerCase();

		if(formula === "even"){
			return [2, 0];
		} else if(formula === "odd"){
			return [2, 1];
		} else {
			var parsed = formula.match(re_nthElement);

			if(!parsed){
				throw new SyntaxError("n-th rule couldn't be parsed ('" + formula + "')");
			}

			var a;

			if(parsed[1]){
				a = parseInt(parsed[1], 10);
				if(isNaN(a)){
					if(parsed[1].charAt(0) === "-") a = -1;
					else a = 1;
				}
			} else a = 0;

			return [
				a,
				parsed[3] ? parseInt((parsed[2] || "") + parsed[3], 10) : 0
			];
		}
	}

	var boolbase = {
		trueFunc: function trueFunc(){
			return true;
		},
		falseFunc: function falseFunc(){
			return false;
		}
	};

	var compile_1 = compile;

	var trueFunc  = boolbase.trueFunc,
	    falseFunc = boolbase.falseFunc;

	/*
		returns a function that checks if an elements index matches the given rule
		highly optimized to return the fastest solution
	*/
	function compile(parsed){
		var a = parsed[0],
		    b = parsed[1] - 1;

		//when b <= 0, a*n won't be possible for any matches when a < 0
		//besides, the specification says that no element is matched when a and b are 0
		if(b < 0 && a <= 0) return falseFunc;

		//when a is in the range -1..1, it matches any element (so only b is checked)
		if(a ===-1) return function(pos){ return pos <= b; };
		if(a === 0) return function(pos){ return pos === b; };
		//when b <= 0 and a === 1, they match any element
		if(a === 1) return b < 0 ? trueFunc : function(pos){ return pos >= b; };

		//when a > 0, modulo can be used to check if there is a match
		var bMod = b % a;
		if(bMod < 0) bMod += a;

		if(a > 1){
			return function(pos){
				return pos >= b && pos % a === bMod;
			};
		}

		a *= -1; //make `a` positive

		return function(pos){
			return pos <= b && pos % a === bMod;
		};
	}

	var nthCheck = function nthCheck(formula){
		return compile_1(parse_1(formula));
	};

	var parse_1$1 = parse_1;
	var compile_1$1 = compile_1;
	nthCheck.parse = parse_1$1;
	nthCheck.compile = compile_1$1;

	var hasAttrib = domutils.hasAttrib,
	    getAttributeValue = domutils.getAttributeValue,
	    falseFunc$1 = boolbase.falseFunc;

	//https://github.com/slevithan/XRegExp/blob/master/src/xregexp.js#L469
	var reChars = /[-[\]{}()*+?.,\\^$|#\s]/g;

	/*
		attribute selectors
	*/

	var attributeRules = {
		__proto__: null,
		equals: function(next, data){
			var name  = data.name,
			    value = data.value;

			if(data.ignoreCase){
				value = value.toLowerCase();

				return function equalsIC(elem){
					var attr = getAttributeValue(elem, name);
					return attr != null && attr.toLowerCase() === value && next(elem);
				};
			}

			return function equals(elem){
				return getAttributeValue(elem, name) === value && next(elem);
			};
		},
		hyphen: function(next, data){
			var name  = data.name,
			    value = data.value,
			    len = value.length;

			if(data.ignoreCase){
				value = value.toLowerCase();

				return function hyphenIC(elem){
					var attr = getAttributeValue(elem, name);
					return attr != null &&
							(attr.length === len || attr.charAt(len) === "-") &&
							attr.substr(0, len).toLowerCase() === value &&
							next(elem);
				};
			}

			return function hyphen(elem){
				var attr = getAttributeValue(elem, name);
				return attr != null &&
						attr.substr(0, len) === value &&
						(attr.length === len || attr.charAt(len) === "-") &&
						next(elem);
			};
		},
		element: function(next, data){
			var name = data.name,
			    value = data.value;

			if(/\s/.test(value)){
				return falseFunc$1;
			}

			value = value.replace(reChars, "\\$&");

			var pattern = "(?:^|\\s)" + value + "(?:$|\\s)",
			    flags = data.ignoreCase ? "i" : "",
			    regex = new RegExp(pattern, flags);

			return function element(elem){
				var attr = getAttributeValue(elem, name);
				return attr != null && regex.test(attr) && next(elem);
			};
		},
		exists: function(next, data){
			var name = data.name;
			return function exists(elem){
				return hasAttrib(elem, name) && next(elem);
			};
		},
		start: function(next, data){
			var name  = data.name,
			    value = data.value,
			    len = value.length;

			if(len === 0){
				return falseFunc$1;
			}
			
			if(data.ignoreCase){
				value = value.toLowerCase();

				return function startIC(elem){
					var attr = getAttributeValue(elem, name);
					return attr != null && attr.substr(0, len).toLowerCase() === value && next(elem);
				};
			}

			return function start(elem){
				var attr = getAttributeValue(elem, name);
				return attr != null && attr.substr(0, len) === value && next(elem);
			};
		},
		end: function(next, data){
			var name  = data.name,
			    value = data.value,
			    len   = -value.length;

			if(len === 0){
				return falseFunc$1;
			}

			if(data.ignoreCase){
				value = value.toLowerCase();

				return function endIC(elem){
					var attr = getAttributeValue(elem, name);
					return attr != null && attr.substr(len).toLowerCase() === value && next(elem);
				};
			}

			return function end(elem){
				var attr = getAttributeValue(elem, name);
				return attr != null && attr.substr(len) === value && next(elem);
			};
		},
		any: function(next, data){
			var name  = data.name,
			    value = data.value;

			if(value === ""){
				return falseFunc$1;
			}

			if(data.ignoreCase){
				var regex = new RegExp(value.replace(reChars, "\\$&"), "i");

				return function anyIC(elem){
					var attr = getAttributeValue(elem, name);
					return attr != null && regex.test(attr) && next(elem);
				};
			}

			return function any(elem){
				var attr = getAttributeValue(elem, name);
				return attr != null && attr.indexOf(value) >= 0 && next(elem);
			};
		},
		not: function(next, data){
			var name  = data.name,
			    value = data.value;

			if(value === ""){
				return function notEmpty(elem){
					return !!getAttributeValue(elem, name) && next(elem);
				};
			} else if(data.ignoreCase){
				value = value.toLowerCase();

				return function notIC(elem){
					var attr = getAttributeValue(elem, name);
					return attr != null && attr.toLowerCase() !== value && next(elem);
				};
			}

			return function not(elem){
				return getAttributeValue(elem, name) !== value && next(elem);
			};
		}
	};

	var attributes = {
		compile: function(next, data, options){
			if(options && options.strict && (
				data.ignoreCase || data.action === "not"
			)) throw SyntaxError("Unsupported attribute selector");
			return attributeRules[data.action](next, data);
		},
		rules: attributeRules
	};

	/*
		pseudo selectors

		---

		they are available in two forms:
		* filters called when the selector
		  is compiled and return a function
		  that needs to return next()
		* pseudos get called on execution
		  they need to return a boolean
	*/

	var isTag$2       = domutils.isTag,
	    getText$1     = domutils.getText,
	    getParent   = domutils.getParent,
	    getChildren = domutils.getChildren,
	    getSiblings = domutils.getSiblings,
	    hasAttrib$1   = domutils.hasAttrib,
	    getName     = domutils.getName,
	    getAttribute= domutils.getAttributeValue,
	    checkAttrib = attributes.rules.equals,
	    trueFunc$1    = boolbase.trueFunc,
	    falseFunc$2   = boolbase.falseFunc;

	//helper methods
	function getFirstElement(elems){
		for(var i = 0; elems && i < elems.length; i++){
			if(isTag$2(elems[i])) return elems[i];
		}
	}

	function getAttribFunc(name, value){
		var data = {name: name, value: value};
		return function attribFunc(next){
			return checkAttrib(next, data);
		};
	}

	function getChildFunc(next){
		return function(elem){
			return !!getParent(elem) && next(elem);
		};
	}

	var filters = {
		contains: function(next, text){
			return function contains(elem){
				return next(elem) && getText$1(elem).indexOf(text) >= 0;
			};
		},
		icontains: function(next, text){
			var itext = text.toLowerCase();
			return function icontains(elem){
				return next(elem) &&
					getText$1(elem).toLowerCase().indexOf(itext) >= 0;
			};
		},

		//location specific methods
		"nth-child": function(next, rule){
			var func = nthCheck(rule);

			if(func === falseFunc$2) return func;
			if(func === trueFunc$1)  return getChildFunc(next);

			return function nthChild(elem){
				var siblings = getSiblings(elem);

				for(var i = 0, pos = 0; i < siblings.length; i++){
					if(isTag$2(siblings[i])){
						if(siblings[i] === elem) break;
						else pos++;
					}
				}

				return func(pos) && next(elem);
			};
		},
		"nth-last-child": function(next, rule){
			var func = nthCheck(rule);

			if(func === falseFunc$2) return func;
			if(func === trueFunc$1)  return getChildFunc(next);

			return function nthLastChild(elem){
				var siblings = getSiblings(elem);

				for(var pos = 0, i = siblings.length - 1; i >= 0; i--){
					if(isTag$2(siblings[i])){
						if(siblings[i] === elem) break;
						else pos++;
					}
				}

				return func(pos) && next(elem);
			};
		},
		"nth-of-type": function(next, rule){
			var func = nthCheck(rule);

			if(func === falseFunc$2) return func;
			if(func === trueFunc$1)  return getChildFunc(next);

			return function nthOfType(elem){
				var siblings = getSiblings(elem);

				for(var pos = 0, i = 0; i < siblings.length; i++){
					if(isTag$2(siblings[i])){
						if(siblings[i] === elem) break;
						if(getName(siblings[i]) === getName(elem)) pos++;
					}
				}

				return func(pos) && next(elem);
			};
		},
		"nth-last-of-type": function(next, rule){
			var func = nthCheck(rule);

			if(func === falseFunc$2) return func;
			if(func === trueFunc$1)  return getChildFunc(next);

			return function nthLastOfType(elem){
				var siblings = getSiblings(elem);

				for(var pos = 0, i = siblings.length - 1; i >= 0; i--){
					if(isTag$2(siblings[i])){
						if(siblings[i] === elem) break;
						if(getName(siblings[i]) === getName(elem)) pos++;
					}
				}

				return func(pos) && next(elem);
			};
		},

	    //TODO determine the actual root element
	    root: function(next){
	        return function(elem){
	            return !getParent(elem) && next(elem);
	        };
	    },

	    scope: function(next, rule, options, context){
	        if(!context || context.length === 0){
	            //equivalent to :root
	            return filters.root(next);
	        }

	        if(context.length === 1){
	            //NOTE: can't be unpacked, as :has uses this for side-effects
	            return function(elem){
	                return context[0] === elem && next(elem);
	            };
	        }

	        return function(elem){
	            return context.indexOf(elem) >= 0 && next(elem);
	        };
	    },

		//jQuery extensions (others follow as pseudos)
		checkbox: getAttribFunc("type", "checkbox"),
		file: getAttribFunc("type", "file"),
		password: getAttribFunc("type", "password"),
		radio: getAttribFunc("type", "radio"),
		reset: getAttribFunc("type", "reset"),
		image: getAttribFunc("type", "image"),
		submit: getAttribFunc("type", "submit")
	};

	//while filters are precompiled, pseudos get called when they are needed
	var pseudos = {
		empty: function(elem){
			return !getChildren(elem).some(function(elem){
				return isTag$2(elem) || elem.type === "text";
			});
		},

		"first-child": function(elem){
			return getFirstElement(getSiblings(elem)) === elem;
		},
		"last-child": function(elem){
			var siblings = getSiblings(elem);

			for(var i = siblings.length - 1; i >= 0; i--){
				if(siblings[i] === elem) return true;
				if(isTag$2(siblings[i])) break;
			}

			return false;
		},
		"first-of-type": function(elem){
			var siblings = getSiblings(elem);

			for(var i = 0; i < siblings.length; i++){
				if(isTag$2(siblings[i])){
					if(siblings[i] === elem) return true;
					if(getName(siblings[i]) === getName(elem)) break;
				}
			}

			return false;
		},
		"last-of-type": function(elem){
			var siblings = getSiblings(elem);

			for(var i = siblings.length-1; i >= 0; i--){
				if(isTag$2(siblings[i])){
					if(siblings[i] === elem) return true;
					if(getName(siblings[i]) === getName(elem)) break;
				}
			}

			return false;
		},
		"only-of-type": function(elem){
			var siblings = getSiblings(elem);

			for(var i = 0, j = siblings.length; i < j; i++){
				if(isTag$2(siblings[i])){
					if(siblings[i] === elem) continue;
					if(getName(siblings[i]) === getName(elem)) return false;
				}
			}

			return true;
		},
		"only-child": function(elem){
			var siblings = getSiblings(elem);

			for(var i = 0; i < siblings.length; i++){
				if(isTag$2(siblings[i]) && siblings[i] !== elem) return false;
			}

			return true;
		},

		//:matches(a, area, link)[href]
		link: function(elem){
			return hasAttrib$1(elem, "href");
		},
		visited: falseFunc$2, //seems to be a valid implementation
		//TODO: :any-link once the name is finalized (as an alias of :link)

		//forms
		//to consider: :target

		//:matches([selected], select:not([multiple]):not(> option[selected]) > option:first-of-type)
		selected: function(elem){
			if(hasAttrib$1(elem, "selected")) return true;
			else if(getName(elem) !== "option") return false;

			//the first <option> in a <select> is also selected
			var parent = getParent(elem);

			if(
				!parent ||
				getName(parent) !== "select" ||
				hasAttrib$1(parent, "multiple")
			) return false;

			var siblings = getChildren(parent),
				sawElem  = false;

			for(var i = 0; i < siblings.length; i++){
				if(isTag$2(siblings[i])){
					if(siblings[i] === elem){
						sawElem = true;
					} else if(!sawElem){
						return false;
					} else if(hasAttrib$1(siblings[i], "selected")){
						return false;
					}
				}
			}

			return sawElem;
		},
		//https://html.spec.whatwg.org/multipage/scripting.html#disabled-elements
		//:matches(
		//  :matches(button, input, select, textarea, menuitem, optgroup, option)[disabled],
		//  optgroup[disabled] > option),
		// fieldset[disabled] * //TODO not child of first <legend>
		//)
		disabled: function(elem){
			return hasAttrib$1(elem, "disabled");
		},
		enabled: function(elem){
			return !hasAttrib$1(elem, "disabled");
		},
		//:matches(:matches(:radio, :checkbox)[checked], :selected) (TODO menuitem)
		checked: function(elem){
			return hasAttrib$1(elem, "checked") || pseudos.selected(elem);
		},
		//:matches(input, select, textarea)[required]
		required: function(elem){
			return hasAttrib$1(elem, "required");
		},
		//:matches(input, select, textarea):not([required])
		optional: function(elem){
			return !hasAttrib$1(elem, "required");
		},

		//jQuery extensions

		//:not(:empty)
		parent: function(elem){
			return !pseudos.empty(elem);
		},
		//:matches(h1, h2, h3, h4, h5, h6)
		header: function(elem){
			var name = getName(elem);
			return name === "h1" ||
			       name === "h2" ||
			       name === "h3" ||
			       name === "h4" ||
			       name === "h5" ||
			       name === "h6";
		},

		//:matches(button, input[type=button])
		button: function(elem){
			var name = getName(elem);
			return name === "button" ||
			       name === "input" &&
			       getAttribute(elem, "type") === "button";
		},
		//:matches(input, textarea, select, button)
		input: function(elem){
			var name = getName(elem);
			return name === "input" ||
			       name === "textarea" ||
			       name === "select" ||
			       name === "button";
		},
		//input:matches(:not([type!='']), [type='text' i])
		text: function(elem){
			var attr;
			return getName(elem) === "input" && (
				!(attr = getAttribute(elem, "type")) ||
				attr.toLowerCase() === "text"
			);
		}
	};

	function verifyArgs(func, name, subselect){
		if(subselect === null){
			if(func.length > 1 && name !== "scope"){
				throw new SyntaxError("pseudo-selector :" + name + " requires an argument");
			}
		} else {
			if(func.length === 1){
				throw new SyntaxError("pseudo-selector :" + name + " doesn't have any arguments");
			}
		}
	}

	//FIXME this feels hacky
	var re_CSS3 = /^(?:(?:nth|last|first|only)-(?:child|of-type)|root|empty|(?:en|dis)abled|checked|not)$/;

	var pseudos_1 = {
		compile: function(next, data, options, context){
			var name = data.name,
				subselect = data.data;

			if(options && options.strict && !re_CSS3.test(name)){
				throw SyntaxError(":" + name + " isn't part of CSS3");
			}

			if(typeof filters[name] === "function"){
				verifyArgs(filters[name], name,  subselect);
				return filters[name](next, subselect, options, context);
			} else if(typeof pseudos[name] === "function"){
				var func = pseudos[name];
				verifyArgs(func, name, subselect);

				if(next === trueFunc$1) return func;

				return function pseudoArgs(elem){
					return func(elem, subselect) && next(elem);
				};
			} else {
				throw new SyntaxError("unmatched pseudo-class :" + name);
			}
		},
		filters: filters,
		pseudos: pseudos
	};

	var cssWhat = parse$1;

	var re_name = /^(?:\\.|[\w\-\u00b0-\uFFFF])+/,
	    re_escape = /\\([\da-f]{1,6}\s?|(\s)|.)/ig,
	    //modified version of https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L87
	    re_attr = /^\s*((?:\\.|[\w\u00b0-\uFFFF\-])+)\s*(?:(\S?)=\s*(?:(['"])([^]*?)\3|(#?(?:\\.|[\w\u00b0-\uFFFF\-])*)|)|)\s*(i)?\]/;

	var actionTypes = {
		__proto__: null,
		"undefined": "exists",
		"":  "equals",
		"~": "element",
		"^": "start",
		"$": "end",
		"*": "any",
		"!": "not",
		"|": "hyphen"
	};

	var simpleSelectors = {
		__proto__: null,
		">": "child",
		"<": "parent",
		"~": "sibling",
		"+": "adjacent"
	};

	var attribSelectors = {
		__proto__: null,
		"#": ["id", "equals"],
		".": ["class", "element"]
	};

	//pseudos, whose data-property is parsed as well
	var unpackPseudos = {
		__proto__: null,
		"has": true,
		"not": true,
		"matches": true
	};

	var stripQuotesFromPseudos = {
		__proto__: null,
		"contains": true,
		"icontains": true
	};

	var quotes = {
		__proto__: null,
		"\"": true,
		"'": true
	};

	//unescape function taken from https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L139
	function funescape( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	}

	function unescapeCSS(str){
		return str.replace(re_escape, funescape);
	}

	function isWhitespace(c){
		return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
	}

	function parse$1(selector, options){
		var subselects = [];

		selector = parseSelector(subselects, selector + "", options);

		if(selector !== ""){
			throw new SyntaxError("Unmatched selector: " + selector);
		}

		return subselects;
	}

	function parseSelector(subselects, selector, options){
		var tokens = [],
			sawWS = false,
			data, firstChar, name, quot;

		function getName(){
			var sub = selector.match(re_name)[0];
			selector = selector.substr(sub.length);
			return unescapeCSS(sub);
		}

		function stripWhitespace(start){
			while(isWhitespace(selector.charAt(start))) start++;
			selector = selector.substr(start);
		}

		function isEscaped(pos) {
			var slashCount = 0;

			while (selector.charAt(--pos) === "\\") slashCount++;
			return (slashCount & 1) === 1;
		}

		stripWhitespace(0);

		while(selector !== ""){
			firstChar = selector.charAt(0);

			if(isWhitespace(firstChar)){
				sawWS = true;
				stripWhitespace(1);
			} else if(firstChar in simpleSelectors){
				tokens.push({type: simpleSelectors[firstChar]});
				sawWS = false;

				stripWhitespace(1);
			} else if(firstChar === ","){
				if(tokens.length === 0){
					throw new SyntaxError("empty sub-selector");
				}
				subselects.push(tokens);
				tokens = [];
				sawWS = false;
				stripWhitespace(1);
			} else {
				if(sawWS){
					if(tokens.length > 0){
						tokens.push({type: "descendant"});
					}
					sawWS = false;
				}

				if(firstChar === "*"){
					selector = selector.substr(1);
					tokens.push({type: "universal"});
				} else if(firstChar in attribSelectors){
					selector = selector.substr(1);
					tokens.push({
						type: "attribute",
						name: attribSelectors[firstChar][0],
						action: attribSelectors[firstChar][1],
						value: getName(),
						ignoreCase: false
					});
				} else if(firstChar === "["){
					selector = selector.substr(1);
					data = selector.match(re_attr);
					if(!data){
						throw new SyntaxError("Malformed attribute selector: " + selector);
					}
					selector = selector.substr(data[0].length);
					name = unescapeCSS(data[1]);

					if(
						!options || (
							"lowerCaseAttributeNames" in options ?
								options.lowerCaseAttributeNames :
								!options.xmlMode
						)
					){
						name = name.toLowerCase();
					}

					tokens.push({
						type: "attribute",
						name: name,
						action: actionTypes[data[2]],
						value: unescapeCSS(data[4] || data[5] || ""),
						ignoreCase: !!data[6]
					});

				} else if(firstChar === ":"){
					if(selector.charAt(1) === ":"){
						selector = selector.substr(2);
						tokens.push({type: "pseudo-element", name: getName().toLowerCase()});
						continue;
					}

					selector = selector.substr(1);

					name = getName().toLowerCase();
					data = null;

					if(selector.charAt(0) === "("){
						if(name in unpackPseudos){
							quot = selector.charAt(1);
							var quoted = quot in quotes;

							selector = selector.substr(quoted + 1);

							data = [];
							selector = parseSelector(data, selector, options);

							if(quoted){
								if(selector.charAt(0) !== quot){
									throw new SyntaxError("unmatched quotes in :" + name);
								} else {
									selector = selector.substr(1);
								}
							}

							if(selector.charAt(0) !== ")"){
								throw new SyntaxError("missing closing parenthesis in :" + name + " " + selector);
							}

							selector = selector.substr(1);
						} else {
							var pos = 1, counter = 1;

							for(; counter > 0 && pos < selector.length; pos++){
								if(selector.charAt(pos) === "(" && !isEscaped(pos)) counter++;
								else if(selector.charAt(pos) === ")" && !isEscaped(pos)) counter--;
							}

							if(counter){
								throw new SyntaxError("parenthesis not matched");
							}

							data = selector.substr(1, pos - 2);
							selector = selector.substr(pos);

							if(name in stripQuotesFromPseudos){
								quot = data.charAt(0);

								if(quot === data.slice(-1) && quot in quotes){
									data = data.slice(1, -1);
								}

								data = unescapeCSS(data);
							}
						}
					}

					tokens.push({type: "pseudo", name: name, data: data});
				} else if(re_name.test(selector)){
					name = getName();

					if(!options || ("lowerCaseTags" in options ? options.lowerCaseTags : !options.xmlMode)){
						name = name.toLowerCase();
					}

					tokens.push({type: "tag", name: name});
				} else {
					if(tokens.length && tokens[tokens.length - 1].type === "descendant"){
						tokens.pop();
					}
					addToken(subselects, tokens);
					return selector;
				}
			}
		}

		addToken(subselects, tokens);

		return selector;
	}

	function addToken(subselects, tokens){
		if(subselects.length > 0 && tokens.length === 0){
			throw new SyntaxError("empty sub-selector");
		}

		subselects.push(tokens);
	}

	var isTag$3       = domutils.isTag,
	    getParent$1   = domutils.getParent,
	    getChildren$1 = domutils.getChildren,
	    getSiblings$1 = domutils.getSiblings,
	    getName$1     = domutils.getName;

	/*
		all available rules
	*/
	var general = {
		__proto__: null,

		attribute: attributes.compile,
		pseudo: pseudos_1.compile,

		//tags
		tag: function(next, data){
			var name = data.name;
			return function tag(elem){
				return getName$1(elem) === name && next(elem);
			};
		},

		//traversal
		descendant: function(next, rule, options, context, acceptSelf){
			return function descendant(elem){

				if (acceptSelf && next(elem)) return true;

				var found = false;

				while(!found && (elem = getParent$1(elem))){
					found = next(elem);
				}

				return found;
			};
		},
		parent: function(next, data, options){
			if(options && options.strict) throw SyntaxError("Parent selector isn't part of CSS3");

			return function parent(elem){
				return getChildren$1(elem).some(test);
			};

			function test(elem){
				return isTag$3(elem) && next(elem);
			}
		},
		child: function(next){
			return function child(elem){
				var parent = getParent$1(elem);
				return !!parent && next(parent);
			};
		},
		sibling: function(next){
			return function sibling(elem){
				var siblings = getSiblings$1(elem);

				for(var i = 0; i < siblings.length; i++){
					if(isTag$3(siblings[i])){
						if(siblings[i] === elem) break;
						if(next(siblings[i])) return true;
					}
				}

				return false;
			};
		},
		adjacent: function(next){
			return function adjacent(elem){
				var siblings = getSiblings$1(elem),
				    lastElement;

				for(var i = 0; i < siblings.length; i++){
					if(isTag$3(siblings[i])){
						if(siblings[i] === elem) break;
						lastElement = siblings[i];
					}
				}

				return !!lastElement && next(lastElement);
			};
		},
		universal: function(next){
			return next;
		}
	};

	var universal = 50;
	var tag = 30;
	var attribute = 1;
	var pseudo = 0;
	var descendant = -1;
	var child = -1;
	var parent = -1;
	var sibling = -1;
	var adjacent = -1;
	var procedure = {
		universal: universal,
		tag: tag,
		attribute: attribute,
		pseudo: pseudo,
		descendant: descendant,
		child: child,
		parent: parent,
		sibling: sibling,
		adjacent: adjacent
	};

	var procedure$1 = {
		__proto__: null,
		universal: universal,
		tag: tag,
		attribute: attribute,
		pseudo: pseudo,
		descendant: descendant,
		child: child,
		parent: parent,
		sibling: sibling,
		adjacent: adjacent,
		'default': procedure
	};

	var procedure$2 = getCjsExportFromNamespace(procedure$1);

	var sort = sortByProcedure;

	/*
		sort the parts of the passed selector,
		as there is potential for optimization
		(some types of selectors are faster than others)
	*/



	var attributes$1 = {
		__proto__: null,
		exists: 10,
		equals: 8,
		not: 7,
		start: 6,
		end: 6,
		any: 5,
		hyphen: 4,
		element: 4
	};

	function sortByProcedure(arr){
		var procs = arr.map(getProcedure);
		for(var i = 1; i < arr.length; i++){
			var procNew = procs[i];

			if(procNew < 0) continue;

			for(var j = i - 1; j >= 0 && procNew < procs[j]; j--){
				var token = arr[j + 1];
				arr[j + 1] = arr[j];
				arr[j] = token;
				procs[j + 1] = procs[j];
				procs[j] = procNew;
			}
		}
	}

	function getProcedure(token){
		var proc = procedure$2[token.type];

		if(proc === procedure$2.attribute){
			proc = attributes$1[token.action];

			if(proc === attributes$1.equals && token.name === "id"){
				//prefer ID selectors (eg. #ID)
				proc = 9;
			}

			if(token.ignoreCase){
				//ignoreCase adds some overhead, prefer "normal" token
				//this is a binary operation, to ensure it's still an int
				proc >>= 1;
			}
		} else if(proc === procedure$2.pseudo){
			if(!token.data){
				proc = 3;
			} else if(token.name === "has" || token.name === "contains"){
				proc = 0; //expensive in any case
			} else if(token.name === "matches" || token.name === "not"){
				proc = 0;
				for(var i = 0; i < token.data.length; i++){
					//TODO better handling of complex selectors
					if(token.data[i].length !== 1) continue;
					var cur = getProcedure(token.data[i][0]);
					//avoid executing :has or :contains
					if(cur === 0){
						proc = 0;
						break;
					}
					if(cur > proc) proc = cur;
				}
				if(token.data.length > 1 && proc > 0) proc -= 1;
			} else {
				proc = 1;
			}
		}
		return proc;
	}

	/*
		compiles a selector to an executable function
	*/

	var compile_1$2 = compile$1;
	var compileUnsafe_1 = compileUnsafe;
	var compileToken_1 = compileToken;

	var isTag$4       = domutils.isTag,
	    trueFunc$2    = boolbase.trueFunc,
	    falseFunc$3   = boolbase.falseFunc;

	function compile$1(selector, options, context){
		var next = compileUnsafe(selector, options, context);
		return wrap(next);
	}

	function wrap(next){
		return function base(elem){
			return isTag$4(elem) && next(elem);
		};
	}

	function compileUnsafe(selector, options, context){
		var token = cssWhat(selector, options);
		return compileToken(token, options, context);
	}

	function includesScopePseudo(t){
	    return t.type === "pseudo" && (
	        t.name === "scope" || (
	            Array.isArray(t.data) &&
	            t.data.some(function(data){
	                return data.some(includesScopePseudo);
	            })
	        )
	    );
	}

	var DESCENDANT_TOKEN = {type: "descendant"},
	    SCOPE_TOKEN = {type: "pseudo", name: "scope"},
	    PLACEHOLDER_ELEMENT = {},
	    getParent$2 = domutils.getParent;

	//CSS 4 Spec (Draft): 3.3.1. Absolutizing a Scope-relative Selector
	//http://www.w3.org/TR/selectors4/#absolutizing
	function absolutize(token, context){
	    //TODO better check if context is document
	    var hasContext = !!context && !!context.length && context.every(function(e){
	        return e === PLACEHOLDER_ELEMENT || !!getParent$2(e);
	    });


	    token.forEach(function(t){
	        if(t.length > 0 && isTraversal(t[0]) && t[0].type !== "descendant"); else if(hasContext && !includesScopePseudo(t)){
	            t.unshift(DESCENDANT_TOKEN);
	        } else {
	            return;
	        }

	        t.unshift(SCOPE_TOKEN);
	    });
	}

	function compileToken(token, options, context){
	    token = token.filter(function(t){ return t.length > 0; });

		token.forEach(sort);

		var isArrayContext = Array.isArray(context);

	    context = (options && options.context) || context;

	    if(context && !isArrayContext) context = [context];

	    absolutize(token, context);

		return token
			.map(function(rules){ return compileRules(rules, options, context, isArrayContext); })
			.reduce(reduceRules, falseFunc$3);
	}

	function isTraversal(t){
		return procedure$2[t.type] < 0;
	}

	function compileRules(rules, options, context, isArrayContext){
		var acceptSelf = (isArrayContext && rules[0].name === "scope" && rules[1].type === "descendant");
		return rules.reduce(function(func, rule, index){
			if(func === falseFunc$3) return func;
			return general[rule.type](func, rule, options, context, acceptSelf && index === 1);
		}, options && options.rootFunc || trueFunc$2);
	}

	function reduceRules(a, b){
		if(b === falseFunc$3 || a === trueFunc$2){
			return a;
		}
		if(a === falseFunc$3 || b === trueFunc$2){
			return b;
		}

		return function combine(elem){
			return a(elem) || b(elem);
		};
	}

	//:not, :has and :matches have to compile selectors
	//doing this in lib/pseudos.js would lead to circular dependencies,
	//so we add them here

	var filters$1     = pseudos_1.filters,
	    existsOne$1   = domutils.existsOne,
	    isTag$4       = domutils.isTag,
	    getChildren$2 = domutils.getChildren;


	function containsTraversal(t){
		return t.some(isTraversal);
	}

	filters$1.not = function(next, token, options, context){
		var opts = {
		    	xmlMode: !!(options && options.xmlMode),
		    	strict: !!(options && options.strict)
		    };

		if(opts.strict){
			if(token.length > 1 || token.some(containsTraversal)){
				throw new SyntaxError("complex selectors in :not aren't allowed in strict mode");
			}
		}

	    var func = compileToken(token, opts, context);

		if(func === falseFunc$3) return next;
		if(func === trueFunc$2)  return falseFunc$3;

		return function(elem){
			return !func(elem) && next(elem);
		};
	};

	filters$1.has = function(next, token, options){
		var opts = {
			xmlMode: !!(options && options.xmlMode),
			strict: !!(options && options.strict)
		};

	    //FIXME: Uses an array as a pointer to the current element (side effects)
	    var context = token.some(containsTraversal) ? [PLACEHOLDER_ELEMENT] : null;

		var func = compileToken(token, opts, context);

		if(func === falseFunc$3) return falseFunc$3;
		if(func === trueFunc$2)  return function(elem){
				return getChildren$2(elem).some(isTag$4) && next(elem);
			};

		func = wrap(func);

	    if(context){
	        return function has(elem){
			return next(elem) && (
	                (context[0] = elem), existsOne$1(func, getChildren$2(elem))
	            );
		};
	    }

	    return function has(elem){
			return next(elem) && existsOne$1(func, getChildren$2(elem));
		};
	};

	filters$1.matches = function(next, token, options, context){
		var opts = {
			xmlMode: !!(options && options.xmlMode),
			strict: !!(options && options.strict),
			rootFunc: next
		};

		return compileToken(token, opts, context);
	};
	compile_1$2.compileUnsafe = compileUnsafe_1;
	compile_1$2.compileToken = compileToken_1;

	var cssSelect = CSSselect;

	var findOne$1       = domutils.findOne,
	    findAll$1       = domutils.findAll,
	    getChildren$3   = domutils.getChildren,
	    removeSubsets = domutils.removeSubsets,
	    falseFunc$4     = boolbase.falseFunc,
	    compileUnsafe$1 = compile_1$2.compileUnsafe,
	    compileToken$1  = compile_1$2.compileToken;

	function getSelectorFunc(searchFunc){
		return function select(query, elems, options){
	        if(typeof query !== "function") query = compileUnsafe$1(query, options, elems);
	        if(!Array.isArray(elems)) elems = getChildren$3(elems);
			else elems = removeSubsets(elems);
			return searchFunc(query, elems);
		};
	}

	var selectAll = getSelectorFunc(function selectAll(query, elems){
		return (query === falseFunc$4 || !elems || elems.length === 0) ? [] : findAll$1(query, elems);
	});

	var selectOne = getSelectorFunc(function selectOne(query, elems){
		return (query === falseFunc$4 || !elems || elems.length === 0) ? null : findOne$1(query, elems);
	});

	function is(elem, query, options){
		return (typeof query === "function" ? query : compile_1$2(query, options))(elem);
	}

	/*
		the exported interface
	*/
	function CSSselect(query, elems, options){
		return selectAll(query, elems, options);
	}

	CSSselect.compile = compile_1$2;
	CSSselect.filters = pseudos_1.filters;
	CSSselect.pseudos = pseudos_1.pseudos;

	CSSselect.selectAll = selectAll;
	CSSselect.selectOne = selectOne;

	CSSselect.is = is;

	//legacy methods (might be removed)
	CSSselect.parse = compile_1$2;
	CSSselect.iterate = selectAll;

	//hooks
	CSSselect._compileUnsafe = compileUnsafe$1;
	CSSselect._compileToken = compileToken$1;

	/**
	 * Copyright 2018 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
	 * use this file except in compliance with the License. You may obtain a copy of
	 * the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
	 * License for the specific language governing permissions and limitations under
	 * the License.
	 */

	const treeAdapter = require('parse5-htmlparser2-tree-adapter');

	const PARSE5_OPTS = {
	  treeAdapter
	};
	/**
	 * Parse HTML into a mutable, serializable DOM Document.
	 * The DOM implementation is an htmlparser2 DOM enhanced with basic DOM mutation methods.
	 * @param {String} html   HTML to parse into a Document instance
	 */

	function createDocument(html) {
	  const document = parse5.parse(html, PARSE5_OPTS);
	  defineProperties(document, DocumentExtensions); // Extend Element.prototype with DOM manipulation methods.

	  const scratch = document.createElement('div'); // Get a reference to the base Node class - used by createTextNode()

	  document.$$Node = scratch.constructor;
	  const elementProto = Object.getPrototypeOf(scratch);
	  defineProperties(elementProto, ElementExtensions);
	  elementProto.ownerDocument = document;
	  return document;
	}
	/**
	 * Serialize a Document to an HTML String
	 * @param {Document} document   A Document, such as one created via `createDocument()`
	 */

	function serializeDocument(document) {
	  return parse5.serialize(document, PARSE5_OPTS);
	}
	/**
	 * Methods and descriptors to mix into Element.prototype
	 */

	const ElementExtensions = {
	  /** @extends htmlparser2.Element.prototype */
	  nodeName: {
	    get() {
	      return this.tagName.toUpperCase();
	    }

	  },
	  id: reflectedProperty('id'),
	  className: reflectedProperty('class'),

	  insertBefore(child, referenceNode) {
	    if (!referenceNode) return this.appendChild(child);
	    treeAdapter.insertBefore(this, child, referenceNode);
	    return child;
	  },

	  appendChild(child) {
	    treeAdapter.appendChild(this, child);
	    return child;
	  },

	  removeChild(child) {
	    treeAdapter.detachNode(child);
	  },

	  remove() {
	    treeAdapter.detachNode(this);
	  },

	  textContent: {
	    get() {
	      return getText$2(this);
	    },

	    set(text) {
	      this.children = [];
	      treeAdapter.insertText(this, text);
	    }

	  },

	  setAttribute(name, value) {
	    if (this.attribs == null) this.attribs = {};
	    if (value == null) value = '';
	    this.attribs[name] = value;
	  },

	  removeAttribute(name) {
	    if (this.attribs != null) {
	      delete this.attribs[name];
	    }
	  },

	  getAttribute(name) {
	    return this.attribs != null && this.attribs[name];
	  },

	  hasAttribute(name) {
	    return this.attribs != null && this.attribs[name] != null;
	  },

	  getAttributeNode(name) {
	    const value = this.getAttribute(name);
	    if (value != null) return {
	      specified: true,
	      value
	    };
	  }

	};
	/**
	 * Methods and descriptors to mix into the global document instance
	 * @private
	 */

	const DocumentExtensions = {
	  /** @extends htmlparser2.Document.prototype */
	  // document is just an Element in htmlparser2, giving it a nodeType of ELEMENT_NODE.
	  // TODO: verify if these are needed for css-select
	  nodeType: {
	    get() {
	      return 9;
	    }

	  },
	  contentType: {
	    get() {
	      return 'text/html';
	    }

	  },
	  nodeName: {
	    get() {
	      return '#document';
	    }

	  },
	  documentElement: {
	    get() {
	      // Find the first <html> element within the document
	      return this.childNodes.filter(child => String(child.tagName).toLowerCase() === 'html');
	    }

	  },
	  compatMode: {
	    get() {
	      const compatMode = {
	        'no-quirks': 'CSS1Compat',
	        quirks: 'BackCompat',
	        'limited-quirks': 'CSS1Compat'
	      };
	      return compatMode[treeAdapter.getDocumentMode(this)];
	    }

	  },
	  body: {
	    get() {
	      return this.querySelector('body');
	    }

	  },

	  createElement(name) {
	    return treeAdapter.createElement(name, null, []);
	  },

	  createTextNode(text) {
	    // there is no dedicated createTextNode equivalent exposed in htmlparser2's DOM
	    const Node = this.$$Node;
	    return new Node({
	      type: 'text',
	      data: text,
	      parent: null,
	      prev: null,
	      next: null
	    });
	  },

	  querySelector(sel) {
	    return cssSelect.selectOne(sel, this.documentElement);
	  },

	  querySelectorAll(sel) {
	    if (sel === ':root') {
	      return this;
	    }

	    return cssSelect(sel, this.documentElement);
	  }

	};
	/**
	 * Essentially `Object.defineProperties()`, except function values are assigned as value descriptors for convenience.
	 * @private
	 */

	function defineProperties(obj, properties) {
	  for (const i in properties) {
	    const value = properties[i];
	    Object.defineProperty(obj, i, typeof value === 'function' ? {
	      value
	    } : value);
	  }
	}
	/**
	 * Create a property descriptor defining a getter/setter pair alias for a named attribute.
	 * @private
	 */


	function reflectedProperty(attributeName) {
	  return {
	    get() {
	      return this.getAttribute(attributeName);
	    },

	    set(value) {
	      this.setAttribute(attributeName, value);
	    }

	  };
	}
	/**
	 * Helper to get the text content of a node
	 * https://github.com/fb55/domutils/blob/master/src/stringify.ts#L21
	 * @private
	 */


	function getText$2(node) {
	  if (Array.isArray(node)) return node.map(getText$2).join('');
	  if (treeAdapter.isElementNode(node)) return node.name === 'br' ? '\n' : getText$2(node.children);
	  if (treeAdapter.isTextNode(node)) return node.data;
	  return '';
	}

	/**
	 * Copyright 2018 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
	 * use this file except in compliance with the License. You may obtain a copy of
	 * the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
	 * License for the specific language governing permissions and limitations under
	 * the License.
	 */
	/**
	 * Parse a textual CSS Stylesheet into a Stylesheet instance.
	 * Stylesheet is a mutable ReworkCSS AST with format similar to CSSOM.
	 * @see https://github.com/reworkcss/css
	 * @private
	 * @param {String} stylesheet
	 * @returns {css.Stylesheet} ast
	 */

	function parseStylesheet(stylesheet) {
	  return css.parse(stylesheet);
	}
	/**
	 * Serialize a ReworkCSS Stylesheet to a String of CSS.
	 * @private
	 * @param {css.Stylesheet} ast          A Stylesheet to serialize, such as one returned from `parseStylesheet()`
	 * @param {Object} options              Options to pass to `css.stringify()`
	 * @param {Boolean} [options.compress]  Compress CSS output (removes comments, whitespace, etc)
	 */

	function serializeStylesheet(ast, options) {
	  return css.stringify(ast, options);
	}
	/**
	 * Converts a walkStyleRules() iterator to mark nodes with `.$$remove=true` instead of actually removing them.
	 * This means they can be removed in a second pass, allowing the first pass to be nondestructive (eg: to preserve mirrored sheets).
	 * @private
	 * @param {Function} iterator   Invoked on each node in the tree. Return `false` to remove that node.
	 * @returns {(rule) => void} nonDestructiveIterator
	 */

	function markOnly(predicate) {
	  return rule => {
	    const sel = rule.selectors;

	    if (predicate(rule) === false) {
	      rule.$$remove = true;
	    }

	    rule.$$markedSelectors = rule.selectors;

	    if (rule._other) {
	      rule._other.$$markedSelectors = rule._other.selectors;
	    }

	    rule.selectors = sel;
	  };
	}
	/**
	 * Apply filtered selectors to a rule from a previous markOnly run.
	 * @private
	 * @param {css.Rule} rule The Rule to apply marked selectors to (if they exist).
	*/

	function applyMarkedSelectors(rule) {
	  if (rule.$$markedSelectors) {
	    rule.selectors = rule.$$markedSelectors;
	  }

	  if (rule._other) {
	    applyMarkedSelectors(rule._other);
	  }
	}
	/**
	 * Recursively walk all rules in a stylesheet.
	 * @private
	 * @param {css.Rule} node       A Stylesheet or Rule to descend into.
	 * @param {Function} iterator   Invoked on each node in the tree. Return `false` to remove that node.
	 */

	function walkStyleRules(node, iterator) {
	  if (node.stylesheet) return walkStyleRules(node.stylesheet, iterator);
	  node.rules = node.rules.filter(rule => {
	    if (rule.rules) {
	      walkStyleRules(rule, iterator);
	    }

	    rule._other = undefined;
	    rule.filterSelectors = filterSelectors;
	    return iterator(rule) !== false;
	  });
	}
	/**
	 * Recursively walk all rules in two identical stylesheets, filtering nodes into one or the other based on a predicate.
	 * @private
	 * @param {css.Rule} node       A Stylesheet or Rule to descend into.
	 * @param {css.Rule} node2      A second tree identical to `node`
	 * @param {Function} iterator   Invoked on each node in the tree. Return `false` to remove that node from the first tree, true to remove it from the second.
	 */

	function walkStyleRulesWithReverseMirror(node, node2, iterator) {
	  if (node2 === null) return walkStyleRules(node, iterator);
	  if (node.stylesheet) return walkStyleRulesWithReverseMirror(node.stylesheet, node2.stylesheet, iterator);
	  [node.rules, node2.rules] = splitFilter(node.rules, node2.rules, (rule, index, rules, rules2) => {
	    const rule2 = rules2[index];

	    if (rule.rules) {
	      walkStyleRulesWithReverseMirror(rule, rule2, iterator);
	    }

	    rule._other = rule2;
	    rule.filterSelectors = filterSelectors;
	    return iterator(rule) !== false;
	  });
	} // Like [].filter(), but applies the opposite filtering result to a second copy of the Array without a second pass.
	// This is just a quicker version of generating the compliment of the set returned from a filter operation.

	function splitFilter(a, b, predicate) {
	  const aOut = [];
	  const bOut = [];

	  for (let index = 0; index < a.length; index++) {
	    if (predicate(a[index], index, a, b)) {
	      aOut.push(a[index]);
	    } else {
	      bOut.push(a[index]);
	    }
	  }

	  return [aOut, bOut];
	} // can be invoked on a style rule to subset its selectors (with reverse mirroring)


	function filterSelectors(predicate) {
	  if (this._other) {
	    const [a, b] = splitFilter(this.selectors, this._other.selectors, predicate);
	    this.selectors = a;
	    this._other.selectors = b;
	  } else {
	    this.selectors = this.selectors.filter(predicate);
	  }
	}

	const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];
	const defaultLogger = {
	  trace(msg) {
	    console.trace(msg);
	  },

	  debug(msg) {
	    console.debug(msg);
	  },

	  warn(msg) {
	    console.warn(chalk.yellow(msg));
	  },

	  error(msg) {
	    console.error(chalk.bold.red(msg));
	  },

	  info(msg) {
	    console.info(chalk.bold.blue(msg));
	  },

	  silent() {}

	};
	function createLogger(logLevel) {
	  const logLevelIdx = LOG_LEVELS.indexOf(logLevel);
	  return LOG_LEVELS.reduce((logger, type, index) => {
	    if (index >= logLevelIdx) {
	      logger[type] = defaultLogger[type];
	    } else {
	      logger[type] = defaultLogger.silent;
	    }

	    return logger;
	  }, {});
	}

	/**
	 * Copyright 2018 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
	 * use this file except in compliance with the License. You may obtain a copy of
	 * the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
	 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
	 * License for the specific language governing permissions and limitations under
	 * the License.
	 */
	/**
	 * The mechanism to use for lazy-loading stylesheets.
	 * Note: <kbd>JS</kbd> indicates a strategy requiring JavaScript (falls back to `<noscript>` unless disabled).
	 *
	 * - **default:** Move stylesheet links to the end of the document and insert preload meta tags in their place.
	 * - **"body":** Move all external stylesheet links to the end of the document.
	 * - **"media":** Load stylesheets asynchronously by adding `media="not x"` and removing once loaded. <kbd>JS</kbd>
	 * - **"swap":** Convert stylesheet links to preloads that swap to `rel="stylesheet"` once loaded ([details](https://www.filamentgroup.com/lab/load-css-simpler/#the-code)). <kbd>JS</kbd>
	 * - **"swap-high":** Use `<link rel="alternate stylesheet preload">` and swap to `rel="stylesheet"` once loaded ([details](http://filamentgroup.github.io/loadCSS/test/new-high.html)). <kbd>JS</kbd>
	 * - **"js":** Inject an asynchronous CSS loader similar to [LoadCSS](https://github.com/filamentgroup/loadCSS) and use it to load stylesheets. <kbd>JS</kbd>
	 * - **"js-lazy":** Like `"js"`, but the stylesheet is disabled until fully loaded.
	 * @typedef {(default|'body'|'media'|'swap'|'swap-high'|'js'|'js-lazy')} PreloadStrategy
	 * @public
	 */

	/**
	 * Controls which keyframes rules are inlined.
	 *
	 * - **"critical":** _(default)_ inline keyframes rules that are used by the critical CSS.
	 * - **"all":** Inline all keyframes rules.
	 * - **"none":** Remove all keyframes rules.
	 * @typedef {('critical'|'all'|'none')} KeyframeStrategy
	 * @private
	 * @property {String} keyframes     Which {@link KeyframeStrategy keyframe strategy} to use (default: `critical`)_
	 */

	/**
	 * Controls log level of the plugin. Specifies the level the logger should use. A logger will
	 * not produce output for any log level beneath the specified level. Available levels and order
	 * are:
	 *
	 * - **"info"** _(default)_
	 * - **"warn"**
	 * - **"error"**
	 * - **"trace"**
	 * - **"debug"**
	 * - **"silent"**
	 * @typedef {('info'|'warn'|'error'|'trace'|'debug'|'silent')} LogLevel
	 * @public
	 */

	/**
	 * Custom logger interface:
	 * @typedef {object} Logger
	 * @public
	 * @property {function(String)} trace - Prints a trace message
	 * @property {function(String)} debug - Prints a debug message
	 * @property {function(String)} info - Prints an information message
	 * @property {function(String)} warn - Prints a warning message
	 * @property {function(String)} error - Prints an error message
	 */

	/**
	 * All optional. Pass them to `new Critters({ ... })`.
	 * @public
	 * @typedef Options
	 * @property {String} path     Base path location of the CSS files _(default: `''`)_
	 * @property {String} publicPath     Public path of the CSS resources. This prefix is removed from the href _(default: `''`)_
	 * @property {Boolean} external     Inline styles from external stylesheets _(default: `true`)_
	 * @property {Number} inlineThreshold Inline external stylesheets smaller than a given size _(default: `0`)_
	 * @property {Number} minimumExternalSize If the non-critical external stylesheet would be below this size, just inline it _(default: `0`)_
	 * @property {Boolean} pruneSource  Remove inlined rules from the external stylesheet _(default: `false`)_
	 * @property {Boolean} mergeStylesheets Merged inlined stylesheets into a single <style> tag _(default: `true`)_
	 * @property {String[]} additionalStylesheets Glob for matching other stylesheets to be used while looking for critical CSS _(default: ``)_.
	 * @property {String} preload       Which {@link PreloadStrategy preload strategy} to use
	 * @property {Boolean} noscriptFallback Add `<noscript>` fallback to JS-based strategies
	 * @property {Boolean} inlineFonts  Inline critical font-face rules _(default: `false`)_
	 * @property {Boolean} preloadFonts Preloads critical fonts _(default: `true`)_
	 * @property {Boolean} fonts        Shorthand for setting `inlineFonts`+`preloadFonts`
	 *  - Values:
	 *  - `true` to inline critical font-face rules and preload the fonts
	 *  - `false` to don't inline any font-face rules and don't preload fonts
	 * @property {String} keyframes     Controls which keyframes rules are inlined.
	 *  - Values:
	 *  - `"critical"`: _(default)_ inline keyframes rules used by the critical CSS
	 *  - `"all"` inline all keyframes rules
	 *  - `"none"` remove all keyframes rules
	 * @property {Boolean} compress     Compress resulting critical CSS _(default: `true`)_
	 * @property {String} logLevel      Controls {@link LogLevel log level} of the plugin _(default: `"info"`)_
	 * @property {object} logger        Provide a custom logger interface {@link Logger logger}
	 */

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

	class Critters {
	  /** @private */
	  constructor(options) {
	    this.options = Object.assign({
	      logLevel: 'info',
	      path: '',
	      publicPath: '',
	      reduceInlineStyles: true,
	      pruneSource: false,
	      additionalStylesheets: []
	    }, options || {});
	    this.urlFilter = this.options.filter;

	    if (this.urlFilter instanceof RegExp) {
	      this.urlFilter = this.urlFilter.test.bind(this.urlFilter);
	    }

	    this.logger = this.options.logger || createLogger(this.options.logLevel);
	  }
	  /**
	   * Read the contents of a file from the specified filesystem or disk
	   */


	  readFile(filename) {
	    const fs = this.fs;
	    return new Promise((resolve, reject) => {
	      const callback = (err, data) => {
	        if (err) reject(err);else resolve(data);
	      };

	      if (fs && fs.readFile) {
	        fs.readFile(filename, callback);
	      } else {
	        require('fs').readFile(filename, 'utf8', callback);
	      }
	    });
	  }
	  /**
	   * Apply critical CSS processing to the html
	   */


	  process(html) {
	    try {
	      const _this = this;

	      function _temp4() {
	        // go through all the style tags in the document and reduce them to only critical CSS
	        const styles = _this.getAffectedStyleTags(document);

	        return Promise.resolve(Promise.all(styles.map(style => _this.processStyle(style, document)))).then(function () {
	          function _temp2() {
	            // serialize the document back to HTML and we're done
	            const output = serializeDocument(document);
	            const end = process.hrtime.bigint();

	            _this.logger.info('Time ' + parseFloat(end - start) / 1000000.0);

	            return output;
	          }

	          const _temp = function () {
	            if (_this.options.mergeStylesheets !== false && styles.length !== 0) {
	              return Promise.resolve(_this.mergeStylesheets(document)).then(function () {});
	            }
	          }();

	          return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
	        });
	      }

	      const start = process.hrtime.bigint(); // Parse the generated HTML in a DOM we can mutate

	      const document = createDocument(html);

	      if (_this.options.additionalStylesheets.length > 0) {
	        _this.embedAdditionalStylesheet(document);
	      } // `external:false` skips processing of external sheets


	      const _temp3 = function () {
	        if (_this.options.external !== false) {
	          const externalSheets = [].slice.call(document.querySelectorAll('link[rel="stylesheet"]'));
	          return Promise.resolve(Promise.all(externalSheets.map(link => _this.embedLinkedStylesheet(link, document)))).then(function () {});
	        }
	      }();

	      return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3));
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }
	  /**
	   * Get the style tags that need processing
	   */


	  getAffectedStyleTags(document) {
	    const styles = [].slice.call(document.querySelectorAll('style')); // `inline:false` skips processing of inline stylesheets

	    if (this.options.reduceInlineStyles === false) {
	      return styles.filter(style => style.$$external);
	    }

	    return styles;
	  }

	  mergeStylesheets(document) {
	    try {
	      const _this2 = this;

	      const styles = _this2.getAffectedStyleTags(document);

	      if (styles.length === 0) {
	        _this2.logger.warn('Merging inline stylesheets into a single <style> tag skipped, no inline stylesheets to merge');

	        return Promise.resolve();
	      }

	      const first = styles[0];
	      let sheet = first.textContent;

	      for (let i = 1; i < styles.length; i++) {
	        const node = styles[i];
	        sheet += node.textContent;
	        node.remove();
	      }

	      first.textContent = sheet;
	      return Promise.resolve();
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }
	  /**
	   * Given href, find the corresponding CSS asset
	   */


	  getCssAsset(href) {
	    try {
	      const _this3 = this;

	      const outputPath = _this3.options.path;
	      const publicPath = _this3.options.publicPath; // CHECK - the output path
	      // path on disk (with output.publicPath removed)

	      let normalizedPath = href.replace(/^\//, '');
	      const pathPrefix = (publicPath || '').replace(/(^\/|\/$)/g, '') + '/';

	      if (normalizedPath.indexOf(pathPrefix) === 0) {
	        normalizedPath = normalizedPath.substring(pathPrefix.length).replace(/^\//, '');
	      }

	      const filename = path.resolve(outputPath, normalizedPath);
	      let sheet;

	      const _temp5 = _catch(function () {
	        return Promise.resolve(_this3.readFile(filename)).then(function (_this3$readFile) {
	          sheet = _this3$readFile;
	        });
	      }, function () {
	        _this3.logger.warn(`Unable to locate stylesheet: ${filename}`);
	      });

	      return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {
	        return sheet;
	      }) : sheet);
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }

	  checkInlineThreshold(link, style, sheet) {
	    if (this.options.inlineThreshold && sheet.length < this.options.inlineThreshold) {
	      const href = style.$$name;
	      style.$$reduce = false;
	      this.logger.info(`\u001b[32mInlined all of ${href} (${sheet.length} was below the threshold of ${this.options.inlineThreshold})\u001b[39m`);
	      link.remove();
	      return true;
	    }

	    return false;
	  }
	  /**
	   * Inline the stylesheets from options.additionalStylesheets (assuming it passes `options.filter`)
	   */


	  embedAdditionalStylesheet(document) {
	    try {
	      const _this4 = this;

	      const styleSheetsIncluded = [];
	      return Promise.resolve(Promise.all(_this4.options.additionalStylesheets.map(cssFile => {
	        if (styleSheetsIncluded.includes(cssFile)) {
	          return;
	        }

	        styleSheetsIncluded.push(cssFile);
	        const style = document.createElement('style');
	        style.$$external = true;
	        return _this4.getCssAsset(cssFile, style).then(sheet => [sheet, style]);
	      }))).then(function (sources) {
	        sources.forEach(([sheet, style]) => {
	          if (!sheet) return;
	          style.textContent = sheet;
	          document.head.appendChild(style);
	        });
	      });
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }
	  /**
	   * Inline the target stylesheet referred to by a <link rel="stylesheet"> (assuming it passes `options.filter`)
	   */


	  embedLinkedStylesheet(link, document) {
	    try {
	      const _this5 = this;

	      const href = link.getAttribute('href');
	      const media = link.getAttribute('media');
	      const preloadMode = _this5.options.preload; // skip filtered resources, or network resources if no filter is provided

	      if (_this5.urlFilter ? _this5.urlFilter(href) : !(href || '').match(/\.css$/)) {
	        return Promise.resolve();
	      } // the reduced critical CSS gets injected into a new <style> tag


	      const style = document.createElement('style');
	      style.$$external = true;
	      return Promise.resolve(_this5.getCssAsset(href, style)).then(function (sheet) {
	        if (!sheet) {
	          return;
	        }

	        style.textContent = sheet;
	        style.$$name = href;
	        style.$$links = [link];
	        link.parentNode.insertBefore(style, link);

	        if (_this5.checkInlineThreshold(link, style, sheet)) {
	          return;
	        } // CSS loader is only injected for the first sheet, then this becomes an empty string


	        let cssLoaderPreamble = "function $loadcss(u,m,l){(l=document.createElement('link')).rel='stylesheet';l.href=u;document.head.appendChild(l)}";
	        const lazy = preloadMode === 'js-lazy';

	        if (lazy) {
	          cssLoaderPreamble = cssLoaderPreamble.replace('l.href', "l.media='print';l.onload=function(){l.media=m};l.href");
	        } // Allow disabling any mutation of the stylesheet link:


	        if (preloadMode === false) return;
	        let noscriptFallback = false;

	        if (preloadMode === 'body') {
	          document.body.appendChild(link);
	        } else {
	          link.setAttribute('rel', 'preload');
	          link.setAttribute('as', 'style');

	          if (preloadMode === 'js' || preloadMode === 'js-lazy') {
	            const script = document.createElement('script');
	            const js = `${cssLoaderPreamble}$loadcss(${JSON.stringify(href)}${lazy ? ',' + JSON.stringify(media || 'all') : ''})`; // script.appendChild(document.createTextNode(js));

	            script.textContent = js;
	            link.parentNode.insertBefore(script, link.nextSibling);
	            style.$$links.push(script);
	            cssLoaderPreamble = '';
	            noscriptFallback = true;
	          } else if (preloadMode === 'media') {
	            // @see https://github.com/filamentgroup/loadCSS/blob/af1106cfe0bf70147e22185afa7ead96c01dec48/src/loadCSS.js#L26
	            link.setAttribute('rel', 'stylesheet');
	            link.removeAttribute('as');
	            link.setAttribute('media', 'print');
	            link.setAttribute('onload', `this.media='${media || 'all'}'`);
	            noscriptFallback = true;
	          } else if (preloadMode === 'swap-high') {
	            // @see http://filamentgroup.github.io/loadCSS/test/new-high.html
	            link.setAttribute('rel', 'alternate stylesheet preload');
	            link.setAttribute('title', 'styles');
	            link.setAttribute('onload', `this.title='';this.rel='stylesheet'`);
	            noscriptFallback = true;
	          } else if (preloadMode === 'swap') {
	            link.setAttribute('onload', "this.rel='stylesheet'");
	            noscriptFallback = true;
	          } else {
	            const bodyLink = document.createElement('link');
	            bodyLink.setAttribute('rel', 'stylesheet');
	            if (media) bodyLink.setAttribute('media', media);
	            bodyLink.setAttribute('href', href);
	            document.body.appendChild(bodyLink);
	            style.$$links.push(bodyLink);
	          }
	        }

	        if (_this5.options.noscriptFallback !== false && noscriptFallback) {
	          const noscript = document.createElement('noscript');
	          const noscriptLink = document.createElement('link');
	          noscriptLink.setAttribute('rel', 'stylesheet');
	          noscriptLink.setAttribute('href', href);
	          if (media) noscriptLink.setAttribute('media', media);
	          noscript.appendChild(noscriptLink);
	          link.parentNode.insertBefore(noscript, link.nextSibling);
	          style.$$links.push(noscript);
	        }
	      });
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }
	  /**
	   * Prune the source CSS files
	   */


	  pruneSource(style, before, sheetInverse) {
	    // if external stylesheet would be below minimum size, just inline everything
	    const minSize = this.options.minimumExternalSize;
	    const name = style.$$name;

	    if (minSize && sheetInverse.length < minSize) {
	      this.logger.info(`\u001b[32mInlined all of ${name} (non-critical external stylesheet would have been ${sheetInverse.length}b, which was below the threshold of ${minSize})\u001b[39m`);
	      style.textContent = before; // remove any associated external resources/loaders:

	      if (style.$$links) {
	        for (const link of style.$$links) {
	          const parent = link.parentNode;
	          if (parent) parent.removeChild(link);
	        }
	      }

	      return true;
	    }

	    return false;
	  }
	  /**
	   * Parse the stylesheet within a <style> element, then reduce it to contain only rules used by the document.
	   */


	  processStyle(style, document) {
	    try {
	      const _this6 = this;

	      if (style.$$reduce === false) return Promise.resolve();
	      const name = style.$$name ? style.$$name.replace(/^\//, '') : 'inline CSS';
	      const options = _this6.options; // const document = style.ownerDocument;

	      const head = document.querySelector('head');
	      let keyframesMode = options.keyframes || 'critical'; // we also accept a boolean value for options.keyframes

	      if (keyframesMode === true) keyframesMode = 'all';
	      if (keyframesMode === false) keyframesMode = 'none';
	      let sheet = style.textContent; // store a reference to the previous serialized stylesheet for reporting stats

	      const before = sheet; // Skip empty stylesheets

	      if (!sheet) return Promise.resolve();
	      const ast = parseStylesheet(sheet);
	      const astInverse = options.pruneSource ? parseStylesheet(sheet) : null; // a string to search for font names (very loose)

	      let criticalFonts = '';
	      const failedSelectors = [];
	      const criticalKeyframeNames = []; // Walk all CSS rules, marking unused rules with `.$$remove=true` for removal in the second pass.
	      // This first pass is also used to collect font and keyframe usage used in the second pass.

	      walkStyleRules(ast, markOnly(rule => {
	        if (rule.type === 'rule') {
	          // Filter the selector list down to only those match
	          rule.filterSelectors(sel => {
	            // Strip pseudo-elements and pseudo-classes, since we only care that their associated elements exist.
	            // This means any selector for a pseudo-element or having a pseudo-class will be inlined if the rest of the selector matches.
	            if (sel === ':root' || sel.match(/^::?(before|after)$/)) {
	              return true;
	            }

	            sel = sel.replace(/(?<!\\)::?[a-z-]+(?![a-z-(])/gi, '').replace(/::?not\(\s*\)/g, '').trim();
	            if (!sel) return false;

	            try {
	              return document.querySelector(sel) != null;
	            } catch (e) {
	              failedSelectors.push(sel + ' -> ' + e.message);
	              return false;
	            }
	          }); // If there are no matched selectors, remove the rule:

	          if (rule.selectors.length === 0) {
	            return false;
	          }

	          if (rule.declarations) {
	            for (let i = 0; i < rule.declarations.length; i++) {
	              const decl = rule.declarations[i]; // detect used fonts

	              if (decl.property && decl.property.match(/\bfont(-family)?\b/i)) {
	                criticalFonts += ' ' + decl.value;
	              } // detect used keyframes


	              if (decl.property === 'animation' || decl.property === 'animation-name') {
	                // @todo: parse animation declarations and extract only the name. for now we'll do a lazy match.
	                const names = decl.value.split(/\s+/);

	                for (let j = 0; j < names.length; j++) {
	                  const name = names[j].trim();
	                  if (name) criticalKeyframeNames.push(name);
	                }
	              }
	            }
	          }
	        } // keep font rules, they're handled in the second pass:


	        if (rule.type === 'font-face') return; // If there are no remaining rules, remove the whole rule:

	        const rules = rule.rules && rule.rules.filter(rule => !rule.$$remove);
	        return !rules || rules.length !== 0;
	      }));

	      if (failedSelectors.length !== 0) {
	        _this6.logger.warn(`${failedSelectors.length} rules skipped due to selector errors:\n  ${failedSelectors.join('\n  ')}`);
	      }

	      const shouldPreloadFonts = options.fonts === true || options.preloadFonts === true;
	      const shouldInlineFonts = options.fonts !== false && options.inlineFonts === true;
	      const preloadedFonts = []; // Second pass, using data picked up from the first

	      walkStyleRulesWithReverseMirror(ast, astInverse, rule => {
	        // remove any rules marked in the first pass
	        if (rule.$$remove === true) return false;
	        applyMarkedSelectors(rule); // prune @keyframes rules

	        if (rule.type === 'keyframes') {
	          if (keyframesMode === 'none') return false;
	          if (keyframesMode === 'all') return true;
	          return criticalKeyframeNames.indexOf(rule.name) !== -1;
	        } // prune @font-face rules


	        if (rule.type === 'font-face') {
	          let family, src;

	          for (let i = 0; i < rule.declarations.length; i++) {
	            const decl = rule.declarations[i];

	            if (decl.property === 'src') {
	              // @todo parse this properly and generate multiple preloads with type="font/woff2" etc
	              src = (decl.value.match(/url\s*\(\s*(['"]?)(.+?)\1\s*\)/) || [])[2];
	            } else if (decl.property === 'font-family') {
	              family = decl.value;
	            }
	          }

	          if (src && shouldPreloadFonts && preloadedFonts.indexOf(src) === -1) {
	            preloadedFonts.push(src);
	            const preload = document.createElement('link');
	            preload.setAttribute('rel', 'preload');
	            preload.setAttribute('as', 'font');
	            preload.setAttribute('crossorigin', 'anonymous');
	            preload.setAttribute('href', src.trim());
	            head.appendChild(preload);
	          } // if we're missing info, if the font is unused, or if critical font inlining is disabled, remove the rule:


	          if (!family || !src || criticalFonts.indexOf(family) === -1 || !shouldInlineFonts) {
	            return false;
	          }
	        }
	      });
	      sheet = serializeStylesheet(ast, {
	        compress: _this6.options.compress !== false
	      }).trim(); // If all rules were removed, get rid of the style element entirely

	      if (sheet.trim().length === 0) {
	        if (style.parentNode) {
	          style.remove();
	        }

	        return Promise.resolve();
	      }

	      let afterText = '';
	      let styleInlinedCompletely = false;

	      if (options.pruneSource) {
	        const sheetInverse = serializeStylesheet(astInverse, {
	          compress: _this6.options.compress !== false
	        });
	        styleInlinedCompletely = _this6.pruneSource(style, before, sheetInverse);

	        if (styleInlinedCompletely) {
	          const percent = sheetInverse.length / before.length * 100;
	          afterText = `, reducing non-inlined size ${percent | 0}% to ${prettyBytes(sheetInverse.length)}`;
	        }
	      } // replace the inline stylesheet with its critical'd counterpart


	      if (!styleInlinedCompletely) {
	        style.textContent = sheet;
	      } // output stats


	      const percent = sheet.length / before.length * 100 | 0;

	      _this6.logger.info('\u001b[32mInlined ' + prettyBytes(sheet.length) + ' (' + percent + '% of original ' + prettyBytes(before.length) + ') of ' + name + afterText + '.\u001b[39m');

	      return Promise.resolve();
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  }

	}

	return Critters;

})));
//# sourceMappingURL=critters.umd.js.map
