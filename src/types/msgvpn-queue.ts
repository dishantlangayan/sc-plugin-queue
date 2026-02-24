// TypeScript type definitions for SEMP API responses and requests

// SEMP Config API - Queue Create Request
export interface MsgVpnQueueCreateRequest {
  accessType?: 'exclusive' | 'non-exclusive'
  consumerAckPropagationEnabled?: boolean
  deadMsgQueue?: string
  deliveryCountEnabled?: boolean
  deliveryDelay?: number
  egressEnabled?: boolean
  ingressEnabled?: boolean
  maxBindCount?: number
  maxDeliveredUnackedMsgsPerFlow?: number
  maxMsgSize?: number
  maxMsgSpoolUsage?: number
  maxRedeliveryCount?: number
  maxTtl?: number
  owner?: string
  permission?: 'consume' | 'delete' | 'modify-topic' | 'no-access' | 'read-only'
  queueName: string
  redeliveryDelayEnabled?: boolean
  redeliveryDelayInitialInterval?: number
  redeliveryDelayMaxInterval?: number
  redeliveryDelayMultiplier?: number
  redeliveryEnabled?: boolean
  rejectLowPriorityMsgEnabled?: boolean
  rejectLowPriorityMsgLimit?: number
  rejectMsgToSenderOnDiscardBehavior?: 'always' | 'never' | 'when-queue-enabled'
  respectMsgPriorityEnabled?: boolean
  respectTtlEnabled?: boolean
}

// SEMP Config API - Queue Create Response
export interface MsgVpnQueueCreateResponse {
  data: MsgVpnQueue
  links?: MsgVpnQueueLink
  meta: SempMeta
}

// SEMP Monitor API - Queue List Response
export interface MsgVpnQueuesResponse {
  collections?: MsgVpnQueueCollection[]
  data: MsgVpnQueue[]
  links?: MsgVpnQueueLink[]
  meta: SempMeta
}

export interface MsgVpnQueue {
  accessType?: 'exclusive' | 'non-exclusive'
  alreadyBoundBindFailureCount?: number
  averageBindRequestRate?: number
  averageRxByteRate?: number
  averageRxMsgRate?: number
  averageTxByteRate?: number
  averageTxMsgRate?: number
  bindRequestCount?: number
  bindRequestRate?: number
  bindSuccessCount?: number
  bindTimeForwardingMode?: 'cut-through' | 'store-and-forward'
  clientProfileDeniedDiscardedMsgCount?: number
  consumerAckPropagationEnabled?: boolean
  createdByManagement?: boolean
  deadMsgQueue?: string
  deletedMsgCount?: number
  deliveryCountEnabled?: boolean
  deliveryDelay?: number
  destinationGroupErrorDiscardedMsgCount?: number
  disabledBindFailureCount?: number
  disabledDiscardedMsgCount?: number
  durable?: boolean
  egressEnabled?: boolean
  eventBindCountThreshold?: {
    clearPercent?: number
    setPercent?: number
  }
  eventMsgSpoolUsageThreshold?: {
    clearPercent?: number
    setPercent?: number
  }
  eventRejectLowPriorityMsgLimitThreshold?: {
    clearPercent?: number
    setPercent?: number
  }
  highestAckedMsgId?: number
  ingressEnabled?: boolean
  inProgressAckMsgCount?: number
  invalidSelectorBindFailureCount?: number
  lastReplayFailureReason?: string
  lastSpooledMsgId?: number
  lowestAckedMsgId?: number
  lowPriorityMsgCongestionDiscardedMsgCount?: number
  lowPriorityMsgCongestionState?: string
  maxBindCount?: number
  maxBindCountExceededBindFailureCount?: number
  maxDeliveredUnackedMsgsPerFlow?: number
  maxMsgSize?: number
  maxMsgSizeExceededDiscardedMsgCount?: number
  maxMsgSpoolUsage?: number
  maxMsgSpoolUsageExceededDiscardedMsgCount?: number
  maxRedeliveryCount?: number
  maxRedeliveryExceededDiscardedMsgCount?: number
  maxRedeliveryExceededToDmqFailedMsgCount?: number
  maxRedeliveryExceededToDmqMsgCount?: number
  maxTtl?: number
  maxTtlExceededDiscardedMsgCount?: number
  maxTtlExpiredDiscardedMsgCount?: number
  maxTtlExpiredToDmqFailedMsgCount?: number
  maxTtlExpiredToDmqMsgCount?: number
  msgSpoolPeakUsage?: number
  msgSpoolUsage?: number
  msgVpnName: string
  networkTopic?: string
  noLocalDeliveryDiscardedMsgCount?: number
  otherBindFailureCount?: number
  owner?: string
  partitionCount?: number
  partitionOperationalCount?: number
  partitionRebalanceDelay?: number
  partitionRebalanceMaxHandoffTime?: number
  partitionRebalanceStatus?: string
  partitionScaleStatus?: string
  permission?: 'consume' | 'delete' | 'modify-topic' | 'no-access' | 'read-only'
  queueName: string
  redeliveredMsgCount?: number
  redeliveryDelayEnabled?: boolean
  redeliveryDelayInitialInterval?: number
  redeliveryDelayMaxInterval?: number
  redeliveryDelayMultiplier?: number
  redeliveryEnabled?: boolean
  rejectLowPriorityMsgEnabled?: boolean
  rejectLowPriorityMsgLimit?: number
  rejectMsgToSenderOnDiscardBehavior?: 'always' | 'never' | 'when-queue-enabled'
  replayedAckedMsgCount?: number
  replayedTxMsgCount?: number
  replayFailureCount?: number
  replayStartCount?: number
  replaySuccessCount?: number
  replicationActiveAckPropTxMsgCount?: number
  replicationStandbyAckedByAckPropMsgCount?: number
  replicationStandbyAckPropRxMsgCount?: number
  replicationStandbyRxMsgCount?: number
  respectMsgPriorityEnabled?: boolean
  respectTtlEnabled?: boolean
  rxByteRate?: number
  rxMsgRate?: number
  spooledByteCount?: number
  spooledMsgCount?: number
  transportRetransmitMsgCount?: number
  txByteRate?: number
  txMsgRate?: number
  txSelector?: boolean
  txUnackedMsgCount?: number
  virtualRouter?: 'auto' | 'backup' | 'primary'
  xaTransactionNotSupportedDiscardedMsgCount?: number
}

export interface MsgVpnQueueCollection {
  msgs?: {
    count?: number
  }
  priorities?: Record<string, unknown>
  subscriptions?: Record<string, unknown>
  txFlows?: Record<string, unknown>
}

export interface MsgVpnQueueLink {
  msgsUri?: string
  prioritiesUri?: string
  subscriptionsUri?: string
  txFlowsUri?: string
  uri?: string
}

export interface SempMeta {
  count?: number
  paging?: {
    cursorQuery?: string
    nextPageUri?: string
  }
  request?: {
    method?: string
    uri?: string
  }
  responseCode?: number
}