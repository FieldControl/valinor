import { createRequire } from 'module';const require = createRequire(import.meta.url);

// node_modules/@angular/cdk/fesm2022/boolean-property-_aCfQwp8.mjs
function coerceBooleanProperty(value) {
  return value != null && `${value}` !== "false";
}

// node_modules/@angular/cdk/fesm2022/css-pixel-value-C1yoKJ7R.mjs
function coerceCssPixelValue(value) {
  if (value == null) {
    return "";
  }
  return typeof value === "string" ? value : `${value}px`;
}

export {
  coerceBooleanProperty,
  coerceCssPixelValue
};
//# sourceMappingURL=chunk-K4SCQFZE.js.map
