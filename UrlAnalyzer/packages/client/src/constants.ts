export const REGEXES = {
	EMAIL: /^[\w.-]+@[\d.A-Za-z-]+\.[A-Za-z]{2,4}$/,
	USERNAME: /^[\w.-]{3,32}$/,
	PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()-_{|}])[\d!"#$%&'()-_a-z{|}]{8,32}$/,
};
