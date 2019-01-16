#!/usr/bin/env python3

import base64
import hashlib
import requests


log_json = requests.get('https://www.gstatic.com/ct/log_list/all_logs_list.json').json()
log_list = {}


# This is ugly but it works
print('export const ctLogNames = {')

for log in log_json['logs']:
    hex_log_id = hashlib.sha256(base64.b64decode(log['key'])).hexdigest()
    description = log['description'] \
        .replace('\'', '“', 1) \
        .replace('\'', '”') \
        .replace(' log', '') \
        .replace(' Log', '') \
        .replace('Sectigo', 'Sectigo (Comodo)')

    log_list[hex_log_id] = description

# For legibility, sort the authorities by name
for log in sorted([v, k] for k, v in log_list.items()):
    print('  "{hex_log_id}": "{description}",'.format(
      hex_log_id=log[1],
      description=log[0],
    ))

print('};')
