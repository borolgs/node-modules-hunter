import { Button, Icon, Intent, Tag, Text } from '@blueprintjs/core';
import { useList, useUnit } from 'effector-react';
import { $dirs, $hasDirs, $loading, $sorting, openInFinder, sort } from '../model';
import styles from './directories-table.module.css';
import cn from 'classnames';
import { DirInfo } from 'shared/api';
import { listen } from '@tauri-apps/api/event';
export const DirectoriesTable = () => {
  const [loading, hasDirs] = useUnit([$loading, $hasDirs]);
  const dirs = useList($dirs, {
    fn: (dir) => {
      return <TableRow dir={dir} />;
    },
  });
  return (
    <table className={cn(styles.table, 'bp4-html-table', 'bp4-html-table-condensed', 'bp4-interactive')}>
      <thead>
        {(hasDirs || loading) && (
          <tr>
            <HeadCell name="Path" slug="path" />
            <HeadCell name="Size" slug="size" />
            <th></th>
          </tr>
        )}
      </thead>
      {/* {loading ? <LoadingTablebody /> : <tbody>{dirs}</tbody>} */}
      <tbody>{dirs}</tbody>
    </table>
  );
};

const HeadCell: React.FC<{ name: string; slug: 'path' | 'size' }> = ({ name, slug }) => {
  const [sorting] = useUnit([$sorting]);
  const isSortedBy = sorting?.field === slug;

  return (
    <th className={styles.cell}>
      <div role="button" className="bp4-button bp4-minimal" onClick={() => sort({ field: slug })}>
        <span>{name}</span>
        <Icon
          icon={sorting?.desc ? 'chevron-down' : 'chevron-up'}
          className={cn(styles.sortIcon, { [styles.sortActive]: isSortedBy })}
        />
      </div>
    </th>
  );
};

const TableRow: React.FC<{ dir: DirInfo }> = ({ dir }) => {
  return (
    <tr>
      <td>
        <Text ellipsize>{dir.path}</Text>{' '}
      </td>
      <td>
        <Size size={dir.size} />
      </td>
      <td>
        <Button
          icon="folder-shared-open"
          minimal
          onClick={() => {
            openInFinder({ path: dir.path });
          }}
        />
      </td>
    </tr>
  );
};

const Size: React.FC<{ size: number }> = ({ size }) => {
  let intent: Intent = 'success';
  if (size > 500000) {
    intent = 'warning';
  }
  if (size > 1000000) {
    intent = 'danger';
  }
  return (
    <Tag minimal intent={intent}>
      {(size / 1000000).toFixed(2)}
    </Tag>
  );
};
