# v0.3.0

Additions:

- New dev/build/install-packages script handler - switches to custom watch implementation
- When deleting files in `src`, they will now be deleted from the build folder. This issue is a known bug in Darklua and this fix is temporary until the bug is resolved.

Fixes

- The `src` folder is now cloned in it's entirety before it's used with Darklua. This allows model files to persist.
- Code has been heavily cleaned up
- `__DEV__` global has been fixed and added to Selene and Luau LSP configurations.
- Tool versions have been bumped
- `Cmdr` require error has been fixed
- Stability has been heavily improved
