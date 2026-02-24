import {ScConnection} from '@dishantlangayan/sc-cli-core'
import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as sinon from 'sinon'

import {MsgVpnQueueCreateResponse} from '../../../../src/types/msgvpn-queue.js'
import {aBrokerGetResponse, aBrokerNameGetResponse, aQueue, setEnvVariables} from '../../../util/test-utils.js'

describe('broker:queue:create', () => {
  setEnvVariables()
  let scConnStub: sinon.SinonStub

  beforeEach(() => {
    scConnStub = sinon.stub(ScConnection.prototype, 'get')
    sinon.stub(ScConnection.prototype, 'post')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('runs broker:queue:create --broker-id=test-broker-id --queue-name=myQueue', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueCreateResponse: MsgVpnQueueCreateResponse = {
      data: aQueue(queueName, {accessType: 'exclusive'}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    const postStub = ScConnection.prototype.post as sinon.SinonStub
    postStub.returns(Promise.resolve(mockQueueCreateResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:create --broker-id=${brokerId} --queue-name=${queueName}`)

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(postStub.calledOnce).to.be.true
    expect(postStub.getCall(0).args[0]).to.equal('/config/msgVpns/test-vpn/queues')
    expect(postStub.getCall(0).args[1].queueName).to.equal(queueName)
    expect(stdout).to.contain(queueName)
  })

  it('runs broker:queue:create --broker-id=test-broker-id --queue-name=myQueue --access-type=non-exclusive', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueCreateResponse: MsgVpnQueueCreateResponse = {
      data: aQueue(queueName, {accessType: 'non-exclusive'}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    const postStub = ScConnection.prototype.post as sinon.SinonStub
    postStub.returns(Promise.resolve(mockQueueCreateResponse))

    // Act
    await runCommand(
      `broker:queue:create --broker-id=${brokerId} --queue-name=${queueName} --access-type=non-exclusive`,
    )

    // Assert
    expect(postStub.getCall(0).args[1].accessType).to.equal('non-exclusive')
  })

  it('runs broker:queue:create --broker-id=test-broker-id --queue-name=myQueue --owner=user1 --permission=consume', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueCreateResponse: MsgVpnQueueCreateResponse = {
      data: aQueue(queueName, {owner: 'user1', permission: 'consume'}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    const postStub = ScConnection.prototype.post as sinon.SinonStub
    postStub.returns(Promise.resolve(mockQueueCreateResponse))

    // Act
    await runCommand(
      `broker:queue:create --broker-id=${brokerId} --queue-name=${queueName} --owner=user1 --permission=consume`,
    )

    // Assert
    expect(postStub.getCall(0).args[1].owner).to.equal('user1')
    expect(postStub.getCall(0).args[1].permission).to.equal('consume')
  })

  it('runs broker:queue:create --broker-id=test-broker-id --queue-name=myQueue --max-msg-spool-usage=200', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueCreateResponse: MsgVpnQueueCreateResponse = {
      data: aQueue(queueName, {maxMsgSpoolUsage: 200}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    const postStub = ScConnection.prototype.post as sinon.SinonStub
    postStub.returns(Promise.resolve(mockQueueCreateResponse))

    // Act
    await runCommand(
      `broker:queue:create --broker-id=${brokerId} --queue-name=${queueName} --max-msg-spool-usage=200`,
    )

    // Assert
    expect(postStub.getCall(0).args[1].maxMsgSpoolUsage).to.equal(200)
  })

  it('runs broker:queue:create --broker-id=test-broker-id --queue-name=myQueue --no-ingress-enabled --no-egress-enabled', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueCreateResponse: MsgVpnQueueCreateResponse = {
      data: aQueue(queueName, {egressEnabled: false, ingressEnabled: false}),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    const postStub = ScConnection.prototype.post as sinon.SinonStub
    postStub.returns(Promise.resolve(mockQueueCreateResponse))

    // Act
    await runCommand(
      `broker:queue:create --broker-id=${brokerId} --queue-name=${queueName} --no-ingress-enabled --no-egress-enabled`,
    )

    // Assert
    expect(postStub.getCall(0).args[1].ingressEnabled).to.equal(false)
    expect(postStub.getCall(0).args[1].egressEnabled).to.equal(false)
  })

  it('runs broker:queue:create --broker-name=test-broker --queue-name=myQueue', async () => {
    // Arrange
    const brokerName = 'test-broker'
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerByNameResponse = aBrokerNameGetResponse(brokerId, brokerName)
    const mockBrokerResponse = aBrokerGetResponse(brokerId, brokerName)
    const mockQueueCreateResponse: MsgVpnQueueCreateResponse = {
      data: aQueue(queueName),
      meta: {},
    }

    scConnStub.onCall(0).returns(Promise.resolve(mockBrokerByNameResponse))
    scConnStub.onCall(1).returns(Promise.resolve(mockBrokerResponse))
    const postStub = ScConnection.prototype.post as sinon.SinonStub
    postStub.returns(Promise.resolve(mockQueueCreateResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:create --broker-name=${brokerName} --queue-name=${queueName}`)

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`customAttributes=name=="${brokerName}"`)
    expect(scConnStub.getCall(1).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(postStub.calledOnce).to.be.true
    expect(stdout).to.contain(queueName)
  })

  it('runs broker:queue:create with advanced options', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'myQueue'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueueCreateResponse: MsgVpnQueueCreateResponse = {
      data: aQueue(queueName),
      meta: {},
    }

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    const postStub = ScConnection.prototype.post as sinon.SinonStub
    postStub.returns(Promise.resolve(mockQueueCreateResponse))

    // Act
    await runCommand(
      `broker:queue:create --broker-id=${brokerId} --queue-name=${queueName} --max-bind-count=5 --max-ttl=3600 --delivery-delay=10`,
    )

    // Assert
    const requestBody = postStub.getCall(0).args[1]
    expect(requestBody.maxBindCount).to.equal(5)
    expect(requestBody.maxTtl).to.equal(3600)
    expect(requestBody.deliveryDelay).to.equal(10)
  })
})
