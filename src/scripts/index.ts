import base from './base.js';
import tools from './toolInstall.js';
import selene from './tools/selene.js';
import stylua from './tools/stylua.js';
import ui from './ui.js';
import wally from './tools/wally.js';
import darklua from './tools/darklua.js';
import git from './git.js';
import packages from './packages.js';

// run tools twice so that initial dependencies are installed, and further dependencies are installed later
export default [
    base,
    selene,
    stylua,
    ui,
    packages,
    wally,
    tools,
    darklua,
    tools,
    git,
];
