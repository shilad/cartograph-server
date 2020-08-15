import datetime
import json
import logging
import os
import random
import re
import traceback

import falcon
from server.ServerUtils import getMimeType

class AutoPanService:
    def __init__(self, config):
        self.config = config
        self.labelTestCSV = config.get('DEFAULT', 'externalDir') + '/country_centroid.csv'
        if not os.path.isfile(self.labelTestCSV):
            logging.error("No country_centroid.csv in externalDir")
            return

    def on_get(self, req, resp):
        try:
            assert('/country_centroid.csv' in req.path)
            i = req.path.find('/country_centroid.csv')
            path = self.labelTestCSV
            resp.stream_len = os.path.getsize(path)
            resp.stream = open(path, 'rb')
            resp.status = falcon.HTTP_200
            resp.content_type = getMimeType(req.path)
            return True
        except OSError:
            raise falcon.HTTPNotFound()