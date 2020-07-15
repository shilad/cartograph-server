import datetime
import json
import logging
import os
import random
import re
import traceback

import falcon
from server.ServerUtils import getMimeType

class LabelTestService:
    def __init__(self, config):
        self.config = config
        self.labelTestCSV = config.get('DEFAULT', 'externalDir') + '/candidate_labels.csv'
        if not os.path.isfile(self.labelTestCSV):
            logging.error("No candidate_labels.csv in externalDir")
            return

    def on_get(self, req, resp):
        try:
            assert('/candidate_labels.csv' in req.path)
            i = req.path.find('/candidate_labels.csv')
            path = self.labelTestCSV
            resp.stream_len = os.path.getsize(path)
            resp.stream = open(path, 'rb')
            resp.status = falcon.HTTP_200
            resp.content_type = getMimeType(req.path)
            return True
        except OSError:
            raise falcon.HTTPNotFound()