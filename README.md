@dishantlangayan/sc-plugin-queue
=================

Commands to interact with queues on a Solace Cloud broker


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@dishantlangayan/sc-plugin-queue.svg)](https://npmjs.org/package/@dishantlangayan/sc-plugin-queue)
[![Downloads/week](https://img.shields.io/npm/dw/@dishantlangayan/sc-plugin-queue.svg)](https://npmjs.org/package/@dishantlangayan/sc-plugin-queue)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @dishantlangayan/sc-plugin-queue
$ sc COMMAND
running command...
$ sc (--version)
@dishantlangayan/sc-plugin-queue/0.1.2 darwin-arm64 node-v24.1.0
$ sc --help [COMMAND]
USAGE
  $ sc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sc broker queue create`](#sc-broker-queue-create)
* [`sc broker queue delete`](#sc-broker-queue-delete)
* [`sc broker queue display`](#sc-broker-queue-display)
* [`sc broker queue list`](#sc-broker-queue-list)
* [`sc broker queue update`](#sc-broker-queue-update)

## `sc broker queue create`

Create a Queue on a Solace Cloud Broker.

```
USAGE
  $ sc broker queue create -q <value> [--json] [--log-level debug|warn|error|info|trace] [-a exclusive|non-exclusive] [-b
    <value>] [-n <value>] [--consumer-ack-propagation-enabled] [--dead-msg-queue <value>] [--delivery-delay <value>]
    [--egress-enabled] [--ingress-enabled] [--max-bind-count <value>] [--max-delivered-unacked-msgs-per-flow <value>]
    [--max-msg-size <value>] [-s <value>] [--max-redelivery-count <value>] [--max-ttl <value>] [-o <value>] [-p
    consume|delete|modify-topic|no-access|read-only] [--redelivery-enabled] [--reject-low-priority-msg-enabled]
    [--reject-low-priority-msg-limit <value>] [--reject-msg-to-sender-on-discard-behavior
    always|never|when-queue-enabled] [--respect-msg-priority-enabled] [--respect-ttl-enabled]

FLAGS
  -a, --access-type=<option>                               [default: exclusive] The access type for the queue.
                                                           <options: exclusive|non-exclusive>
  -b, --broker-id=<value>                                  Id of the event broker service.
  -n, --broker-name=<value>                                Name of the event broker service.
  -o, --owner=<value>                                      The client username that owns the queue and has permission
                                                           equivalent to delete.
  -p, --permission=<option>                                [default: no-access] The permission level for all consumers
                                                           of the queue, excluding the owner.
                                                           <options: consume|delete|modify-topic|no-access|read-only>
  -q, --queue-name=<value>                                 (required) The name of the queue to create.
  -s, --max-msg-spool-usage=<value>                        The maximum message spool usage allowed by the queue, in
                                                           megabytes (MB).
      --[no-]consumer-ack-propagation-enabled              Enable or disable the propagation of consumer
                                                           acknowledgments.
      --dead-msg-queue=<value>                             The name of the Dead Message Queue.
      --delivery-delay=<value>                             The delay, in seconds, to apply to messages arriving on the
                                                           queue before the messages are eligible for delivery.
      --[no-]egress-enabled                                Enable or disable egress (message consumption) from the
                                                           queue.
      --[no-]ingress-enabled                               Enable or disable ingress (message reception) to the queue.
      --max-bind-count=<value>                             The maximum number of consumer flows that can bind to the
                                                           queue.
      --max-delivered-unacked-msgs-per-flow=<value>        The maximum number of messages delivered but not acknowledged
                                                           per flow.
      --max-msg-size=<value>                               The maximum message size allowed in the queue, in bytes.
      --max-redelivery-count=<value>                       The maximum number of times a message will be redelivered
                                                           before it is discarded or moved to the DMQ.
      --max-ttl=<value>                                    The maximum time in seconds a message can stay in the queue
                                                           when respect-ttl-enabled is true.
      --[no-]redelivery-enabled                            Enable or disable message redelivery.
      --[no-]reject-low-priority-msg-enabled               Enable or disable the checking of low priority messages
                                                           against the reject-low-priority-msg-limit.
      --reject-low-priority-msg-limit=<value>              The number of messages of any priority above which low
                                                           priority messages are not admitted.
      --reject-msg-to-sender-on-discard-behavior=<option>  Determines when to return negative acknowledgments (NACKs) to
                                                           sending clients on message discards.
                                                           <options: always|never|when-queue-enabled>
      --[no-]respect-msg-priority-enabled                  Enable or disable the respecting of message priority.
      --[no-]respect-ttl-enabled                           Enable or disable the respecting of the time-to-live (TTL)
                                                           for messages.

GLOBAL FLAGS
  --json                Format output as json.
  --log-level=<option>  [default: info] Specify level for logging.
                        <options: debug|warn|error|info|trace>

DESCRIPTION
  Create a Queue on a Solace Cloud Broker.

  Your token must have one of the permissions listed in the Token Permissions.

  Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or
  services:view:self ]

EXAMPLES
  $ sc broker queue create --broker-id=MyBrokerId --queue-name=myQueue

  $ sc broker queue create --broker-name=MyBrokerName --queue-name=myQueue --access-type=exclusive

  $ sc broker queue create --broker-name=MyBrokerName --queue-name=myQueue --owner=user1 --permission=consume

  $ sc broker queue create --broker-id=MyBrokerId --queue-name=myQueue --max-spool-usage=100 --ingress-enabled --egress-enabled
```

_See code: [src/commands/broker/queue/create.ts](https://github.com/dishantlangayan/sc-plugin-queue/blob/v0.1.2/src/commands/broker/queue/create.ts)_

## `sc broker queue delete`

Delete a Queue object from a Solace Cloud Broker.

```
USAGE
  $ sc broker queue delete -q <value> [--json] [--log-level debug|warn|error|info|trace] [-b <value>] [-n <value>] [-f]

FLAGS
  -b, --broker-id=<value>    Id of the event broker service.
  -f, --force                Skip confirmation prompt and force deletion.
  -n, --broker-name=<value>  Name of the event broker service.
  -q, --queue-name=<value>   (required) Name of the queue to delete.

GLOBAL FLAGS
  --json                Format output as json.
  --log-level=<option>  [default: info] Specify level for logging.
                        <options: debug|warn|error|info|trace>

DESCRIPTION
  Delete a Queue object from a Solace Cloud Broker.

  The command will check if the queue exists and prompt for confirmation before deletion. Use the --force flag to skip
  the confirmation prompt.

  Your token must have one of the permissions listed in the Token Permissions.

  Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or
  services:view:self ]

EXAMPLES
  $ sc broker queue delete --broker-id=MyBrokerId --queue-name=myQueue

  $ sc broker queue delete --broker-name=MyBrokerName --queue-name=myQueue

  $ sc broker queue delete --broker-id=MyBrokerId --queue-name=myQueue --force
```

_See code: [src/commands/broker/queue/delete.ts](https://github.com/dishantlangayan/sc-plugin-queue/blob/v0.1.2/src/commands/broker/queue/delete.ts)_

## `sc broker queue display`

Get the details of a Queue object from a Solace Cloud Broker.

```
USAGE
  $ sc broker queue display -q <value> [--json] [--log-level debug|warn|error|info|trace] [-b <value>] [-n <value>]

FLAGS
  -b, --broker-id=<value>    Id of the event broker service.
  -n, --broker-name=<value>  Name of the event broker service.
  -q, --queue-name=<value>   (required) Name of the queue to display.

GLOBAL FLAGS
  --json                Format output as json.
  --log-level=<option>  [default: info] Specify level for logging.
                        <options: debug|warn|error|info|trace>

DESCRIPTION
  Get the details of a Queue object from a Solace Cloud Broker.

  Use either the Event Broker's ID (--broker-id) or name (--broker-name) along with the queue name.

  Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or
  services:view:self ]

