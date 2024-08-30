import type { DocMode } from '@blocksuite/blocks';
import type { Doc } from '@toeverything/infra';
import {
  DocsService,
  useLiveData,
  useService,
  WorkspaceService,
} from '@toeverything/infra';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { type Editor, EditorsService } from '../../editor';

export const useEditor = (pageId: string, preferMode?: DocMode) => {
  const currentWorkspace = useService(WorkspaceService).workspace;
  const docsService = useService(DocsService);
  const docRecordList = docsService.list;
  const docListReady = useLiveData(docRecordList.isReady$);
  const docRecord = docRecordList.doc$(pageId).value;
  const preferModeRef = useRef(preferMode);

  const [doc, setDoc] = useState<Doc | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);

  useLayoutEffect(() => {
    if (!docRecord) {
      return;
    }
    const { doc: opened, release } = docsService.open(pageId);
    setDoc(opened);
    return () => {
      release();
    };
  }, [docRecord, docsService, pageId]);

  useLayoutEffect(() => {
    if (!doc) {
      return;
    }
    const editor = doc.scope
      .get(EditorsService)
      .createEditor(preferModeRef.current || doc.primaryMode$.value);
    setEditor(editor);
    return () => {
      editor.dispose();
    };
  }, [doc]);

  // set sync engine priority target
  useEffect(() => {
    currentWorkspace.engine.doc.setPriority(pageId, 10);
    return () => {
      currentWorkspace.engine.doc.setPriority(pageId, 5);
    };
  }, [currentWorkspace, pageId]);

  return { doc, editor, workspace: currentWorkspace, loading: !docListReady };
};
