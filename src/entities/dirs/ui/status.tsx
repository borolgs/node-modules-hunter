import { ProgressBar } from '@blueprintjs/core';
import { useStoreMap, useUnit } from 'effector-react';
import { $loading, $status } from '../model';

export const Status = () => {
  const message = useStoreMap($status, ({ message }) => message);
  const [loading] = useUnit([$loading]);
  return (
    <>
      {message !== null && (
        <>
          <div className="bp4-text-muted" style={{ paddingLeft: '10px' }}>
            {message}
          </div>
          {loading && <ProgressBar />}
        </>
      )}
    </>
  );
};