EXAMPLES
  $ sc broker queue display --broker-id=MyBrokerId --queue-name=myQueue

  $ sc broker queue display --broker-name=MyBrokerName --queue-name=myQueue
```

_See code: [src/commands/broker/queue/display.ts](https://github.com/dishantlangayan/sc-plugin-queue/blob/v0.1.2/src/commands/broker/queue/display.ts)_

## `sc broker queue list`

Get a list of Queue objects from the Solace Cloud Broker.

```
USAGE
  $ sc broker queue list [--json] [--log-level debug|warn|error|info|trace] [-b <value>] [-n <value>] [-c <value>] [-q
    <value>]

FLAGS
  -b, --broker-id=<value>    Id of the event broker service.
  -c, --count=<value>        [default: 10] Limit the number of queues returned
  -n, --broker-name=<value>  Name of the event broker service.
  -q, --queue-name=<value>   Name of the queue(s) to filter.

GLOBAL FLAGS
  --json                Format output as json.
  --log-level=<option>  [default: info] Specify level for logging.
                        <options: debug|warn|error|info|trace>

DESCRIPTION
  Get a list of Queue objects from the Solace Cloud Broker.

  Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or
  services:view:self ]

EXAMPLES
  $ sc broker queue list --broker-id=MyBrokerId

  $ sc broker queue list --broker-name=MyBrokerName

  $ sc broker queue list --broker-name=MyBrokerName --count=10

  $ sc broker queue list --broker-name=MyBrokerName --queue-name=test*"
