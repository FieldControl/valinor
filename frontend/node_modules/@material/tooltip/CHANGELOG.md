# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [15.0.0-canary.7f224ddd4.0](https://github.com/material-components/material-components-web/compare/v14.0.0...v15.0.0-canary.7f224ddd4.0) (2023-12-28)


### Bug Fixes

* **tooltip:** Fix incorrect measurements of rich tooltip widths on subsequent renders. ([7ab3cd3](https://github.com/material-components/material-components-web/commit/7ab3cd3c82b92e741be2e67ead5c44a0ceabe794))
* **tooltip:** Fixes rich tooltip's theme-styles mixin. ([d584104](https://github.com/material-components/material-components-web/commit/d584104537cafcb624ea14f6b8b9ff6ea937d49a))
* **tooltip:** Fixes rich tooltip's theme-styles mixin. ([697fbde](https://github.com/material-components/material-components-web/commit/697fbdebd4bfaa85e0901855d11c8e7febc9c991))
* **tooltip:** Fixing tooltip's z-index mixin. ([a40e3c7](https://github.com/material-components/material-components-web/commit/a40e3c7684ea43f4a75f6afc75a0b8a34f49b674))
* **tooltip:** Stop keydown event propogation when ESC key is pressed. ([8d2d8d3](https://github.com/material-components/material-components-web/commit/8d2d8d3c4dbe6c2a17a5de099d59f7503101999f))
* **tooltip:** Stop re-calculating the tooltip position if the anchor is scrolled out of view. ([684e33d](https://github.com/material-components/material-components-web/commit/684e33d250337e53e46fec26c97b382ba85f60d0))
* **tooltip:** Uses single quotes when retrieving key value from sass map. ([953e689](https://github.com/material-components/material-components-web/commit/953e689f3bad9b0a2b3c384470fc82a2d4b8df92))
* Makes material component to depend on https://github.com/google/safevalues and be Trusted Type compatible. ([a44241e](https://github.com/material-components/material-components-web/commit/a44241e5428e7f83733b2bd8ab7acc851fc2fb85))


### Features

* **tooltip:** Adding side positioning options for plain tooltips. ([ba9c296](https://github.com/material-components/material-components-web/commit/ba9c29637109e300121c79a902df12310d9cf9fe))
* **tooltip:** Adjust rich tooltip's theme and theme-styles mixins. ([7c73f61](https://github.com/material-components/material-components-web/commit/7c73f6134470aaf1ef7f7ab931ba0c658116cf18))
* **tooltip:** Calls resolvers in theme-mixins to resolve typography tokens. ([66c5cbb](https://github.com/material-components/material-components-web/commit/66c5cbb9446da83a6c48570e12b1ab71cae3c77f))
* **tooltip:** Emit event for tooltip shown. ([31e517c](https://github.com/material-components/material-components-web/commit/31e517cea3002785ad2936ebc6ef12317b9d4133))
* **tooltip:** Interactive rich tooltip content becomes scrollable if it extends beyond the max-height limit. ([0ad1283](https://github.com/material-components/material-components-web/commit/0ad128337d689ca084fbda457a7204daa750b792))
* **tooltip:** No longer re-calculate persistent rich tooltip's position on scroll. ([5cb8e21](https://github.com/material-components/material-components-web/commit/5cb8e2174bb381556fc684283748659b322dc158))
* **tooltip:** Updates to accessibility guidance states that we want all rich tooltips to be reachable via screenreader linear navigation. The idea is that the user should always be able to hear the message of a rich tooltip line-by-line regardless of if the tooltip is interactive, non-interactive, persistent, or non-persistent. ([5490e32](https://github.com/material-components/material-components-web/commit/5490e32e718b4357ee6b58c329fdae28f89ea171))
* **tooltip:** Updating `handleDocumentClick` method to utilize a new `isInstanceOfElement` adapter method. ([9af09b9](https://github.com/material-components/material-components-web/commit/9af09b967a7c01c6c45d2afb5cbb00f0e43904ce))
* **tooltip:** When calculating rich tooltip width, we now take the viewport width into account. ([817002c](https://github.com/material-components/material-components-web/commit/817002c296d5a9220c2b940e3383fdd42ca2aa87))
