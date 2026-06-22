
```json
{
    "code": "return getNetwork();",
    "result": {
        "result": {
            "connectionCount": 12,
            "connections": [
                {
                    "from": "Server0",
                    "fromInterface": "FastEthernet0",
                    "to": "Switch2",
                    "toInterface": "FastEthernet0/1",
                    "type": 8100
                },
                {
                    "from": "Server0",
                    "fromInterface": "FastEthernet0",
                    "to": "Switch2",
                    "toInterface": "FastEthernet0/2",
                    "type": 8100
                },
                {
                    "from": "Server0",
                    "fromInterface": "FastEthernet0",
                    "to": "Switch2",
                    "toInterface": "FastEthernet0/3",
                    "type": 8100
                },
                {
                    "from": "Router2",
                    "fromInterface": "FastEthernet0/0",
                    "to": "Switch2",
                    "toInterface": "FastEthernet0/4",
                    "type": 8100
                },
                {
                    "from": "Switch2",
                    "fromInterface": "FastEthernet0/1",
                    "to": "Router2",
                    "toInterface": "FastEthernet0/0",
                    "type": 8101
                },
                {
                    "from": "Switch2",
                    "fromInterface": "FastEthernet0/1",
                    "to": "Switch2",
                    "toInterface": "FastEthernet0/1",
                    "type": 8100
                },
                {
                    "from": "Switch2",
                    "fromInterface": "FastEthernet0/2",
                    "to": "Server0",
                    "toInterface": "FastEthernet0",
                    "type": 8100
                },
                {
                    "from": "Switch2",
                    "fromInterface": "FastEthernet0/3",
                    "to": "Server0",
                    "toInterface": "FastEthernet0",
                    "type": 8100
                },
                {
                    "from": "Switch2",
                    "fromInterface": "FastEthernet0/5",
                    "to": "IP Phone0",
                    "toInterface": "Switch",
                    "type": 8100
                },
                {
                    "from": "Switch2",
                    "fromInterface": "FastEthernet0/4",
                    "to": "Switch2",
                    "toInterface": "FastEthernet0/1",
                    "type": 8101
                },
                {
                    "from": "Switch2",
                    "fromInterface": "FastEthernet0/2",
                    "to": "Server0",
                    "toInterface": "FastEthernet0",
                    "type": 8100
                },
                {
                    "from": "Switch2",
                    "fromInterface": "FastEthernet0/3",
                    "to": "Server0",
                    "toInterface": "FastEthernet0",
                    "type": 8100
                }
            ],
            "deviceCount": 14,
            "devices": [
                {
                    "interfaces": {
                        "length": 0
                    },
                    "model": "Power Distribution Device",
                    "name": "Power Distribution Device0",
                    "type": 45
                },
                {
                    "interfaces": [
                        {
                            "in_use": false,
                            "name": "Vlan1"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/0"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/1"
                        }
                    ],
                    "model": "2811",
                    "name": "Router1",
                    "type": 0
                },
                {
                    "interfaces": [
                        {
                            "in_use": false,
                            "name": "Vlan1"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/0"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/1"
                        }
                    ],
                    "model": "2811",
                    "name": "Router2",
                    "type": 0
                },
                {
                    "interfaces": [
                        {
                            "in_use": false,
                            "name": "Vlan1"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/1"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/2"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/3"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/4"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/5"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/6"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/7"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/8"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/9"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/10"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/11"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/12"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/13"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/14"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/15"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/16"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/17"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/18"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/19"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/20"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/21"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/22"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/23"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/24"
                        },
                        {
                            "in_use": false,
                            "name": "GigabitEthernet0/1"
                        },
                        {
                            "in_use": false,
                            "name": "GigabitEthernet0/2"
                        }
                    ],
                    "model": "2960-24TT",
                    "name": "Switch0",
                    "type": 1
                },
                {
                    "interfaces": [
                        {
                            "in_use": false,
                            "name": "Vlan1"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/1"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/2"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/3"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/4"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/5"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/6"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/7"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/8"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/9"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/10"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/11"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/12"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/13"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/14"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/15"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/16"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/17"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/18"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/19"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/20"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/21"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/22"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/23"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/24"
                        },
                        {
                            "in_use": false,
                            "name": "GigabitEthernet0/1"
                        },
                        {
                            "in_use": false,
                            "name": "GigabitEthernet0/2"
                        }
                    ],
                    "model": "2960-24TT",
                    "name": "Switch1",
                    "type": 1
                },
                {
                    "interfaces": [
                        {
                            "in_use": true,
                            "name": "FastEthernet0"
                        },
                        {
                            "in_use": false,
                            "name": "Bluetooth"
                        }
                    ],
                    "model": "PC-PT",
                    "name": "PC0",
                    "type": 8
                },
                {
                    "interfaces": [
                        {
                            "in_use": true,
                            "name": "FastEthernet0"
                        },
                        {
                            "in_use": false,
                            "name": "Bluetooth"
                        }
                    ],
                    "model": "PC-PT",
                    "name": "PC1",
                    "type": 8
                },
                {
                    "interfaces": [
                        {
                            "in_use": true,
                            "name": "FastEthernet0"
                        },
                        {
                            "in_use": false,
                            "name": "Bluetooth"
                        }
                    ],
                    "model": "PC-PT",
                    "name": "PC2",
                    "type": 8
                },
                {
                    "interfaces": [
                        {
                            "in_use": true,
                            "name": "FastEthernet0"
                        },
                        {
                            "in_use": false,
                            "name": "Bluetooth"
                        }
                    ],
                    "model": "PC-PT",
                    "name": "PC3",
                    "type": 8
                },
                {
                    "interfaces": [
                        {
                            "in_use": true,
                            "name": "FastEthernet0"
                        },
                        {
                            "in_use": false,
                            "name": "Bluetooth"
                        }
                    ],
                    "model": "Laptop-PT",
                    "name": "Laptop0",
                    "type": 18
                },
                {
                    "interfaces": [
                        {
                            "in_use": true,
                            "name": "FastEthernet0"
                        }
                    ],
                    "model": "Meraki-Server",
                    "name": "Meraki Server0",
                    "type": 49
                },
                {
                    "interfaces": [
                        {
                            "in_use": false,
                            "name": "Vlan1"
                        },
                        {
                            "in_use": true,
                            "name": "Switch"
                        },
                        {
                            "in_use": false,
                            "name": "PC"
                        }
                    ],
                    "model": "7960",
                    "name": "IP Phone0",
                    "type": 12
                },
                {
                    "interfaces": [
                        {
                            "in_use": false,
                            "name": "Vlan1"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/1"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/2"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/3"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/4"
                        },
                        {
                            "in_use": true,
                            "name": "FastEthernet0/5"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/6"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/7"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/8"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/9"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/10"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/11"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/12"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/13"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/14"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/15"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/16"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/17"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/18"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/19"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/20"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/21"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/22"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/23"
                        },
                        {
                            "in_use": false,
                            "name": "FastEthernet0/24"
                        },
                        {
                            "in_use": false,
                            "name": "GigabitEthernet0/1"
                        },
                        {
                            "in_use": false,
                            "name": "GigabitEthernet0/2"
                        }
                    ],
                    "model": "2960-24TT",
                    "name": "Switch2",
                    "type": 1
                },
                {
                    "interfaces": [
                        {
                            "in_use": true,
                            "name": "FastEthernet0"
                        }
                    ],
                    "model": "Server-PT",
                    "name": "Server0",
                    "type": 9
                }
            ]
        },
        "success": true
    },
    "success": true
}
```