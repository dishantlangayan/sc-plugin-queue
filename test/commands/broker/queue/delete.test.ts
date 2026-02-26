import {ScConnection} from '@dishantlangayan/sc-cli-core'
import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as sinon from 'sinon'

import {MsgVpnQueueDeleteResponse, MsgVpnQueueResponse} from '../../../../src/types/msgvpn-queue.js'
import {aBrokerGetResponse, aBrokerNameGetResponse, aQueue, setEnvVariables} from '../../../util/test-utils.js'

describe('broker:queue:delete', () => {
  setEnvVariables()
  let scConnStub: sinon.SinonStub
  let deleteStub: sinon.SinonStub

  beforeEach(() => {
    scConnStub = sinon.stub(ScConnection.prototype, 'get')
    deleteStub = sinon.stub(ScConnection.prototype, 'delete')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('runs broker:queue:delete --broker-id=test-broker-id --queue-name=myQueue --force', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueResponse: MsgVpnQueueResponse = {
      data: aQueue(queueName, {accessType: 'exclusive', owner: 'user1', permission: 'modify-topic'}),
      meta: {},
    }
    const mockDeleteResponse: MsgVpnQueueDeleteResponse = {
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueueResponse))
    deleteStub.returns(Promise.resolve(mockDeleteResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:delete --broker-id=${brokerId} --queue-name=${queueName} --force`)

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(scConnStub.getCall(1).args[0]).to.equal(`/monitor/msgVpns/test-vpn/queues/${queueName}`)
    expect(deleteStub.calledOnce).to.be.true
    expect(deleteStub.getCall(0).args[0]).to.equal(`/config/msgVpns/test-vpn/queues/${queueName}`)
    expect(stdout).to.contain('Queue deleted successfully')
  })

  it('runs broker:queue:delete --broker-name=test-broker --queue-name=myQueue --force', async () => {
    // Arrange
    const brokerName = 'test-broker'
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerByNameResponse = aBrokerNameGetResponse(brokerId, brokerName)
    const mockBrokerResponse = aBrokerGetResponse(brokerId, brokerName)
    const mockQueueResponse: MsgVpnQueueResponse = {
      data: aQueue(queueName),
      meta: {},
    }
    const mockDeleteResponse: MsgVpnQueueDeleteResponse = {
      meta: {},
    }

    scConnStub.onCall(0).returns(Promise.resolve(mockBrokerByNameResponse))
    scConnStub.onCall(1).returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onCall(2).returns(Promise.resolve(mockQueueResponse))
    deleteStub.returns(Promise.resolve(mockDeleteResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:delete --broker-name=${brokerName} --queue-name=${queueName} --force`)

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`customAttributes=name=="${brokerName}"`)
    expect(scConnStub.getCall(1).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(scConnStub.getCall(2).args[0]).to.equal(`/monitor/msgVpns/test-vpn/queues/${queueName}`)
    expect(deleteStub.calledOnce).to.be.true
    expect(stdout).to.contain('Queue deleted successfully')
  })

  it('displays queue information before deletion', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const queueData = aQueue(queueName, {
      accessType: 'exclusive',
      egressEnabled: true,
      ingressEnabled: true,
      maxMsgSpoolUsage: 100,
      owner: 'admin',
      permission: 'delete',
    })
    // Add additional properties not supported by aQueue helper
    queueData.msgSpoolUsage = 50
    queueData.spooledMsgCount = 25

    const mockQueueResponse: MsgVpnQueueResponse = {
      data: queueData,
      meta: {},
    }
    const mockDeleteResponse: MsgVpnQueueDeleteResponse = {
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueueResponse))
    deleteStub.returns(Promise.resolve(mockDeleteResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:delete --broker-id=${brokerId} --queue-name=${queueName} --force`)

    // Assert
    expect(stdout).to.contain('Queue to be deleted')
    expect(stdout).to.contain('Name:')
    expect(stdout).to.contain(queueName)
    expect(stdout).to.contain('Access Type:')
    expect(stdout).to.contain('exclusive')
    expect(stdout).to.contain('Owner:')
    expect(stdout).to.contain('admin')
    expect(stdout).to.contain('Message Count:')
    expect(stdout).to.contain('Spool Usage:')
  })

  it('handles queue with special characters in name', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'my/special#queue'
    const encodedQueueName = 'my%2Fspecial%23queue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueResponse: MsgVpnQueueResponse = {
      data: aQueue(queueName),
      meta: {},
    }
    const mockDeleteResponse: MsgVpnQueueDeleteResponse = {
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueueResponse))
    deleteStub.returns(Promise.resolve(mockDeleteResponse))

    // Act
    await runCommand(`broker:queue:delete --broker-id=${brokerId} --queue-name=${queueName} --force`)

    // Assert
    expect(scConnStub.getCall(1).args[0]).to.equal(`/monitor/msgVpns/test-vpn/queues/${encodedQueueName}`)
    expect(deleteStub.getCall(0).args[0]).to.equal(`/config/msgVpns/test-vpn/queues/${encodedQueueName}`)
  })

  it('skips confirmation prompt with --force flag', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueResponse: MsgVpnQueueResponse = {
      data: aQueue(queueName),
      meta: {},
    }
    const mockDeleteResponse: MsgVpnQueueDeleteResponse = {
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueueResponse))
    deleteStub.returns(Promise.resolve(mockDeleteResponse))

    // Act - with --force, no confirmation prompt should appear
    const {stdout} = await runCommand(`broker:queue:delete --broker-id=${brokerId} --queue-name=${queueName} --force`)

    // Assert - deletion should proceed directly
    expect(deleteStub.calledOnce).to.be.true
    expect(stdout).to.contain('Queue deleted successfully')
  })
})
