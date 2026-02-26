import {printObjectAsKeyValueTable, ScCommand, ScConnection} from '@dishantlangayan/sc-cli-core'
import {Flags} from '@oclif/core'

import {BrokerGetResponse, BrokerNameGetResponse} from '../../../types/broker.js'
import {MsgVpnQueueResponse} from '../../../types/msgvpn-queue.js'

export default class BrokerQueueDisplay extends ScCommand<typeof BrokerQueueDisplay> {
  static override args = {}
  static override description = `Get the details of a Queue object from a Solace Cloud Broker.

Use either the Event Broker's ID (--broker-id) or name (--broker-name) along with the queue name.

Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or services:view:self ]`
  static override examples = [
    '<%= config.bin %> <%= command.id %> --broker-id=MyBrokerId --queue-name=myQueue',
    '<%= config.bin %> <%= command.id %> --broker-name=MyBrokerName --queue-name=myQueue',
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
    'queue-name': Flags.string({
      char: 'q',
      description: 'Name of the queue to display.',
      required: true,
    }),
  }

  public async run(): Promise<MsgVpnQueueResponse> {
    const {flags} = await this.parse(BrokerQueueDisplay)

    // Create ScConnection instance
    const conn = new ScConnection()

    const brokerName = flags['broker-name'] ?? ''
    let brokerId = flags['broker-id'] ?? ''
    const queueName = flags['queue-name']

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

    // Use the information and make the SEMP API call to retrieve the queue details
    // Create a SEMP connection
    const sempConn = new ScConnection(`https://${sempHostName}:${sempPort}`, encodedAuthToken, undefined, true)

    // Build API endpoint
    const endpoint = `/monitor/msgVpns/${msgVpnName}/queues/${encodeURIComponent(queueName)}`

    // Make API call
    const sempResp = await sempConn.get<MsgVpnQueueResponse>(endpoint)

    // Display the queue details as key-value table
    this.log(printObjectAsKeyValueTable(sempResp.data as unknown as Record<string, unknown>))

    return sempResp
  }
}
