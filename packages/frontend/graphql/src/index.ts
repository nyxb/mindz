export * from './fetcher';
export * from './graphql';
export * from './schema';
export * from './utils';

import { setupGlobal } from '@affine/env/global';

setupGlobal();

export function getBaseUrl(): string {
  if (environment.isDesktop) {
    return runtimeConfig.serverUrlPrefix;
  }
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}
