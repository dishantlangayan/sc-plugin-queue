export interface BrokerGetResponse {
  data: BrokerData
  meta: Record<string, unknown>
}

export interface BrokerNameGetResponse {
  data: BrokerData[]
  meta: Record<string, unknown>
}

export interface BrokerData {
  adminState: string
  broker: Broker
  createdTime: string
  creationState: string
  datacenterId: string
  defaultManagementHostname: string
  endOfFullSupport: string
  environmentId: string
  eventBrokerServiceVersion: string
  id: string
  infrastructureId: string
  locked: boolean
  msgVpnName: string
  name: string
  ownedBy: string
  selfServeUpgradesEnabled: boolean
  serviceClassId: string
  serviceConnectionEndpoints: ServiceConnectionEndpoint[]
  type: string
}

export interface ServiceConnectionEndpoint {
  accessType: string
  creationState: string
  description: string
  hostNames: string[]
  id: string
  k8sServiceId: string
  k8sServiceType: string
  name: string
  ports: Port[]
  type: string
}

export interface Port {
  port: number
  protocol: string
}

export interface Broker {
  cluster: Cluster
  configSyncSslEnabled: boolean
  diskSize: number
  managementReadOnlyLoginCredential: Credential
  maxSpoolUsage: number
  monitoringAgentEnabled: boolean
  monitoringMode: string
  msgVpns: MsgVpn[]
  redundancyGroupSslEnabled: boolean
  solaceDatadogAgentImage: string
  tlsStandardDomainCertificateAuthoritiesEnabled: boolean
  version: string
  versionFamily: string
}

export interface Cluster {
  name: string
  password: string
  primaryRouterName: string
  remoteAddress: string
  supportedAuthenticationMode: string[]
}

export interface Credential {
  password: string
  token?: string
  username: string
}

export interface MsgVpn {
  authenticationBasicEnabled: boolean
  authenticationBasicType: string
  authenticationClientCertAllowApiProvidedUsernameEnabled: boolean
  authenticationClientCertEnabled: boolean
  authenticationClientCertUsernameSource: string
  authenticationClientCertValidateDateEnabled: boolean
  authenticationOauthEnabled: boolean
  clientProfiles: ClientProfile[]
  enabled: boolean
  eventLargeMsgThreshold: number
  managementAdminLoginCredential: Credential
  maxConnectionCount: number
  maxEgressFlowCount: number
  maxEndpointCount: number
  maxIngressFlowCount: number
  maxMsgSpoolUsage: number
  maxSubscriptionCount: number
  maxTransactedSessionCount: number
  maxTransactionCount: number
  missionControlManagerLoginCredential: Credential
  msgVpnName: string
  sempOverMessageBus: SempOverMessageBus
  serviceLoginCredential: Credential
  subDomainName: string
  truststoreUri: string
}

export interface ClientProfile {
  name: string
}

export interface SempOverMessageBus {
  sempAccessToAdminCmdsEnabled: boolean
  sempAccessToCacheCmdsEnabled: boolean
  sempAccessToClientAdminCmdsEnabled: boolean
  sempAccessToShowCmdsEnabled: boolean
  sempOverMsgBusEnabled: boolean
}
