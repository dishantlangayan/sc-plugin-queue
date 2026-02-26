import {ScCommand, ScConnection} from '@dishantlangayan/sc-cli-core'
import {confirm} from '@inquirer/prompts'
import {Flags} from '@oclif/core'

import {BrokerGetResponse, BrokerNameGetResponse} from '../../../types/broker.js'
import {MsgVpnQueueDeleteResponse, MsgVpnQueueResponse} from '../../../types/msgvpn-queue.js'

export default class BrokerQueueDelete extends ScCommand<typeof BrokerQueueDelete> {
  static override args = {}
  static override description = `Delete a Queue object from a Solace Cloud Broker.

The command will check if the queue exists and prompt for confirmation before deletion. Use the --force flag to skip the confirmation prompt.

Your token must have one of the permissions listed in the Token Permissions.

Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or services:view:self ]`
  static override examples = [
    '<%= config.bin %> <%= command.id %> --broker-id=MyBrokerId --queue-name=myQueue',
    '<%= config.bin %> <%= command.id %> --broker-name=MyBrokerName --queue-name=myQueue',
    '<%= config.bin %> <%= command.id %> --broker-id=MyBrokerId --queue-name=myQueue --force',
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
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Skip confirmation prompt and force deletion.',
    }),
    'queue-name': Flags.string({
      char: 'q',
      description: 'Name of the queue to delete.',
      required: true,
    }),
  }

  public async run(): Promise<MsgVpnQueueDeleteResponse> {
    const {flags} = await this.parse(BrokerQueueDelete)

    // Create ScConnection instance
    const conn = new ScConnection()

    const brokerName = flags['broker-name'] ?? ''
    let brokerId = flags['broker-id'] ?? ''
    const queueName = flags['queue-name']
    const {force} = flags

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

    // Create a SEMP connection
    const sempConn = new ScConnection(`https://${sempHostName}:${sempPort}`, encodedAuthToken, undefined, true)

    // Check if queue exists before attempting deletion
    const checkEndpoint = `/monitor/msgVpns/${msgVpnName}/queues/${encodeURIComponent(queueName)}`
    try {
      const queueCheckResp = await sempConn.get<MsgVpnQueueResponse>(checkEndpoint)

      // Display queue information
      this.log('\nQueue to be deleted:')
      this.log(`  Name: ${queueCheckResp.data.queueName}`)
      this.log(`  Access Type: ${queueCheckResp.data.accessType || 'N/A'}`)
      this.log(`  Owner: ${queueCheckResp.data.owner || 'N/A'}`)
      this.log(`  Message Count: ${queueCheckResp.data.spooledMsgCount || 0}`)
      this.log(`  Spool Usage: ${queueCheckResp.data.msgSpoolUsage || 0} MB\n`)
    } catch (error: unknown) {
      const err = error as {response?: {status?: number}}
      if (err.response?.status === 404) {
        this.error(`Queue '${queueName}' does not exist on broker '${brokerId}'`)
      }

      throw error
    }

    // Prompt for confirmation unless --force flag is set
    if (!force) {
      const confirmed = await confirm({
        default: false,
        message: 'Are you sure you want to delete this queue? This action cannot be undone.',
      })

      if (!confirmed) {
        this.log('Queue deletion cancelled.')
        this.exit(0)
      }
    }

    // Delete the queue using SEMP Config API
    const deleteEndpoint = `/config/msgVpns/${msgVpnName}/queues/${encodeURIComponent(queueName)}`
    const sempResp = await sempConn.delete<MsgVpnQueueDeleteResponse>(deleteEndpoint)

    // Display results
    this.log('\nQueue deleted successfully.')

    return sempResp
  }
}
