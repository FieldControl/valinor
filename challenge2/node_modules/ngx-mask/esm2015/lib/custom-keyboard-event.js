const commonjsGlobal = typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
            ? global
            : typeof self !== 'undefined'
                ? self
                : {};
(function () {
    if (!commonjsGlobal.KeyboardEvent) {
        commonjsGlobal.KeyboardEvent = function (_eventType, _init) { };
    }
})();
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLWtleWJvYXJkLWV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LW1hc2stbGliL3NyYy9saWIvY3VzdG9tLWtleWJvYXJkLWV2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE1BQU0sY0FBYyxHQUNsQixPQUFPLFVBQVUsS0FBSyxXQUFXO0lBQy9CLENBQUMsQ0FBQyxVQUFVO0lBQ1osQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVc7UUFDL0IsQ0FBQyxDQUFDLE1BQU07UUFDUixDQUFDLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVztZQUMvQixDQUFDLENBQUMsTUFBTTtZQUNSLENBQUMsQ0FBQyxPQUFPLElBQUksS0FBSyxXQUFXO2dCQUM3QixDQUFDLENBQUMsSUFBSTtnQkFDTixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRVQsQ0FBQztJQUNDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFO1FBQ2pDLGNBQWMsQ0FBQyxhQUFhLEdBQUcsVUFBVSxVQUFlLEVBQUUsS0FBVSxJQUFHLENBQUMsQ0FBQztLQUMxRTtBQUNILENBQUMsQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0c2xpbnQ6ZGlzYWJsZTogbm8tYW55IHR5cGVkZWZcbmRlY2xhcmUgdmFyIGdsb2JhbDogYW55O1xuXG5jb25zdCBjb21tb25qc0dsb2JhbCA9XG4gIHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJ1xuICAgID8gZ2xvYmFsVGhpc1xuICAgIDogdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IGdsb2JhbFxuICAgIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnXG4gICAgPyBzZWxmXG4gICAgOiB7fTtcblxuKGZ1bmN0aW9uICgpIHtcbiAgaWYgKCFjb21tb25qc0dsb2JhbC5LZXlib2FyZEV2ZW50KSB7XG4gICAgY29tbW9uanNHbG9iYWwuS2V5Ym9hcmRFdmVudCA9IGZ1bmN0aW9uIChfZXZlbnRUeXBlOiBhbnksIF9pbml0OiBhbnkpIHt9O1xuICB9XG59KSgpO1xuXG5leHBvcnQgdHlwZSBDdXN0b21LZXlib2FyZEV2ZW50ID0gS2V5Ym9hcmRFdmVudDtcbiJdfQ==