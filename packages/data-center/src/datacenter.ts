import { WorkspaceMetaCollection } from './workspace-meta-collection.js';
import type { WorkspaceMetaCollectionChangeEvent } from './workspace-meta-collection';
import { Workspace as BlocksuiteWorkspace } from '@blocksuite/store';
import { BaseProvider } from './provider/base';
import { LocalProvider } from './provider/local/local';
import { AffineProvider } from './provider';
import type { Message, WorkspaceMeta } from './types';
import assert from 'assert';
import { getLogger } from './logger';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import { createBlocksuiteWorkspace } from './utils/index.js';
import { MessageCenter } from './message/message';

/**
 * @class DataCenter
 * @classdesc Data center is made for managing different providers for business
 */
export class DataCenter {
  private readonly _workspaceMetaCollection = new WorkspaceMetaCollection();
  private readonly _logger = getLogger('dc');
  private _workspaceInstances: Map<string, BlocksuiteWorkspace> = new Map();
  private _messageCenter = new MessageCenter();
  /**
   * A mainProvider must exist as the only data trustworthy source.
   */
  private _mainProvider?: BaseProvider;
  providerMap: Map<string, BaseProvider> = new Map();

  constructor(debug: boolean) {
    this._logger.enabled = debug;
  }

  static async init(debug: boolean): Promise<DataCenter> {
    const dc = new DataCenter(debug);
    const getInitParams = () => {
      return {
        logger: dc._logger,
        workspaces: dc._workspaceMetaCollection.createScope(),
        messageCenter: dc._messageCenter,
      };
    };
    // TODO: switch different provider
    dc.registerProvider(new LocalProvider(getInitParams()));
    dc.registerProvider(new AffineProvider(getInitParams()));

    return dc;
  }

  /**
   * Register provider.
   * We will automatically set the first provider to default provider.
   */
  registerProvider(provider: BaseProvider) {
    if (!this._mainProvider) {
      this._mainProvider = provider;
    }

    provider.init();
    this.providerMap.set(provider.id, provider);
  }

  setMainProvider(providerId: string) {
    this._mainProvider = this.providerMap.get(providerId);
  }

  get providers() {
    return Array.from(this.providerMap.values());
  }

  public get workspaces() {
    return this._workspaceMetaCollection.workspaces;
  }

  public async refreshWorkspaces() {
    return Promise.allSettled(
      Object.values(this.providerMap).map(provider => provider.loadWorkspaces())
    );
  }

  /**
   * create new workspace , new workspace is a local workspace
   * @param {string} name workspace name
   * @returns {Promise<Workspace>}
   */
  public async createWorkspace(workspaceMeta: WorkspaceMeta) {
    assert(
      this._mainProvider,
      'There is no provider. You should add provider first.'
    );

    const workspaceInfo = await this._mainProvider.createWorkspaceInfo(
      workspaceMeta
    );

    const workspace = createBlocksuiteWorkspace(workspaceInfo.id);

    await this._mainProvider.createWorkspace(workspace, workspaceMeta);
    return workspace;
  }

  /**
   * delete workspace by id
   * @param {string} workspaceId workspace id
   */
  public async deleteWorkspace(workspaceId: string) {
    const workspaceInfo = this._workspaceMetaCollection.find(workspaceId);
    assert(workspaceInfo, 'Workspace not found');
    const provider = this.providerMap.get(workspaceInfo.provider);
    assert(provider, `Workspace exists, but we couldn't find its provider.`);
    await provider.deleteWorkspace(workspaceId);
  }

  /**
   * get a new workspace only has room id
   * @param {string} workspaceId workspace id
   */
  private _getBlocksuiteWorkspace(workspaceId: string) {
    const workspaceInfo = this._workspaceMetaCollection.find(workspaceId);
    assert(workspaceInfo, 'Workspace not found');
    return (
      this._workspaceInstances.get(workspaceId) ||
      createBlocksuiteWorkspace(workspaceId)
    );
  }

