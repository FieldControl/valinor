
export default {
  //Stops Tests when Fail properity
  bail:true,
  //Provider type
  coverageProvider: "v8",
  //location of tests
  testMatch:[
    //ignore node modules
    '<rootDir>/src/**/*.spec.ts'
  ]
};