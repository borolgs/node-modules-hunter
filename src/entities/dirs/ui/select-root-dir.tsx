import { useUnit } from 'effector-react';
import { $rootDir, refresh, selectDir } from '../model';
import { Button } from '@blueprintjs/core';

import styles from './select-root-dir.module.css';

export const SelectRootDir = () => {
  const [dir, handleSelectDir] = useUnit([$rootDir, selectDir]);
  return (
    <div className={styles.selectFile}>
      <Button
        text="Select Directory"
        icon="folder-open"
        onClick={() => {
          handleSelectDir();
        }}
      />
      <Button
        icon="refresh"
        onClick={() => {
          refresh();
        }}
      />
      <span>
        <strong>{dir}</strong>
      </span>
    </div>
  );
};