  /**
   * login to all providers, it will default run all auth ,
   *  maybe need a params to control which provider to auth
   */
  public async login(providerId = 'affine') {
    const provider = this.providerMap.get(providerId);
    assert(provider, `provide '${providerId}' is not registered`);
    await provider.auth();
    provider.loadWorkspaces();
  }

  /**
   * logout from all providers
   */
  public async logout(providerId = 'affine') {
    const provider = this.providerMap.get(providerId);
    assert(provider, `provide '${providerId}' is not registered`);
    await provider.logout();
  }

  /**
   * load workspace instance by id
   * @param {string} workspaceId workspace id
   * @returns {Promise<BlocksuiteWorkspace>}
   */
  public async loadWorkspace(workspaceId: string) {
    const workspaceInfo = this._workspaceMetaCollection.find(workspaceId);
    assert(workspaceInfo, 'Workspace not found');
    const currentProvider = this.providerMap.get(workspaceInfo.provider);
    if (currentProvider) {
      currentProvider.closeWorkspace(workspaceId);
    }
    const provider = this.providerMap.get(workspaceInfo.provider);
    assert(provider, `provide '${workspaceInfo.provider}' is not registered`);
    this._logger(`Loading ${workspaceInfo.provider} workspace: `, workspaceId);
    const workspace = this._getBlocksuiteWorkspace(workspaceId);
    this._workspaceInstances.set(workspaceId, workspace);
    return await provider.warpWorkspace(workspace);
  }

  /**
   * get user info by provider id
   * @param {string} providerId the provider name of workspace
   * @returns {Promise<User>}
   */
  public async getUserInfo(providerId = 'affine') {
    // XXX: maybe return all user info
    const provider = this.providerMap.get(providerId);
    assert(provider, `provide '${providerId}' is not registered`);
    return provider.getUserInfo();
  }

  /**
   * listen workspaces list change
   * @param {Function} callback callback function
   */
  public async onWorkspacesChange(
    callback: (workspaces: WorkspaceMetaCollectionChangeEvent) => void
  ) {
    this._workspaceMetaCollection.on('change', callback);
  }

  /**
   * change workspaces meta
   * @param {WorkspaceMeta} workspaceMeta workspace meta
   * @param {BlocksuiteWorkspace} workspace workspace instance
   */
  public async updateWorkspaceMeta(
    { name, avatar }: Partial<WorkspaceMeta>,
    workspace: BlocksuiteWorkspace
  ) {
    assert(workspace?.room, 'No workspace to set meta');
    const update: Partial<WorkspaceMeta> = {};
    if (name) {
      workspace.meta.setName(name);
      update.name = name;
    }
    if (avatar) {
      workspace.meta.setAvatar(avatar);
      update.avatar = avatar;
    }
    // may run for change workspace meta
    const workspaceInfo = this._workspaceMetaCollection.find(workspace.room);
    assert(workspaceInfo, 'Workspace not found');
    const provider = this.providerMap.get(workspaceInfo.provider);
    provider?.updateWorkspaceMeta(workspace.room, update);
  }

  /**
   *
   * leave workspace by id
   * @param id workspace id
   */
  public async leaveWorkspace(workspaceId: string) {
    const workspaceInfo = this._workspaceMetaCollection.find(workspaceId);
    assert(workspaceInfo, 'Workspace not found');
    const provider = this.providerMap.get(workspaceInfo.provider);
    if (provider) {
      await provider.closeWorkspace(workspaceId);
      await provider.leaveWorkspace(workspaceId);
    }
  }

  public async setWorkspacePublish(workspaceId: string, isPublish: boolean) {
    const workspaceInfo = this._workspaceMetaCollection.find(workspaceId);
    assert(workspaceInfo, 'Workspace not found');
    const provider = this.providerMap.get(workspaceInfo.provider);
    if (provider) {
      await provider.publish(workspaceId, isPublish);
    }
  }

  public async inviteMember(id: string, email: string) {
    const workspaceInfo = this._workspaceMetaCollection.find(id);
    assert(workspaceInfo, 'Workspace not found');
    const provider = this.providerMap.get(workspaceInfo.provider);
    if (provider) {
      await provider.invite(id, email);
    }
  }

