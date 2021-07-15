import * as React from 'react';

import { Proxy, ServerInfo, FilePanelInfo } from '../shared/state';
import { parseArrayBuffer } from '../shared/text';
import { MODE } from '../shared/constants';

import { ProjectContext } from './ProjectStore';
import { asyncRPC } from './asyncRPC';
import { ServerPicker } from './ServerPicker';
import { ContentTypePicker } from './ContentTypePicker';
import { FileInput } from './component-library/FileInput';

export async function evalFilePanel(
  panel: FilePanelInfo,
  _: any,
  servers: Array<ServerInfo>
) {
  if (MODE === 'browser') {
    return await parseArrayBuffer(
      panel.file.type,
      panel.file.name,
      panel.file.content
    );
  }

  return await asyncRPC<
    Proxy<{ name: string; type: string }>,
    void,
    Array<object>
  >('evalFile', null, {
    ...panel.file,
    server: servers.find((s) => s.id === panel.serverId),
  });
}

export function FilePanelDetails({
  panel,
  updatePanel,
}: {
  panel: FilePanelInfo;
  updatePanel: (d: FilePanelInfo) => void;
}) {
  const { servers } = React.useContext(ProjectContext);
  return (
    <div className="FilePanel">
      <div className="form-row">
        <FileInput
          label="File"
          value={panel.file.name}
          allowManualEntry={MODE !== 'browser' ? true : false}
          allowFilePicker={!panel.serverId ? true : false}
          onRead={
            MODE !== 'desktop'
              ? (value: ArrayBuffer) => {
                  panel.file.content = value;
                  updatePanel(panel);
                }
              : null
          }
          onChange={(fileName: string) => {
            panel.file.name = fileName;
            updatePanel(panel);
          }}
        />
      </div>
      <ContentTypePicker
        value={panel.file.type}
        onChange={(type: string) => {
          panel.file.type = type;
          updatePanel(panel);
        }}
      />
      <ServerPicker
        servers={servers}
        serverId={panel.serverId}
        onChange={(serverId: string) => {
          panel.serverId = serverId;
          updatePanel(panel);
        }}
      />
    </div>
  );
}
