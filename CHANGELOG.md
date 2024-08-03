# v0.3.11
Fixes
- `sourcemap.project.json` on packages now correctly generate sourcemaps without a datamodel for accurate require paths

# v0.3.10
Fixes
- Wrap `processFiles` in a pcall to prevent errors from crashing the entire file watcher

# v0.3.9
Fixes
- Add `dist` and `packages`/`Packages` to Luau LSP ignore list as it tends to ignore `.gitignore` directories

# v0.3.8
Fixes
- Template application is now done asynchronously
- Ignore `.lune` directory in Luau LSP

# v0.3.7
Fixes
- Made `Packages` folder renaming slightly more robust as it was breaking

# v.0.3.6 
Fixes
- Fix typo in project files that I somehow missed.. 

# v0.3.5
Fixes
- Fix typo where packages would use data from the wrong directory

# v0.3.4
Fixes
- Fix issue where src/output was ignored when building packages that don't use Wally

# v0.3.3
Fixes
- Actually fix the issue in 0.3.1 (I promise I totaaaally didn't forget to build before publishing)
- Fix issue where `packages` folder is included in project file even when wally is not used

# v0.3.1
Fixes
- Fixed issue with package building where a nonexistent project file would cause the build to fail.

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
