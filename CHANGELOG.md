# 0.4.3

Fixes

-   Remove unneeded dependencies
-   Fix bug where error type was not properly detected when exiting the CLI via a `PromptExitError`

# 0.4.2

Updates

-   Bump react-lua version to `17.2.1`

Fixes

-   Fix inquirer bug where answers were not recorded correctly
-   Fix "none" option in UI framework selection causing an error
-   Fixed bug where Storybook option would be asked if no UI framework is selected

# 0.4.1

Fixes

-   Make generated `README.md` for Fusion 0.3 games/packages use the correct version instead of 0.2

# 0.4.0

Updates

-   Update Darklua to `0.14.1`
-   Update Stylua to `2.0.1`
-   Update Zap to `0.6.15`
-   Update Lune to `0.8.9`
-   Update Rojo to `7.4.4`
-   Update Node dependencies (inquirer, eslint, etc) to latest versions

Changes

-   Use [rokit](https://github.com/rojo-rbx/rokit) instead of Aftman for toolchain management
-   Add Fusion 0.3 as a supported UI framework, with new stories and examples
-   Add support for new Flipbook Fusion integration, through [Storyteller](https://github.com/flipbook-labs/storyteller)
-   Aliases now use `.luaurc` instead of Visual Studio Code settings
-   Add support for Wally server packages.
-   `install-packages` will now correctly rename `ServerPackages`.

Fixes

-   Fixed filewatcher bug where project would not update on file changes
-   `install-packages` now checks whether packages exist before trying to rename them.

# 0.3.25

Fixes

-   Fix Zap breaking in certain installations
-   Fix incorrect Aftman install order, resulting in tools missing in certain installations

# 0.3.24

Fixes

-   Convert user profile name to lowercase to prevent Wally breaking

# 0.3.23

Changes

-   Remove `zap` lune script

# 0.3.22

Changes

-   Add support for new `Fusion` stories in UI Labs

# v0.3.21

Fixes

-   Make builds delete the `temp` folder appropriately.

# v0.3.20

Fixes

-   Fix bug that would not apply darklua configs correctly

# v0.3.19

Fixes

-   Make Zap games look for the file instead of the directory to work in CD workflows

# v0.3.18

Fixes

-   Make `temp` folder work properly
-   Support for optional processing steps on both `dev` and `build` scripts

# v0.3.17

Fixes

-   More verbose `install-packages` output

# v0.3.16

Fixes

-   Removed unnecessary code from `build` script

# v0.3.15

Fixes

-   Fix `__DEV__` global properly

# v0.3.14

Changes

-   Rename CI workflow to `CI` to ensure that badges don't get too large

# v0.3.13

Fixes

-   Add `main` to the CI workflow (I forgot repositories are created with the default branch as `main` now)

# v0.3.12

Fixes

-   Fix JSON error in Luau LSP config

# v0.3.11

Fixes

-   `sourcemap.project.json` on packages now correctly generate sourcemaps without a datamodel for accurate require paths

# v0.3.10

Fixes

-   Wrap `processFiles` in a pcall to prevent errors from crashing the entire file watcher

# v0.3.9

Fixes

-   Add `dist` and `packages`/`Packages` to Luau LSP ignore list as it tends to ignore `.gitignore` directories

# v0.3.8

Fixes

-   Template application is now done asynchronously
-   Ignore `.lune` directory in Luau LSP

# v0.3.7

Fixes

-   Made `Packages` folder renaming slightly more robust as it was breaking

# v.0.3.6

Fixes

-   Fix typo in project files that I somehow missed..

# v0.3.5

Fixes

-   Fix typo where packages would use data from the wrong directory

# v0.3.4

Fixes

-   Fix issue where src/output was ignored when building packages that don't use Wally

# v0.3.3

Fixes

-   Actually fix the issue in 0.3.1 (I promise I totaaaally didn't forget to build before publishing)
-   Fix issue where `packages` folder is included in project file even when wally is not used

# v0.3.1

Fixes

-   Fixed issue with package building where a nonexistent project file would cause the build to fail.

# v0.3.0

Additions:

-   New dev/build/install-packages script handler - switches to custom watch implementation
-   When deleting files in `src`, they will now be deleted from the build folder. This issue is a known bug in Darklua and this fix is temporary until the bug is resolved.

Fixes

-   The `src` folder is now cloned in it's entirety before it's used with Darklua. This allows model files to persist.
-   Code has been heavily cleaned up
-   `__DEV__` global has been fixed and added to Selene and Luau LSP configurations.
-   Tool versions have been bumped
-   `Cmdr` require error has been fixed
-   Stability has been heavily improved
