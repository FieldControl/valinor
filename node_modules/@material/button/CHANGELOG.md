# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [15.0.0-canary.684e33d25.0](https://github.com/material-components/material-components-web/compare/v14.0.0...v15.0.0-canary.684e33d25.0) (2023-01-10)


### Bug Fixes

* **button:** add `pressed-outline-color` key ([ab55c07](https://github.com/material-components/material-components-web/commit/ab55c07d28e2a10b30260021e97f8c337208e937))
* **button:** Add line-height: initial to button progress indicator class ([602fe8e](https://github.com/material-components/material-components-web/commit/602fe8efa3f3c9a41c7f74a7c5717a0abdec0c60))
* **button:** Attribute `hidden` now correctly hides the button. ([88db019](https://github.com/material-components/material-components-web/commit/88db019902ca09811794b202d66ce1f9f2e54aec))
* **button:** Refactored HCM focus ring into a base style with display: none so mixins can be applied to both a visible non-HCM ring and the HCM ring without extra specificity to override ripple-theme.focus selectors ([6a61d62](https://github.com/material-components/material-components-web/commit/6a61d62f6b2b1f6b4bcf7477bdad46ba4139e5c8))


### Features

* **button:** Introduced a new token: `"keep-touch-target"` to the `theme` mixin. ([21d1196](https://github.com/material-components/material-components-web/commit/21d1196a7cae2760582c1cefb64e418e99f7d9b2))
* **button:** Mixin styling for progress buttons ([2860d24](https://github.com/material-components/material-components-web/commit/2860d244d9fc4c5bf47d3f03e7dc60bbfc56c7c9))
* **touch-target:** margin mixin now also allows custom property maps as arguments. ([dd99c87](https://github.com/material-components/material-components-web/commit/dd99c87645f91ff535df8d50be84ffcfd643ae47))
