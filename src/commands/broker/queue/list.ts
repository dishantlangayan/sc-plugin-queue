import {renderTable, ScCommand, ScConnection} from '@dishantlangayan/sc-cli-core'
import {Flags} from '@oclif/core'

import {BrokerGetResponse, BrokerNameGetResponse} from '../../../types/broker.js'
import {MsgVpnQueuesResponse} from '../../../types/msgvpn-queue.js'

export default class BrokerQueueList extends ScCommand<typeof BrokerQueueList> {
  static override args = {}
  static override description = `Get a list of Queue objects from the Solace Cloud Broker.

Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or services:view:self ]`
  static override examples = [
    '<%= config.bin %> <%= command.id %> --broker-id=MyBrokerId',
    '<%= config.bin %> <%= command.id %> --broker-name=MyBrokerName',
    '<%= config.bin %> <%= command.id %> --broker-name=MyBrokerName --count=10',
    '<%= config.bin %> <%= command.id %> --broker-name=MyBrokerName --queue-name=test*"',
  ]
  static override flags = {
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
    count: Flags.integer({
      char: 'c',
      default: 10,
      description: 'Limit the number of queues returned',
      min: 1,
    }),
    'queue-name': Flags.string({
      char: 'q',
      description: 'Name of the queue(s) to filter.',
    }),
  }

  public async run(): Promise<MsgVpnQueuesResponse> {
    const {flags} = await this.parse(BrokerQueueList)

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

    // Use the information and make the SEMP API call to retrieve the queues
    // Create a SEMP connection
    const sempConn = new ScConnection(`https://${sempHostName}:${sempPort}`, encodedAuthToken, undefined, true)

    // Build API endpoint with query parameters
    const endpoint = `/monitor/msgVpns/${msgVpnName}/queues`
    const params: Record<string, number | string | string[]> = {count: flags.count}
    if (flags['queue-name']) params.where = `queueName==${flags['queue-name']}`

    // Make API call
    const sempResp = await sempConn.get<MsgVpnQueuesResponse>(endpoint, {params})

    // Format data as table
    const tableData = [
      ['Queue Name', 'Access Type', 'Owner', 'Permission', 'Ingress', 'Egress', 'Quota (MB)'],
      ...sempResp.data.map((queue) => [
        queue.queueName || '',
        queue.accessType || '',
        queue.owner || '',
        queue.permission || '',
        queue.ingressEnabled ? 'Enabled' : 'Disabled',
        queue.egressEnabled ? 'Enabled' : 'Disabled',
        (queue.maxMsgSpoolUsage ?? 0).toString(),
      ]),
    ]

    // Render table
    const output = renderTable(tableData, {
      0: {width: 25}, // Queue Name
      1: {width: 15}, // Access Type
      2: {width: 20}, // Owner
      3: {width: 15}, // Permission
      4: {width: 10}, // Ingress
      5: {width: 10}, // Egress
      6: {width: 12}, // Quota (MB)
    })
    this.log(output)

    return sempResp
  }
}
