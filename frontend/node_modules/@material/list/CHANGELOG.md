# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [15.0.0-canary.7f224ddd4.0](https://github.com/material-components/material-components-web/compare/v14.0.0...v15.0.0-canary.7f224ddd4.0) (2023-12-28)


### Bug Fixes

* **list:** Remove ripple styles for disabled items in deprecated list. ([f52358d](https://github.com/material-components/material-components-web/commit/f52358dd0796308919bb78deffc573d0d933c7de))
* correct behavior of checkboxes/radios in a list. ([f771b09](https://github.com/material-components/material-components-web/commit/f771b091ce1e5b1b97b3a508f1459e4665008a80))
* **list:** Allow alt + enter to select index for lists. ([113b1a3](https://github.com/material-components/material-components-web/commit/113b1a38e87337fdd00c7495fda3299df2dbc317))
* **list:** behavior in case of changing focus from -1 to -1 with forceUpdate: true ([ae278a2](https://github.com/material-components/material-components-web/commit/ae278a2fe94fdb8c5d0716fb34cbe84a691d6146))
* **list:** Fix list leading/trailing icon theming ([36a4cba](https://github.com/material-components/material-components-web/commit/36a4cba9944392b391b86d41405ee21fb97f4c22))
* **list:** Fixes how list handles `CTRL-A` keyboard interactions for multi-selection lists when there are disabled list items. ([a911b38](https://github.com/material-components/material-components-web/commit/a911b386b2fded69e3468ef42e7ef25eb33fcd70))
* **list:** Fixing css for calculating `$mdc-list-subheader-margin` param. ([357f2e5](https://github.com/material-components/material-components-web/commit/357f2e5f15f6374c9d93da135a8b070239ba7464))
* **list:** Initialize selectedIndex as an array for checkbox list ([0347671](https://github.com/material-components/material-components-web/commit/034767110778aab3e5f0a3240937d8a07c21197e))
* **list:** only set overflow hidden on mdc-list-item--with-leading-image ([033ae08](https://github.com/material-components/material-components-web/commit/033ae083aad9ad4376e64aa328df936c7adb5a32))
* **list:** rolling back update of list styles since this is causing failures. ([eb103d4](https://github.com/material-components/material-components-web/commit/eb103d4b5d33e0d1535ea28ca0089d2c7002fab6))


### Features

* **list:** Add support for list-item-selected-container-color and list-item-selected-trailing-icon-color tokens. ([ece3e8d](https://github.com/material-components/material-components-web/commit/ece3e8d2155abd93bc1f9bdcf2dddea9e6eaab56))
* **list:** Add support for several new tokens ([cec7fb9](https://github.com/material-components/material-components-web/commit/cec7fb9878e548f7f070c5b0f9572cf34e3cce36))
* **list:** Added boilerplate code for list theming API implementation ([df47894](https://github.com/material-components/material-components-web/commit/df47894dbe5132b66af0df9c53a54d7d1030f397))
* **list:** Added Theming API to MDC list ([b18a873](https://github.com/material-components/material-components-web/commit/b18a873dcb2800b3263d7636e829fa94b3c12d6d))
* **list:** Changing default value of `areDisabledItemsFocusable` to false. ([65c4116](https://github.com/material-components/material-components-web/commit/65c411674c70291e64bf0deaca88f8b68586ba82))
* **list:** Creates a `static-styles` mixin that holds all the non-themeable list styles. ([73ca9db](https://github.com/material-components/material-components-web/commit/73ca9dbb058c47c557aff16137277a7bd33d0b8c))
* **list:** Creates a static-styles mixin that holds all the non-themeable list styles. ([58733ef](https://github.com/material-components/material-components-web/commit/58733ef418bf8641a5b3b7fd33e8e2bb1d0e7b97))
* **list:** Fixes focus behavior on disabled list items when `areDisabledItemsFocusable` is set to `false`. ([2aa8050](https://github.com/material-components/material-components-web/commit/2aa8050b46b7b170ab9ecc2a1fe9686ac40d79cc))
* **list:** Removes ripple styling on disabled list items. ([eaa0c3a](https://github.com/material-components/material-components-web/commit/eaa0c3a8603d70489b22b68a2b0e6ec4284de3a5))
* add icon support to menu theming ([40b18d0](https://github.com/material-components/material-components-web/commit/40b18d04314549060c2b4a28ed425cba9976687b))
* **list:** Defines a `theme` mixin for list component. Also adjusts the `theme-styles` mixin so that it emits custom properties. ([3cc30f6](https://github.com/material-components/material-components-web/commit/3cc30f6adb6a5496601dd458a8a9ef40ffef7ff6))
* **menu:** working on theming API ([f1e0371](https://github.com/material-components/material-components-web/commit/f1e0371502ee9bfe48f3501a63f70a42bfd79cb8))
