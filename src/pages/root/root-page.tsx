import { DirectoriesTable, SelectRootDir, Status } from 'entities/dirs';

import styles from './root-page.module.css';

export function RootPage() {
  return (
    <div className={styles.root}>
      <header className={styles.header}></header>
      <section className={styles.controls}>
        <SelectRootDir />
      </section>
      <section className={styles.content}>
        <DirectoriesTable />
      </section>
      <footer className={styles.footer}>
        <Status />
      </footer>
    </div>
  );
}
