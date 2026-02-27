import {printObjectAsKeyValueTable, ScCommand, ScConnection} from '@dishantlangayan/sc-cli-core'
import {Flags} from '@oclif/core'

import {BrokerGetResponse, BrokerNameGetResponse} from '../../../types/broker.js'
import {MsgVpnQueueUpdateRequest, MsgVpnQueueUpdateResponse} from '../../../types/msgvpn-queue.js'

export default class BrokerQueueUpdate extends ScCommand<typeof BrokerQueueUpdate> {
  static override args = {}
  static override description = `Update a Queue on a Solace Cloud Broker.

Your token must have one of the permissions listed in the Token Permissions.

Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or services:view:self ]`
  static override examples = [
    '<%= config.bin %> <%= command.id %> --broker-id=MyBrokerId --queue-name=myQueue --access-type=non-exclusive',
    '<%= config.bin %> <%= command.id %> --broker-name=MyBrokerName --queue-name=myQueue --owner=user1 --permission=consume',
    '<%= config.bin %> <%= command.id %> --broker-id=MyBrokerId --queue-name=myQueue --max-spool-usage=200 --no-ingress-enabled',
  ]
  static override flags = {
    'access-type': Flags.string({
      char: 'a',
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
    'delivery-delay': Flags.integer({
      description: 'The delay, in seconds, to apply to messages arriving on the queue before the messages are eligible for delivery.',
      min: 0,
    }),
    'egress-enabled': Flags.boolean({
      allowNo: true,
      description: 'Enable or disable egress (message consumption) from the queue.',
    }),
    'ingress-enabled': Flags.boolean({
      allowNo: true,
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
      description: 'The permission level for all consumers of the queue, excluding the owner.',
      options: ['consume', 'delete', 'modify-topic', 'no-access', 'read-only'],
    }),
    'queue-name': Flags.string({
      char: 'q',
      description: 'The name of the queue to update.',
      required: true,
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

  public async run(): Promise<MsgVpnQueueUpdateResponse> {
    const {flags} = await this.parse(BrokerQueueUpdate)

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

    // Build the queue update request body
    const queueBody: MsgVpnQueueUpdateRequest = {
      ...(flags['access-type'] && {accessType: flags['access-type'] as 'exclusive' | 'non-exclusive'}),
      ...(flags['consumer-ack-propagation-enabled'] !== undefined && {
        consumerAckPropagationEnabled: flags['consumer-ack-propagation-enabled'],
      }),
      ...(flags['dead-msg-queue'] && {deadMsgQueue: flags['dead-msg-queue']}),
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
      ...(flags.permission && {permission: flags.permission as MsgVpnQueueUpdateRequest['permission']}),
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
        ] as MsgVpnQueueUpdateRequest['rejectMsgToSenderOnDiscardBehavior'],
      }),
      ...(flags['respect-msg-priority-enabled'] !== undefined && {
        respectMsgPriorityEnabled: flags['respect-msg-priority-enabled'],
      }),
      ...(flags['respect-ttl-enabled'] !== undefined && {respectTtlEnabled: flags['respect-ttl-enabled']}),
    }

    // Make SEMP Config API call to update the queue
    const endpoint = `/config/msgVpns/${msgVpnName}/queues/${encodeURIComponent(flags['queue-name'])}`
    const sempResp = await sempConn.patch<MsgVpnQueueUpdateResponse>(endpoint, queueBody)

    // Display results
    this.log(printObjectAsKeyValueTable(sempResp.data as unknown as Record<string, unknown>))

    return sempResp
  }
}
