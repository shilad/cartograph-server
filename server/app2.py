import re
import falcon

import logging
import os
import sys
from falcon_multipart.middleware import MultipartMiddleware
from server.ParentService import ParentService, METACONF_FLAG
from server.AddMapService import AddMapService
from server.Map import Map
from server.StaticService import StaticService
from server.LabelTestService import LabelTestService

logging.basicConfig(stream=sys.stderr, level=logging.INFO)

if __name__ == '__main__' and len(sys.argv) > 1:
    meta_config_path = sys.argv[1]
else:
    meta_config_path = os.getenv('CARTOGRAPH_CONFIGS')
    if not meta_config_path:
        raise Exception, 'CARTOGRAPH_CONFIGS environment variable not set!'

configs = {}

logging.info('configuring falcon')

class HandleCORS(object):
    def process_request(self, req, resp):
        resp.set_header('Access-Control-Allow-Origin', '*')
        resp.set_header('Access-Control-Allow-Methods', '*')
        resp.set_header('Access-Control-Allow-Headers', '*')
        resp.set_header('Access-Control-Max-Age', 1728000)  # 20 days
        if req.method == 'OPTIONS':
            raise falcon.HTTPStatus(falcon.HTTP_200, body='\n')


# falcon.API instances are callable WSGI apps
app = falcon.API(middleware=[HandleCORS(), MultipartMiddleware()])


# Determine whether the input file is a multi-config (i.e. paths to multiple files) or a single config file
with open(meta_config_path, 'r') as meta_config:
    first_line = meta_config.readline().strip('\r\n')
    if first_line != METACONF_FLAG:
        conf_files = [meta_config_path]
        map_services = {'_multi_map': False}
    else:
        conf_files = re.split('[\\r\\n]+', meta_config.read())  # Note that the .readline() above means we skip the first line
        map_services = {'_multi_map': True}


# Start up a set of services (i.e. a MapService) for each map (as specified by its config file)
for path in conf_files:
    if path == '':
        continue  # Skip blank lines
    map_service = Map(path)
    map_services[map_service.name] = map_service

map_services['_meta_config'] = meta_config_path
map_services['_last_update'] = os.path.getmtime(meta_config_path)


# Start a ParentService for each service; a ParentService represents a given service for every map in <map_services>
app.add_route('/{map_name}/search.json', ParentService(map_services, 'search_service'))
app.add_route('/{map_name}/vector/{layer}/{z}/{x}/{y}.topojson', ParentService(map_services, 'tile_service'))
app.add_route('/{map_name}/raster/{layer}/{z}/{x}/{y}.png', ParentService(map_services, 'mapnik_service'))
app.add_route('/{map_name}/template/{file}', ParentService(map_services, 'template_service'))
app.add_route('/{map_name}/point.json', ParentService(map_services, 'related_points_service'))
app.add_route('/{map_name}/log', ParentService(map_services, 'logging_service'))
app.add_route('/{map_name}/add_metric/{metric_type}', ParentService(map_services, 'add_metric_service'))
app.add_route('/{map_name}/info', ParentService(map_services, 'info_service'))
app.add_sink(ParentService(map_services, 'static_service').on_get, '/(?P<map_name>.+)/static')
app.add_sink(ParentService(map_services, 'labeltest_service').on_get, '/(?P<map_name>.+)/static/candidate_labels.csv')
app.add_sink(ParentService(map_services, 'autopan_service').on_get, '/(?P<map_name>.+)/static/country_centroid.csv')

# If the server is in multi-map mode, provide hooks for adding new maps
# if map_services['_multi_map']:
#     UPLOAD_DIR = 'tmp/upload'
#     if not os.path.exists(UPLOAD_DIR):
#         os.makedirs(UPLOAD_DIR)
#     app.add_route('/upload', UploadService(map_services, UPLOAD_DIR))
#     app.add_route('/add_map/{map_name}', AddMapService(map_services, UPLOAD_DIR))


# Add way to get static files generally (i.e. without knowing the name of any active map)
app.add_sink(StaticService().on_get, '/static')

# Useful for debugging problems in your API; works with pdb.set_trace(). You
# can also use Gunicorn to host your app. Gunicorn can be configured to
# auto-restart workers when it detects a code change, and it also works
# with pdb.
if __name__ == '__main__':
    logging.info('starting server')

    from wsgiref import simple_server
    httpd = simple_server.make_server('0.0.0.0', 4000, app)
    logging.info('server ready!')
    httpd.serve_forever()
