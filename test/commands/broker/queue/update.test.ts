import {ScConnection} from '@dishantlangayan/sc-cli-core'
import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as sinon from 'sinon'

import {MsgVpnQueueUpdateResponse} from '../../../../src/types/msgvpn-queue.js'
import {aBrokerGetResponse, aBrokerNameGetResponse, aQueue, setEnvVariables} from '../../../util/test-utils.js'

describe('broker:queue:update', () => {
  setEnvVariables()
  let scConnStub: sinon.SinonStub
  let patchStub: sinon.SinonStub

  beforeEach(() => {
    scConnStub = sinon.stub(ScConnection.prototype, 'get')
    patchStub = sinon.stub(ScConnection.prototype, 'patch')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('runs broker:queue:update --broker-id=test-broker-id --queue-name=myQueue --access-type=non-exclusive', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {accessType: 'non-exclusive'}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    const {stdout} = await runCommand(
      `broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --access-type=non-exclusive`,
    )

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(patchStub.calledOnce).to.be.true
    expect(patchStub.getCall(0).args[0]).to.equal(`/config/msgVpns/test-vpn/queues/${queueName}`)
    expect(patchStub.getCall(0).args[1].accessType).to.equal('non-exclusive')
    expect(stdout).to.contain(queueName)
  })

  it('runs broker:queue:update --broker-id=test-broker-id --queue-name=myQueue --owner=user1 --permission=consume', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {owner: 'user1', permission: 'consume'}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    await runCommand(
      `broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --owner=user1 --permission=consume`,
    )

    // Assert
    expect(patchStub.getCall(0).args[1].owner).to.equal('user1')
    expect(patchStub.getCall(0).args[1].permission).to.equal('consume')
  })

  it('runs broker:queue:update --broker-id=test-broker-id --queue-name=myQueue --max-msg-spool-usage=200', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {maxMsgSpoolUsage: 200}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    await runCommand(
      `broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --max-msg-spool-usage=200`,
    )

    // Assert
    expect(patchStub.getCall(0).args[1].maxMsgSpoolUsage).to.equal(200)
  })

  it('runs broker:queue:update --broker-id=test-broker-id --queue-name=myQueue --no-ingress-enabled --no-egress-enabled', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {egressEnabled: false, ingressEnabled: false}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    await runCommand(
      `broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --no-ingress-enabled --no-egress-enabled`,
    )

    // Assert
    expect(patchStub.getCall(0).args[1].ingressEnabled).to.equal(false)
    expect(patchStub.getCall(0).args[1].egressEnabled).to.equal(false)
  })

  it('runs broker:queue:update --broker-name=test-broker --queue-name=myQueue', async () => {
    // Arrange
    const brokerName = 'test-broker'
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerByNameResponse = aBrokerNameGetResponse(brokerId, brokerName)
    const mockBrokerResponse = aBrokerGetResponse(brokerId, brokerName)
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {maxMsgSpoolUsage: 150}),
      meta: {},
    }

    scConnStub.onCall(0).returns(Promise.resolve(mockBrokerByNameResponse))
    scConnStub.onCall(1).returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    const {stdout} = await runCommand(
      `broker:queue:update --broker-name=${brokerName} --queue-name=${queueName} --max-msg-spool-usage=150`,
    )

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`customAttributes=name=="${brokerName}"`)
    expect(scConnStub.getCall(1).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(patchStub.calledOnce).to.be.true
    expect(stdout).to.contain(queueName)
  })

  it('runs broker:queue:update with advanced options', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    await runCommand(
      `broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --max-bind-count=5 --max-ttl=3600 --delivery-delay=10`,
    )

    // Assert
    const requestBody = patchStub.getCall(0).args[1]
    expect(requestBody.maxBindCount).to.equal(5)
    expect(requestBody.maxTtl).to.equal(3600)
    expect(requestBody.deliveryDelay).to.equal(10)
  })

  it('runs broker:queue:update with boolean flags', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {
        consumerAckPropagationEnabled: true,
        redeliveryEnabled: true,
        respectMsgPriorityEnabled: true,
      }),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    await runCommand(
      `broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --consumer-ack-propagation-enabled --redelivery-enabled --respect-msg-priority-enabled`,
    )

    // Assert
    const requestBody = patchStub.getCall(0).args[1]
    expect(requestBody.consumerAckPropagationEnabled).to.equal(true)
    expect(requestBody.redeliveryEnabled).to.equal(true)
    expect(requestBody.respectMsgPriorityEnabled).to.equal(true)
  })

  it('handles queue with special characters in name', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'my/special#queue'
    const encodedQueueName = 'my%2Fspecial%23queue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {maxMsgSpoolUsage: 100}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    await runCommand(
      `broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --max-msg-spool-usage=100`,
    )

    // Assert
    expect(patchStub.getCall(0).args[0]).to.equal(`/config/msgVpns/test-vpn/queues/${encodedQueueName}`)
  })

  it('updates only the specified fields', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {owner: 'newOwner'}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    await runCommand(`broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --owner=newOwner`)

    // Assert
    const requestBody = patchStub.getCall(0).args[1]
    expect(requestBody.owner).to.equal('newOwner')
    // Only owner should be in the request body
    expect(Object.keys(requestBody).length).to.equal(1)
  })

  it('updates dead message queue and reject behavior', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueUpdateResponse: MsgVpnQueueUpdateResponse = {
      data: aQueue(queueName, {deadMsgQueue: '#DEAD_MSG_QUEUE'}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    patchStub.returns(Promise.resolve(mockQueueUpdateResponse))

    // Act
    await runCommand(
      `broker:queue:update --broker-id=${brokerId} --queue-name=${queueName} --dead-msg-queue=#DEAD_MSG_QUEUE --reject-msg-to-sender-on-discard-behavior=always`,
    )

    // Assert
    const requestBody = patchStub.getCall(0).args[1]
    expect(requestBody.deadMsgQueue).to.equal('#DEAD_MSG_QUEUE')
    expect(requestBody.rejectMsgToSenderOnDiscardBehavior).to.equal('always')
  })
})
