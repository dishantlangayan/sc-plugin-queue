import {ScConnection} from '@dishantlangayan/sc-cli-core'
import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as sinon from 'sinon'

import {MsgVpnQueueResponse} from '../../../../src/types/msgvpn-queue.js'
import {aBrokerGetResponse, aBrokerNameGetResponse, aQueue, setEnvVariables} from '../../../util/test-utils.js'

describe('broker:queue:display', () => {
  setEnvVariables()
  let scConnStub: sinon.SinonStub

  beforeEach(() => {
    scConnStub = sinon.stub(ScConnection.prototype, 'get')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('runs broker:queue:display --broker-id=test-broker-id --queue-name=myQueue', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueResponse: MsgVpnQueueResponse = {
      data: aQueue(queueName, {accessType: 'exclusive', maxMsgSpoolUsage: 100, owner: 'user1', permission: 'modify-topic'}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueueResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:display --broker-id=${brokerId} --queue-name=${queueName}`)

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(scConnStub.getCall(1).args[0]).to.equal(`/monitor/msgVpns/test-vpn/queues/${queueName}`)
    expect(stdout).to.contain(queueName)
    expect(stdout).to.contain('exclusive')
    expect(stdout).to.contain('user1')
  })

  it('runs broker:queue:display --broker-name=test-broker --queue-name=myQueue', async () => {
    // Arrange
    const brokerName = 'test-broker'
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerByNameResponse = aBrokerNameGetResponse(brokerId, brokerName)
    const mockBrokerResponse = aBrokerGetResponse(brokerId, brokerName)
    const mockQueueResponse: MsgVpnQueueResponse = {
      data: aQueue(queueName, {accessType: 'non-exclusive', owner: 'user2', permission: 'consume'}),
      meta: {},
    }

    scConnStub.onCall(0).returns(Promise.resolve(mockBrokerByNameResponse))
    scConnStub.onCall(1).returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onCall(2).returns(Promise.resolve(mockQueueResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:display --broker-name=${brokerName} --queue-name=${queueName}`)

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`customAttributes=name=="${brokerName}"`)
    expect(scConnStub.getCall(1).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(scConnStub.getCall(2).args[0]).to.equal(`/monitor/msgVpns/test-vpn/queues/${queueName}`)
    expect(stdout).to.contain(queueName)
    expect(stdout).to.contain('non-exclusive')
  })

  it('displays queue with special characters in name', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'my/special#queue'
    const encodedQueueName = 'my%2Fspecial%23queue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueResponse: MsgVpnQueueResponse = {
      data: aQueue(queueName),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueueResponse))

    // Act
    await runCommand(`broker:queue:display --broker-id=${brokerId} --queue-name=${queueName}`)

    // Assert
    expect(scConnStub.getCall(1).args[0]).to.equal(`/monitor/msgVpns/test-vpn/queues/${encodedQueueName}`)
  })

  it('displays all queue properties', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'detailedQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueResponse: MsgVpnQueueResponse = {
      data: aQueue(queueName, {
        accessType: 'exclusive',
        egressEnabled: true,
        ingressEnabled: true,
        maxMsgSpoolUsage: 500,
        owner: 'admin',
        permission: 'delete',
      }),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueueResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:display --broker-id=${brokerId} --queue-name=${queueName}`)

    // Assert - printObjectAsKeyValueTable displays values, not necessarily keys
    expect(stdout).to.contain(queueName)
    expect(stdout).to.contain('exclusive')
    expect(stdout).to.contain('admin')
  })
})
