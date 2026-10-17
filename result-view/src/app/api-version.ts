const API_VERSION_KEY = 'apiVersion';

export type ApiVersion = 'v1' | 'v2';

export function getApiVersion(): ApiVersion {
  return localStorage.getItem(API_VERSION_KEY) === 'v2' ? 'v2' : 'v1';
}

export function setApiVersion(version: ApiVersion): void {
  localStorage.setItem(API_VERSION_KEY, version);
}
