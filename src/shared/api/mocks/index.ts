import { mockIPC } from '@tauri-apps/api/mocks';
import { TauriCommand as TC } from '@tauri-apps/api/helpers/tauri';

import { COMMANDS, DirInfo, EVENTS } from '../api';
import dirs from './dirs.json';

export type TauriCommand = TC & {
  message: {
    cmd: string;
  };
};

export type TauriEvent = TauriCommand & {
  message: {
    cmd: 'emit';
    event: string;
    payload: any;
  };
};

const mocks: {
  dirs: DirInfo[];
} = {
  dirs,
};

export function useMocks() {
  mockIPC((cmd, args) => {
    // COMMANDS
    if (cmd === COMMANDS.GET_DIRS) {
      return mocks.dirs;
    }

    // TAURI COMMANDS: dialogs, events, etc
    if (isTauriCommand(args)) {
      if (isTauriEvent(args)) {
        if (args.message.event === EVENTS.OPEN_IN_FINDER) {
          const path = JSON.parse(args.message.payload).path;
          alert('Open \n' + path);
        }
      }

      if (args.message.cmd === 'openDialog') {
        return '/Users/username/Developer';
      }
    }
  });
}

function isTauriCommand(args: any): args is TauriCommand {
  return args['__tauriModule'] != null;
}

function isTauriEvent(command: TauriCommand): command is TauriEvent {
  return command.__tauriModule === 'Event';
}
