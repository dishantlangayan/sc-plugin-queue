import {printObjectAsKeyValueTable, ScCommand, ScConnection} from '@dishantlangayan/sc-cli-core'
import {Flags} from '@oclif/core'

import {BrokerGetResponse, BrokerNameGetResponse} from '../../../types/broker.js'
import {MsgVpnQueueCreateRequest, MsgVpnQueueCreateResponse} from '../../../types/msgvpn-queue.js'

export default class BrokerQueueCreate extends ScCommand<typeof BrokerQueueCreate> {
  static override args = {}
  static override description = `Create a Queue on a Solace Cloud Broker.

Your token must have one of the permissions listed in the Token Permissions.

Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or services:view:self ]`
  static override examples = [
    '<%= config.bin %> <%= command.id %> --broker-id=MyBrokerId --queue-name=myQueue',
    '<%= config.bin %> <%= command.id %> --broker-name=MyBrokerName --queue-name=myQueue --access-type=exclusive',
    '<%= config.bin %> <%= command.id %> --broker-name=MyBrokerName --queue-name=myQueue --owner=user1 --permission=consume',
    '<%= config.bin %> <%= command.id %> --broker-id=MyBrokerId --queue-name=myQueue --max-spool-usage=100 --ingress-enabled --egress-enabled',
  ]
  static override flags = {
    'access-type': Flags.string({
      char: 'a',
      default: 'exclusive',
      description: 'The access type for the queue.',
      options: ['exclusive', 'non-exclusive'],
    }),
    'broker-id': Flags.string({
      char: 'b',
      description: 'Id of the event broker service.',
      exactlyOne: ['broker-id', 'broker-name'],
    }),
    'broker-name': Flags.string({
      char: 'n',
      description: 'Name of the event broker service.',
      exactlyOne: ['broker-id', 'broker-name'],
    }),
    'consumer-ack-propagation-enabled': Flags.boolean({
      allowNo: true,
      description: 'Enable or disable the propagation of consumer acknowledgments.',
    }),
    'dead-msg-queue': Flags.string({
      description: 'The name of the Dead Message Queue.',
    }),
    'delivery-count-enabled': Flags.boolean({
      allowNo: true,
      description: 'Enable or disable delivery count on the messages.',
    }),
    'delivery-delay': Flags.integer({
      description: 'The delay, in seconds, to apply to messages arriving on the queue before the messages are eligible for delivery.',
      min: 0,
    }),
    'egress-enabled': Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Enable or disable egress (message consumption) from the queue.',
    }),
    'ingress-enabled': Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Enable or disable ingress (message reception) to the queue.',
    }),
    'max-bind-count': Flags.integer({
      description: 'The maximum number of consumer flows that can bind to the queue.',
      min: 0,
    }),
    'max-delivered-unacked-msgs-per-flow': Flags.integer({
      description: 'The maximum number of messages delivered but not acknowledged per flow.',
      min: 0,
    }),
    'max-msg-size': Flags.integer({
      description: 'The maximum message size allowed in the queue, in bytes.',
      min: 0,
    }),
    'max-msg-spool-usage': Flags.integer({
      char: 's',
      description: 'The maximum message spool usage allowed by the queue, in megabytes (MB).',
      min: 0,
    }),
    'max-redelivery-count': Flags.integer({
      description: 'The maximum number of times a message will be redelivered before it is discarded or moved to the DMQ.',
      min: 0,
    }),
    'max-ttl': Flags.integer({
      description: 'The maximum time in seconds a message can stay in the queue when respect-ttl-enabled is true.',
      min: 0,
    }),
    owner: Flags.string({
      char: 'o',
      description: 'The client username that owns the queue and has permission equivalent to delete.',
    }),
    permission: Flags.string({
      char: 'p',
      default: 'no-access',
      description: 'The permission level for all consumers of the queue, excluding the owner.',
      options: ['consume', 'delete', 'modify-topic', 'no-access', 'read-only'],
    }),
    'queue-name': Flags.string({
      char: 'q',
      description: 'The name of the queue to create.',
      required: true,
    }),
    'redelivery-delay-enabled': Flags.boolean({
      allowNo: true,
      description: 'Enable or disable a message redelivery delay.',
    }),
    'redelivery-delay-initial-interval': Flags.integer({
      description: 'The delay to be used between the first 2 redelivery attempts, in milliseconds.',
      min: 0,
    }),
    'redelivery-delay-max-interval': Flags.integer({
      description: 'The maximum delay to be used between any 2 redelivery attempts, in milliseconds.',
      min: 0,
    }),
    'redelivery-delay-multiplier': Flags.integer({
      description: 'The amount each delay interval is multiplied by after each failed delivery attempt.',
      min: 0,
    }),
    'redelivery-enabled': Flags.boolean({
      allowNo: true,
      description: 'Enable or disable message redelivery.',
    }),
    'reject-low-priority-msg-enabled': Flags.boolean({
      allowNo: true,
      description: 'Enable or disable the checking of low priority messages against the reject-low-priority-msg-limit.',
    }),
    'reject-low-priority-msg-limit': Flags.integer({
      description: 'The number of messages of any priority above which low priority messages are not admitted.',
      min: 0,
    }),
    'reject-msg-to-sender-on-discard-behavior': Flags.string({
      description: 'Determines when to return negative acknowledgments (NACKs) to sending clients on message discards.',
      options: ['always', 'never', 'when-queue-enabled'],
    }),
    'respect-msg-priority-enabled': Flags.boolean({
      allowNo: true,
      description: 'Enable or disable the respecting of message priority.',
    }),
    'respect-ttl-enabled': Flags.boolean({
      allowNo: true,
      description: 'Enable or disable the respecting of the time-to-live (TTL) for messages.',
    }),
  }

  public async run(): Promise<MsgVpnQueueCreateResponse> {
    const {flags} = await this.parse(BrokerQueueCreate)

    // Create ScConnection instance
    const conn = new ScConnection()

    const brokerName = flags['broker-name'] ?? ''
    let brokerId = flags['broker-id'] ?? ''

    // API url
    let apiUrl: string = `/missionControl/eventBrokerServices`

    // If broker name was provided then retrieve the broker Id first
    if (brokerName) {
      const searchByNameApiUrl = `${apiUrl}?customAttributes=name=="${brokerName}"`
      const brokerResp = await conn.get<BrokerNameGetResponse>(searchByNameApiUrl)
      if (brokerResp.data.length === 0) {
        this.error(`No broker found with the name ${brokerName}`)
      }

      // Set the Broker Id
      brokerId = brokerResp.data[0].id
    }

    // Retrieve the broker details to get the SEMP port, msgVpn and other fields
    apiUrl += `/${brokerId}?expand=broker&expand=serviceConnectionEndpoints`
    const brokerResp = await conn.get<BrokerGetResponse>(apiUrl)
    const {msgVpnName} = brokerResp.data
    const sempHostName = brokerResp.data.defaultManagementHostname
    const sempPort = brokerResp.data.serviceConnectionEndpoints[0].ports.find(
      (p) => p.protocol === 'serviceManagementTlsListenPort',
    )?.port
    const sempUsername = brokerResp.data.broker.msgVpns[0].managementAdminLoginCredential.username
    const sempPassword = brokerResp.data.broker.msgVpns[0].managementAdminLoginCredential.password
    const encodedAuthToken = Buffer.from(`${sempUsername}:${sempPassword}`, 'utf8').toString('base64')

    // Create a SEMP connection for Config API
    const sempConn = new ScConnection(`https://${sempHostName}:${sempPort}`, encodedAuthToken, undefined, true)

    // Build the queue creation request body
    const queueBody: MsgVpnQueueCreateRequest = {
      queueName: flags['queue-name'],
      ...(flags['access-type'] && {accessType: flags['access-type'] as 'exclusive' | 'non-exclusive'}),
      ...(flags['consumer-ack-propagation-enabled'] !== undefined && {
        consumerAckPropagationEnabled: flags['consumer-ack-propagation-enabled'],
      }),
      ...(flags['dead-msg-queue'] && {deadMsgQueue: flags['dead-msg-queue']}),
      ...(flags['delivery-count-enabled'] !== undefined && {deliveryCountEnabled: flags['delivery-count-enabled']}),
      ...(flags['delivery-delay'] !== undefined && {deliveryDelay: flags['delivery-delay']}),
      ...(flags['egress-enabled'] !== undefined && {egressEnabled: flags['egress-enabled']}),
      ...(flags['ingress-enabled'] !== undefined && {ingressEnabled: flags['ingress-enabled']}),
      ...(flags['max-bind-count'] !== undefined && {maxBindCount: flags['max-bind-count']}),
      ...(flags['max-delivered-unacked-msgs-per-flow'] !== undefined && {
        maxDeliveredUnackedMsgsPerFlow: flags['max-delivered-unacked-msgs-per-flow'],
      }),
      ...(flags['max-msg-size'] !== undefined && {maxMsgSize: flags['max-msg-size']}),
      ...(flags['max-msg-spool-usage'] !== undefined && {maxMsgSpoolUsage: flags['max-msg-spool-usage']}),
      ...(flags['max-redelivery-count'] !== undefined && {maxRedeliveryCount: flags['max-redelivery-count']}),
      ...(flags['max-ttl'] !== undefined && {maxTtl: flags['max-ttl']}),
      ...(flags.owner && {owner: flags.owner}),
      ...(flags.permission && {permission: flags.permission as MsgVpnQueueCreateRequest['permission']}),
      ...(flags['redelivery-delay-enabled'] !== undefined && {
        redeliveryDelayEnabled: flags['redelivery-delay-enabled'],
      }),
      ...(flags['redelivery-delay-initial-interval'] !== undefined && {
        redeliveryDelayInitialInterval: flags['redelivery-delay-initial-interval'],
      }),
      ...(flags['redelivery-delay-max-interval'] !== undefined && {
        redeliveryDelayMaxInterval: flags['redelivery-delay-max-interval'],
      }),
      ...(flags['redelivery-delay-multiplier'] !== undefined && {
        redeliveryDelayMultiplier: flags['redelivery-delay-multiplier'],
      }),
      ...(flags['redelivery-enabled'] !== undefined && {redeliveryEnabled: flags['redelivery-enabled']}),
      ...(flags['reject-low-priority-msg-enabled'] !== undefined && {
        rejectLowPriorityMsgEnabled: flags['reject-low-priority-msg-enabled'],
      }),
      ...(flags['reject-low-priority-msg-limit'] !== undefined && {
        rejectLowPriorityMsgLimit: flags['reject-low-priority-msg-limit'],
      }),
      ...(flags['reject-msg-to-sender-on-discard-behavior'] && {
        rejectMsgToSenderOnDiscardBehavior: flags[
          'reject-msg-to-sender-on-discard-behavior'
        ] as MsgVpnQueueCreateRequest['rejectMsgToSenderOnDiscardBehavior'],
      }),
      ...(flags['respect-msg-priority-enabled'] !== undefined && {
        respectMsgPriorityEnabled: flags['respect-msg-priority-enabled'],
      }),
      ...(flags['respect-ttl-enabled'] !== undefined && {respectTtlEnabled: flags['respect-ttl-enabled']}),
    }

    // Make SEMP Config API call to create the queue
    const endpoint = `/config/msgVpns/${msgVpnName}/queues`
    const sempResp = await sempConn.post<MsgVpnQueueCreateResponse>(endpoint, queueBody)

    // Display results
    this.log(printObjectAsKeyValueTable(sempResp.data as unknown as Record<string, unknown>))

    return sempResp
  }
}
