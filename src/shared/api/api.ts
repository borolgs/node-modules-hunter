import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { homeDir } from '@tauri-apps/api/path';
import { emit, listen } from '@tauri-apps/api/event';

export const COMMANDS = {
  GET_DIRS: 'get_dirs',
} as const;

export const EVENTS = {
  OPEN_IN_FINDER: 'open-in-finder',
  FOUND: 'found',
  GOT_METADATA: 'got-metadata',
} as const;

export type DirInfo = {
  path: string;
  size: number;
};

async function getDirs(path: string): Promise<DirInfo[]> {
  let res = (await invoke(COMMANDS.GET_DIRS, { path })) as DirInfo[];
  return res;
}

async function selectDir(): Promise<string | null> {
  const selected: string | null = (await open({
    directory: true,
    multiple: false,
    defaultPath: await homeDir(),
  })) as string;

  return selected;
}

async function opneInFinder(path: string): Promise<void> {
  await emit(EVENTS.OPEN_IN_FINDER, { path });
}

async function createFoundListener(cb: (dirInfo: DirInfo) => void) {
  const unlisten = await listen(EVENTS.FOUND, (event) => {
    cb(event.payload as DirInfo);
  });

  return unlisten;
}

async function createGotMetadataListener(cb: (dirInfo: DirInfo) => void) {
  const unlisten = await listen(EVENTS.GOT_METADATA, (event) => {
    cb(event.payload as DirInfo);
  });

  return unlisten;
}

export const api = {
  getDirs,
  selectDir,
  opneInFinder,
  createFoundListener,
  createGotMetadataListener,
};