```

_See code: [src/commands/broker/queue/list.ts](https://github.com/dishantlangayan/sc-plugin-queue/blob/v0.1.2/src/commands/broker/queue/list.ts)_

## `sc broker queue update`

Update a Queue on a Solace Cloud Broker.

```
USAGE
  $ sc broker queue update -q <value> [--json] [--log-level debug|warn|error|info|trace] [-a exclusive|non-exclusive] [-b
    <value>] [-n <value>] [--consumer-ack-propagation-enabled] [--dead-msg-queue <value>] [--delivery-delay <value>]
    [--egress-enabled] [--ingress-enabled] [--max-bind-count <value>] [--max-delivered-unacked-msgs-per-flow <value>]
    [--max-msg-size <value>] [-s <value>] [--max-redelivery-count <value>] [--max-ttl <value>] [-o <value>] [-p
    consume|delete|modify-topic|no-access|read-only] [--redelivery-enabled] [--reject-low-priority-msg-enabled]
    [--reject-low-priority-msg-limit <value>] [--reject-msg-to-sender-on-discard-behavior
    always|never|when-queue-enabled] [--respect-msg-priority-enabled] [--respect-ttl-enabled]

FLAGS
  -a, --access-type=<option>                               The access type for the queue.
                                                           <options: exclusive|non-exclusive>
  -b, --broker-id=<value>                                  Id of the event broker service.
  -n, --broker-name=<value>                                Name of the event broker service.
  -o, --owner=<value>                                      The client username that owns the queue and has permission
                                                           equivalent to delete.
  -p, --permission=<option>                                The permission level for all consumers of the queue,
                                                           excluding the owner.
                                                           <options: consume|delete|modify-topic|no-access|read-only>
  -q, --queue-name=<value>                                 (required) The name of the queue to update.
  -s, --max-msg-spool-usage=<value>                        The maximum message spool usage allowed by the queue, in
                                                           megabytes (MB).
      --[no-]consumer-ack-propagation-enabled              Enable or disable the propagation of consumer
                                                           acknowledgments.
      --dead-msg-queue=<value>                             The name of the Dead Message Queue.
      --delivery-delay=<value>                             The delay, in seconds, to apply to messages arriving on the
                                                           queue before the messages are eligible for delivery.
      --[no-]egress-enabled                                Enable or disable egress (message consumption) from the
                                                           queue.
      --[no-]ingress-enabled                               Enable or disable ingress (message reception) to the queue.
      --max-bind-count=<value>                             The maximum number of consumer flows that can bind to the
                                                           queue.
      --max-delivered-unacked-msgs-per-flow=<value>        The maximum number of messages delivered but not acknowledged
                                                           per flow.
      --max-msg-size=<value>                               The maximum message size allowed in the queue, in bytes.
      --max-redelivery-count=<value>                       The maximum number of times a message will be redelivered
                                                           before it is discarded or moved to the DMQ.
      --max-ttl=<value>                                    The maximum time in seconds a message can stay in the queue
                                                           when respect-ttl-enabled is true.
      --[no-]redelivery-enabled                            Enable or disable message redelivery.
      --[no-]reject-low-priority-msg-enabled               Enable or disable the checking of low priority messages
                                                           against the reject-low-priority-msg-limit.
      --reject-low-priority-msg-limit=<value>              The number of messages of any priority above which low
                                                           priority messages are not admitted.
      --reject-msg-to-sender-on-discard-behavior=<option>  Determines when to return negative acknowledgments (NACKs) to
                                                           sending clients on message discards.
                                                           <options: always|never|when-queue-enabled>
      --[no-]respect-msg-priority-enabled                  Enable or disable the respecting of message priority.
      --[no-]respect-ttl-enabled                           Enable or disable the respecting of the time-to-live (TTL)
                                                           for messages.

GLOBAL FLAGS
  --json                Format output as json.
  --log-level=<option>  [default: info] Specify level for logging.
                        <options: debug|warn|error|info|trace>

DESCRIPTION
  Update a Queue on a Solace Cloud Broker.

  Your token must have one of the permissions listed in the Token Permissions.

  Token Permissions: [ mission_control:access or services:get or services:get:self or services:view or
  services:view:self ]

EXAMPLES
  $ sc broker queue update --broker-id=MyBrokerId --queue-name=myQueue --access-type=non-exclusive

  $ sc broker queue update --broker-name=MyBrokerName --queue-name=myQueue --owner=user1 --permission=consume

  $ sc broker queue update --broker-id=MyBrokerId --queue-name=myQueue --max-spool-usage=200 --no-ingress-enabled
```

_See code: [src/commands/broker/queue/update.ts](https://github.com/dishantlangayan/sc-plugin-queue/blob/v0.1.2/src/commands/broker/queue/update.ts)_
<!-- commandsstop -->
