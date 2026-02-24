import {BrokerData, BrokerGetResponse, BrokerNameGetResponse} from '../../src/types/broker.js'
import {MsgVpnQueue, MsgVpnQueuesResponse} from '../../src/types/msgvpn-queue.js'

export function setEnvVariables(): void {
  process.env.SC_ACCESS_TOKEN = 'TEST_TOKEN'
}

export function aBrokerData(brokerId: string, brokerName: string): BrokerData {
  return {
    adminState: 'enabled',
    broker: {
      cluster: {
        name: 'test-cluster',
        password: 'test-password',
        primaryRouterName: 'test-router',
        remoteAddress: 'test-address',
        supportedAuthenticationMode: ['basic'],
      },
      configSyncSslEnabled: true,
      diskSize: 100,
      managementReadOnlyLoginCredential: {
        password: 'readonly-password',
        username: 'readonly',
      },
      maxSpoolUsage: 1000,
      monitoringAgentEnabled: false,
      monitoringMode: 'standard',
      msgVpns: [
        {
          authenticationBasicEnabled: true,
          authenticationBasicType: 'internal',
          authenticationClientCertAllowApiProvidedUsernameEnabled: false,
          authenticationClientCertEnabled: false,
          authenticationClientCertUsernameSource: 'certificate-thumbprint',
          authenticationClientCertValidateDateEnabled: true,
          authenticationOauthEnabled: false,
          clientProfiles: [],
          enabled: true,
          eventLargeMsgThreshold: 1024,
          managementAdminLoginCredential: {
            password: 'admin123',
            username: 'admin',
          },
          maxConnectionCount: 100,
          maxEgressFlowCount: 100,
          maxEndpointCount: 100,
          maxIngressFlowCount: 100,
          maxMsgSpoolUsage: 1000,
          maxSubscriptionCount: 100,
          maxTransactedSessionCount: 100,
          maxTransactionCount: 100,
          missionControlManagerLoginCredential: {
            password: 'manager-password',
            username: 'manager',
          },
          msgVpnName: 'test-vpn',
          sempOverMessageBus: {
            sempAccessToAdminCmdsEnabled: true,
            sempAccessToCacheCmdsEnabled: true,
            sempAccessToClientAdminCmdsEnabled: true,
            sempAccessToShowCmdsEnabled: true,
            sempOverMsgBusEnabled: true,
          },
          serviceLoginCredential: {
            password: 'service-password',
            username: 'service',
          },
          subDomainName: 'test-subdomain',
          truststoreUri: 'test-truststore-uri',
        },
      ],
      redundancyGroupSslEnabled: true,
      solaceDatadogAgentImage: 'datadog-image',
      tlsStandardDomainCertificateAuthoritiesEnabled: true,
      version: '10.0.0',
      versionFamily: '10.x',
    },
    createdTime: '2024-01-01T00:00:00Z',
    creationState: 'completed',
    datacenterId: 'datacenter-1',
    defaultManagementHostname: 'test-host.solace.cloud',
    endOfFullSupport: '2025-01-01T00:00:00Z',
    environmentId: 'env-1',
    eventBrokerServiceVersion: '10.0.0',
    id: brokerId,
    infrastructureId: 'infra-1',
    locked: false,
    msgVpnName: 'test-vpn',
    name: brokerName,
    ownedBy: 'user1',
    selfServeUpgradesEnabled: true,
    serviceClassId: 'class-1',
    serviceConnectionEndpoints: [
      {
        accessType: 'public',
        creationState: 'completed',
        description: 'Management endpoint',
        hostNames: ['test-host.solace.cloud'],
        id: 'endpoint-1',
        k8sServiceId: 'k8s-1',
        k8sServiceType: 'LoadBalancer',
        name: 'management',
        ports: [
          {port: 943, protocol: 'serviceManagementTlsListenPort'},
          {port: 8080, protocol: 'other'},
        ],
        type: 'management',
      },
    ],
    type: 'enterprise',
  }
}

export function aBrokerGetResponse(brokerId: string, brokerName: string): BrokerGetResponse {
  return {
    data: aBrokerData(brokerId, brokerName),
    meta: {},
  }
}

export function aBrokerNameGetResponse(brokerId: string, brokerName: string): BrokerNameGetResponse {
  return {
    data: [aBrokerData(brokerId, brokerName)],
    meta: {},
  }
}

export function aQueue(
  queueName: string,
  options?: {
    accessType?: 'exclusive' | 'non-exclusive'
    egressEnabled?: boolean
    ingressEnabled?: boolean
    maxMsgSpoolUsage?: number
    msgVpnName?: string
    owner?: string
    permission?: 'consume' | 'delete' | 'modify-topic' | 'no-access' | 'read-only'
  },
): MsgVpnQueue {
  return {
    accessType: options?.accessType ?? 'exclusive',
    egressEnabled: options?.egressEnabled ?? true,
    ingressEnabled: options?.ingressEnabled ?? true,
    maxMsgSpoolUsage: options?.maxMsgSpoolUsage ?? 100,
    msgVpnName: options?.msgVpnName ?? 'test-vpn',
    owner: options?.owner ?? 'user1',
    permission: options?.permission ?? 'modify-topic',
    queueName,
  }
}

export function aQueuesResponse(queues: MsgVpnQueue[]): MsgVpnQueuesResponse {
  return {
    data: queues,
    meta: {},
  }
}
