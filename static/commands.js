export const commandCategories = {
    system_info: {
        "Uptime": {
            command: "uptime",
            icon: "fas fa-clock"
        },
        "Total Command": {
            command: "total_command",
            icon: "fas fa-list"
        },
        "Last Command": {
            command: "last_command",
            icon: "fas fa-history"
        },
        "Memory Usage": {
            command: "memory_usage",
            icon: "fas fa-memory"
        },
        "Disk Usage": {
            command: "disk_usage",
            icon: "fas fa-hdd"
        }
    },
  network: {
    "Unblock WiFi": {
      command: "rfkill unblock wifi",
      icon: "fas fa-wifi"
    },
    "Scan WiFi": {
      command: "sudo iwlist wlan0 scan",
      icon: "fas fa-wifi"
    },
    "Test Ethernet": {
      command: "ping -I eth0 dc.oizom.com -c 3",
      icon: "fas fa-network-wired"
    },
    "Test GSM": {
      command: "ping -I wwan0 dc.oizom.com -c 3",
      icon: "fas fa-signal"
    },
    "Test WiFi": {
      command: "ping -I wlan0 dc.oizom.com -c 3",
      icon: "fas fa-wifi"
    },
    "Restart Network Manager": {
      command: "docker restart networkmanager",
      icon: "fas fa-network-wired"
    },
    "Connect Oizom WiFi": {
      command: "sudo wpa_supplicant -c /etc/wpa_supplicant.conf -i wlan0",
      icon: "fas fa-wifi"
    }
  },
  system: {
    "Check CPU Mem": {
      command: "df -h",
      icon: "fas fa-microchip"
    },
    "Check Date": {
      command: "date",
      icon: "fas fa-calendar"
    },
    "Setup RTC": {
      command: "hwclock -rv",
      icon: "fas fa-clock"
    },
    "List USB Devices": {
      command: "lsusb",
      icon: "fas fa-usb"
    },
    "Make Data Folder": {
      command: "mkdir /home/oizom/data; chmod 777 /home/oizom/data/",
      icon: "fas fa-folder"
    }
  },
  docker: {
    "Docker PS": {
      command: "docker ps",
      icon: "fab fa-docker"
    },
    "Restart Gateway": {
      command: "docker restart gateway",
      icon: "fas fa-undo"
    },
    "Gateway Logs": {
      command: "docker logs gateway --tail 500 --timestamps",
      icon: "fas fa-file-alt"
    },
    "Hardware Logs": {
      command: "docker logs hardware --tail 500 --timestamps",
      icon: "fas fa-file-alt"
    },
    "Restart Watchtower": {
      command: "docker restart watchtower",
      icon: "fas fa-undo"
    },
    "Watchtower Logs": {
      command: "docker logs watchtower --tail 500",
      icon: "fas fa-file-alt"
    }
  },
  hardware: {
    "Scan I2C": {
      command: "i2cdetect -y 0",
      icon: "fas fa-microchip"
    },
    "RELAY 1 ON": {
      command: "raspi-gpio set 16 op pn dh",
      icon: "fas fa-lightbulb"
    },
    "RELAY 1 OFF": {
      command: "raspi-gpio set 16 op pn dl",
      icon: "fas fa-lightbulb"
    },
    "RELAY 2 ON": {
      command: "raspi-gpio set 26 op pn dh",
      icon: "fas fa-lightbulb"
    },
    "RELAY 2 OFF": {
      command: "raspi-gpio set 26 op pn dl",
      icon: "fas fa-lightbulb"
    },
    "Restart Hardware Services": {
      command: "docker restart hardware",
      icon: "fas fa-cogs"
    },
    "FAN Test": {
      command: "docker exec hardware python3 -m drivers.MCP230XX.MCP230XX --fan=1",
      icon: "fas fa-fan"
    },
    "Restart LASAN": {
      command: "docker exec hardware python3 -m drivers.MCP230XX.MCP230XX --rebootLASAN=1",
      icon: "fas fa-undo"
    }
  },
  logs: {
    "GSM Logs": {
      command: "journalctl -u gsm -f",
      icon: "fas fa-file-alt"
    },
    "GSM Failed Logs": {
      command: "cat /gsm_failed.txt",
      icon: "fas fa-file-alt"
    },
    "Aikaan Agent Logs": {
      command: "tail -n 100 /opt/aikaan/var/log/aiagent.log",
      icon: "fas fa-file-alt"
    },
    "Hardware Logs": {
      command: "docker logs hardware --tail 500 --timestamps",
      icon: "fas fa-file-alt"
    },
    "Gateway Logs": {
      command: "docker logs gateway --tail 500 --timestamps",
      icon: "fas fa-file-alt"
    }
  },
  oizom_config: {
    "Get ICCID": {
      command: "oizom-config --geticcid",
      icon: "fas fa-id-card"
    },
    "Get IMEI": {
      command: "oizom-config --modemcommand=AT+GSN",
      icon: "fas fa-info-circle"
    },
    "Check GSM Signal Strength": {
      command: "oizom-config --signalstrength",
      icon: "fas fa-signal"
    },
    "Oizom-Config --help": {
      command: "oizom-config --help",
      icon: "fas fa-question-circle"
    },
    Register: {
      command: "oizom-config --register",
      icon: "fas fa-user-plus"
    },
    "V2 Register": {
      command: "oizom-config --v2register",
      icon: "fas fa-user-plus"
    },
    "Force Register": {
      command: "oizom-config --force-register",
      icon: "fas fa-user-check"
    },
    "Reboot GSM": {
      command: "oizom-config --rebootgsm",
      icon: "fas fa-redo"
    }
  }
};