  /**
   * remove the new member to the workspace
   * @param {number} permissionId permission id
   */
  public async removeMember(workspaceId: string, permissionId: number) {
    const workspaceInfo = this._workspaceMetaCollection.find(workspaceId);
    assert(workspaceInfo, 'Workspace not found');
    const provider = this.providerMap.get(workspaceInfo.provider);
    if (provider) {
      await provider.removeMember(permissionId);
    }
  }

  /**
   * get user info by email
   * @param workspaceId
   * @param email
   * @param provider
   * @returns {Promise<User>} User info
   */
  public async getUserByEmail(
    workspaceId: string,
    email: string,
    provider = 'affine'
  ) {
    const providerInstance = this.providerMap.get(provider);
    if (providerInstance) {
      return await providerInstance.getUserByEmail(workspaceId, email);
    }
  }

  private async _transWorkspaceProvider(
    workspace: BlocksuiteWorkspace,
    providerId: string
  ) {
    assert(workspace.room, 'No workspace id');
    const workspaceInfo = this._workspaceMetaCollection.find(workspace.room);
    assert(workspaceInfo, 'Workspace not found');
    if (workspaceInfo.provider === providerId) {
      this._logger('Workspace provider is same');
      return;
    }
    const currentProvider = this.providerMap.get(workspaceInfo.provider);
    assert(currentProvider, 'Provider not found');
    const newProvider = this.providerMap.get(providerId);
    assert(newProvider, `provide '${providerId}' is not registered`);
    this._logger(`create ${providerId} workspace: `, workspaceInfo.name);
    const newWorkspaceInfo = await newProvider.createWorkspaceInfo({
      name: workspaceInfo.name,
      avatar: workspaceInfo.avatar,
    });
    const newWorkspace = createBlocksuiteWorkspace(newWorkspaceInfo.id);
    // TODO optimize this function
    await newProvider.createWorkspace(newWorkspace, {
      name: workspaceInfo.name,
      avatar: workspaceInfo.avatar,
    });

    assert(newWorkspace, 'Create workspace failed');
    this._logger(
      `update workspace data from ${workspaceInfo.provider} to ${providerId}`
    );
    applyUpdate(newWorkspace.doc, encodeStateAsUpdate(workspace.doc));
    assert(newWorkspace, 'Create workspace failed');
    await currentProvider.deleteWorkspace(workspace.room);
  }

  /**
   * Enable workspace cloud
   * @param {string} id ID of workspace.
   */
  public async enableWorkspaceCloud(workspace: BlocksuiteWorkspace) {
    assert(workspace?.room, 'No workspace to enable cloud');
    return await this._transWorkspaceProvider(workspace, 'affine');
  }

  /**
   * @deprecated
   * clear all workspaces and data
   */
  public async clear() {
    for (const provider of this.providerMap.values()) {
      await provider.clear();
    }
  }

  /**
   * Select a file to import the workspace
   * @param {File} file file of workspace.
   */
  public async importWorkspace(file: File) {
    file;
    return;
  }

  /**
   * Generate a file ,and export it to local file system
   * @param {string} id ID of workspace.
   */
  public async exportWorkspace(id: string) {
    id;
    return;
  }

  /**
   * get blob url by workspaces id
   * @param id
   * @returns {Promise<string | null>} blob url
   */
  async getBlob(
    workspace: BlocksuiteWorkspace,
    id: string
  ): Promise<string | null> {
    const blob = await workspace.blobs;
    return (await blob?.get(id)) || '';
  }

  /**
   * up load blob and get a blob url
   * @param id
   * @returns {Promise<string | null>} blob url
   */
  async setBlob(workspace: BlocksuiteWorkspace, blob: Blob): Promise<string> {
    const blobStorage = await workspace.blobs;
    return (await blobStorage?.set(blob)) || '';
  }

  onMessage(cb: (message: Message) => void) {
    return this._messageCenter.onMessage(cb);
  }
}
