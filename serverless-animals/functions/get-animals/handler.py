# coding: utf-8
from __future__ import (absolute_import, division, print_function, unicode_literals)

import json
import logging
import boto3
import os
import sys

# Path to modules needed to package local lambda function for upload
currentdir = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(currentdir, "./vendored"))

# Modules downloaded into the vendored directory
#requests

# Logging for Serverless
log = logging.getLogger()
log.setLevel(logging.DEBUG)

# Initializing AWS services
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    log.debug("Received event {}".format(json.dumps(event)))

    animalsDemo = dynamodb.Table(os.environ['ANIMALS_TABLENAME_ANIMALS_DEMO'])

    getAnimalsDemo = animalsDemo.get_item(
        Key={
            "user": event['user']
        }
    )

    return getAnimalsDemo['Item']
