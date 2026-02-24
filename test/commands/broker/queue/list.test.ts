import {ScConnection} from '@dishantlangayan/sc-cli-core'
import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import * as sinon from 'sinon'

import {aBrokerGetResponse, aBrokerNameGetResponse, aQueue, aQueuesResponse, setEnvVariables} from '../../../util/test-utils.js'

describe('broker:queue:list', () => {
  setEnvVariables()
  let scConnStub: sinon.SinonStub

  beforeEach(() => {
    scConnStub = sinon.stub(ScConnection.prototype, 'get')
  })

  afterEach(() => {
    scConnStub.restore()
  })

  it('runs broker:queue:list --broker-id=test-broker-id', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueuesResponse = aQueuesResponse([
      aQueue('queue1', {accessType: 'exclusive', owner: 'user1', permission: 'modify-topic'}),
      aQueue('queue2', {accessType: 'non-exclusive', ingressEnabled: false, maxMsgSpoolUsage: 200, owner: 'user2', permission: 'consume'}),
    ])

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueuesResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:list --broker-id=${brokerId}`)

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(scConnStub.getCall(1).args[0]).to.equal('/monitor/msgVpns/test-vpn/queues')
    expect(scConnStub.getCall(1).args[1].params.count).to.equal(10)
    expect(stdout).to.contain('Queue Name')
    expect(stdout).to.contain('queue1')
    expect(stdout).to.contain('queue2')
    expect(stdout).to.contain('exclusive')
    expect(stdout).to.contain('non-exclusive')
  })

  it('runs broker:queue:list --broker-id=test-broker-id --count=5', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const count = 5
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueuesResponse = aQueuesResponse([aQueue('queue1')])

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueuesResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:list --broker-id=${brokerId} --count=${count}`)

    // Assert
    expect(scConnStub.getCall(1).args[1].params.count).to.equal(count)
    expect(stdout).to.contain('Queue Name')
    expect(stdout).to.contain('queue1')
  })

  it('runs broker:queue:list --broker-id=test-broker-id --queue-name=test*', async () => {
    // Arrange
    const brokerId = 'test-broker-id'
    const queueName = 'test*'
    const mockBrokerResponse = aBrokerGetResponse(brokerId, 'test-broker')
    const mockQueuesResponse = aQueuesResponse([aQueue('test-queue')])

    scConnStub.onFirstCall().returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onSecondCall().returns(Promise.resolve(mockQueuesResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:list --broker-id=${brokerId} --queue-name=${queueName}`)

    // Assert
    expect(scConnStub.getCall(1).args[1].params.where).to.equal(`queueName==${queueName}`)
    expect(stdout).to.contain('Queue Name')
    expect(stdout).to.contain('test-queue')
  })

  it('runs broker:queue:list --broker-name=test-broker', async () => {
    // Arrange
    const brokerName = 'test-broker'
    const brokerId = 'test-broker-id'
    const mockBrokerByNameResponse = aBrokerNameGetResponse(brokerId, brokerName)
    const mockBrokerResponse = aBrokerGetResponse(brokerId, brokerName)
    const mockQueuesResponse = aQueuesResponse([aQueue('queue1')])

    scConnStub.onCall(0).returns(Promise.resolve(mockBrokerByNameResponse))
    scConnStub.onCall(1).returns(Promise.resolve(mockBrokerResponse))
    scConnStub.onCall(2).returns(Promise.resolve(mockQueuesResponse))

    // Act
    const {stdout} = await runCommand(`broker:queue:list --broker-name=${brokerName}`)

    // Assert
    expect(scConnStub.getCall(0).args[0]).to.contain(`customAttributes=name=="${brokerName}"`)
    expect(scConnStub.getCall(1).args[0]).to.contain(`/missionControl/eventBrokerServices/${brokerId}`)
    expect(scConnStub.getCall(2).args[0]).to.equal('/monitor/msgVpns/test-vpn/queues')
    expect(stdout).to.contain('Queue Name')
    expect(stdout).to.contain('queue1')
  })
})
