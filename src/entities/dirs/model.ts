import { combine, createEffect, createEvent, createStore, sample } from 'effector';
import { DirInfo, api } from 'shared/api';

/** Root dir */
export const selectDir = createEvent();
export const refresh = createEvent();
export const selectDirFx = createEffect(() => {
  return api.selectDir();
});

export const $rootDir = createStore<string | null>(null);

sample({
  clock: selectDir,
  filter: selectDirFx.pending.map((is) => !is),
  target: selectDirFx,
});

sample({
  clock: selectDirFx.doneData,
  target: $rootDir,
});

/** node_modules directories */
export const getDirs = createEvent<string>();

export const getDirsFx = createEffect(async (path: string) => {
  return api.getDirs(path);
});

export const $loading = getDirsFx.pending;

export const $dirs = createStore<DirInfo[]>([]);
export const $hasDirs = $dirs.map((dirs) => dirs.length > 0);

sample({
  clock: getDirs,
  target: $dirs,
  fn: () => [],
});

sample({
  clock: getDirs,
  filter: getDirsFx.pending.map((is) => !is),
  target: getDirsFx,
});

sample({
  clock: getDirsFx.doneData,
  target: $dirs,
});

sample({
  source: $rootDir,
  filter: (dir) => dir !== null,
  fn: (path) => path!,
  target: getDirs,
});

sample({
  clock: refresh,
  source: $rootDir,
  filter: (dir) => dir !== null,
  fn: (path) => path!,
  target: getDirs,
});

/** Time */
export const $startTime = createStore(0);
export const $milliseconds = createStore(0);

sample({
  clock: getDirsFx,
  target: $startTime,
  fn: () => performance.now(),
});

sample({
  clock: [getDirsFx.doneData, getDirsFx.fail],
  source: $startTime,
  target: $milliseconds,
  fn: (start) => performance.now() - start,
});

/** Open in finder */
export const openInFinder = createEvent<{ path: string }>();

export const openInFinderFx = createEffect(({ path }: { path: string }) => {
  api.opneInFinder(path);
});

sample({
  clock: openInFinder,
  filter: openInFinderFx.pending.map((is) => !is),
  target: openInFinderFx,
});

/** On found */
export const onFoundDir = createEvent<DirInfo>();

api.createFoundListener((dirInfo) => {
  onFoundDir(dirInfo);
});

export const $status = createStore<{ message: string | null }>({ message: null });

sample({
  clock: [getDirsFx.done, getDirsFx.fail],
  fn: () => ({ message: null }),
  target: $status,
});

sample({
  clock: onFoundDir,
  fn: ({ path }) => ({ message: `current: ${path}` }),
  target: $status,
});

sample({
  clock: getDirsFx.doneData,
  source: $milliseconds,
  fn: (milliseconds, dirs) => ({
    message: `count: ${dirs.length}, total size: ${(dirs.reduce((sum, dir) => (sum += dir.size), 0) / 1000000).toFixed(
      3
    )}, time: ${(milliseconds / 1000).toFixed(2)}`,
  }),
  target: $status,
});

/** Sorting */
export type Sorting = { field: 'path' | 'size'; desc?: boolean };
export const sort = createEvent<Sorting>();
export const $sorting = createStore<Sorting | null>(null);

sample({
  clock: sort,
  source: $sorting,
  fn: (currentSorting, newSorting) => {
    if (!currentSorting) {
      return newSorting;
    }
    if (currentSorting.field === newSorting.field) {
      return { ...newSorting, desc: !currentSorting.desc };
    }
    return newSorting;
  },
  target: $sorting,
});

sample({
  clock: $sorting,
  filter: combine([$hasDirs, $sorting], ([hasDirs, sorting]) => hasDirs && sorting != null),
  source: $dirs,
  fn: (dirs, sorting) => {
    if (!sorting) {
      return dirs;
    }
    return [...dirs].sort((a, b) => {
      let res: number;
      if (sorting.field === 'path') {
        res = a.path.localeCompare(b.path);
      } else {
        res = a.size - b.size;
      }
      return res * (sorting.desc ? -1 : 1);
    });
  },
  target: $dirs,
});

/** On got dir metadata dir */
export const onGotDirMetadata = createEvent<DirInfo>();

api.createGotMetadataListener((dirInfo) => {
  onGotDirMetadata(dirInfo);
});

sample({
  clock: onGotDirMetadata,
  source: $dirs,
  target: $dirs,
  fn: (dirs, dir) => {
    return [...dirs, dir];
  },
});

sample({
  clock: onGotDirMetadata,
  target: $sorting,
  fn: () => null,
});
