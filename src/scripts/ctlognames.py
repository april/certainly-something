#!/usr/bin/env python3

import base64
import hashlib
import requests

log_list = requests.get('https://www.gstatic.com/ct/log_list/log_list.json').json()

# This is ugly but it works
print('export const ctLogNames = {')

for log in log_list['logs']:
    hex_log_id = hashlib.sha256(base64.b64decode(log['key'])).hexdigest()

    print('  "{hex_log_id}": "{description}",'.format(
      hex_log_id=hex_log_id,
       description=log['description'].replace('\'', '“', 1).replace('\'', '”').replace(' log', '').replace(' Log', ''),
    ))

print('};')
