# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [15.0.0-canary.7f224ddd4.0](https://github.com/material-components/material-components-web/compare/v14.0.0...v15.0.0-canary.7f224ddd4.0) (2023-12-28)


### Bug Fixes

* **button:** fix theme elevation resolver ([2528c1c](https://github.com/material-components/material-components-web/commit/2528c1c3b6b2a9870807df8c03c49ea45db811b7))
* The focus ring shouldn't ignore the container-shape value ([7a3942e](https://github.com/material-components/material-components-web/commit/7a3942e7ad206c3754dd34e2da62b88e4a9dc311))
* **button:** add `pressed-outline-color` key ([ab55c07](https://github.com/material-components/material-components-web/commit/ab55c07d28e2a10b30260021e97f8c337208e937))
* **button:** Add line-height: initial to button progress indicator class ([602fe8e](https://github.com/material-components/material-components-web/commit/602fe8efa3f3c9a41c7f74a7c5717a0abdec0c60))
* **button:** Attribute `hidden` now correctly hides the button. ([88db019](https://github.com/material-components/material-components-web/commit/88db019902ca09811794b202d66ce1f9f2e54aec))
* **button:** Refactored HCM focus ring into a base style with display: none so mixins can be applied to both a visible non-HCM ring and the HCM ring without extra specificity to override ripple-theme.focus selectors ([6a61d62](https://github.com/material-components/material-components-web/commit/6a61d62f6b2b1f6b4bcf7477bdad46ba4139e5c8))


### Features

* **button:** Introduced a new token: `"keep-touch-target"` to the `theme` mixin. ([21d1196](https://github.com/material-components/material-components-web/commit/21d1196a7cae2760582c1cefb64e418e99f7d9b2))
* **button:** Mixin styling for progress buttons ([2860d24](https://github.com/material-components/material-components-web/commit/2860d244d9fc4c5bf47d3f03e7dc60bbfc56c7c9))
* **button:** Support state-layer-color theming for buttons and icon-buttons ([127a44b](https://github.com/material-components/material-components-web/commit/127a44b284698c40533b2e52cd0311ec689aa026))
* **touch-target:** margin mixin now also allows custom property maps as arguments. ([dd99c87](https://github.com/material-components/material-components-web/commit/dd99c87645f91ff535df8d50be84ffcfd643ae47))
