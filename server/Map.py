import logging
import os
import shutil

from Config_revise import Config

from server.AddMetricService import AddMetricService
from server.CountryService import CountryService
from server.InfoService import InfoService
from server.LoggingService import LoggingService
from server.PointService import PointService
from server.RasterService import RasterService
from server.SearchService import SearchService
from server.StaticService import StaticService
from server.TemplateService import TemplateService
from server.TileService import TileService


class Map:
    def __init__(self, conf_path):
        """
        Initialize all necessary services for a map from the config file at config_path
        :param conf_path: Path to config file for this map
        """
        if not os.path.isfile(conf_path):
            raise Exception, 'Cartograph Config Path %s does not exist' % `conf_path`

        self.last_update = os.path.getmtime(conf_path)
        self._send_update = False

        conf = Config(conf_path)
        self.name = conf.get('DEFAULT', 'dataset')
    
        # if os.getenv('CLEAR_CACHE'):
        #     logging.info('clearing cache directory %s' % conf.get('DEFAULT', 'webCacheDir'))
        #     shutil.rmtree(conf.get('DEFAULT', 'webCacheDir'), ignore_errors=True)
    
        if os.getenv('BASE_URL'):
            conf.set('Server', 'base_url', os.getenv('BASE_URL'))
    
        logging.info('initializing services for ' + self.name)

        # self.add_metric_service = AddMetricService(conf_path, self)
        self.logging_service = LoggingService(conf)
        self.point_service = PointService(conf)
        self.country_service = CountryService(conf)
        self.tile_service = TileService(conf, self.point_service, self.country_service)
        self.info_service = InfoService(conf)
        self.mapnik_service = RasterService(conf, self.point_service, self.country_service)
        self.template_service = TemplateService(conf)
        self.static_service = StaticService(conf)
        self.search_service = SearchService(self.point_service)

    def trigger_update(self):
        """Trigger this map to be re-initialized across all servers. It is the responsibility of anyone who modifies
        this map's config file to call this method. If everybody is playing nice, calling this method should ultimately
        cause all other parallel servers on the same meta-config file to check if any individual map configs have been
        updated
        """
        self._send_update = True

    def needs_update(self):
        """Check if this map wants to trigger an update. If this returns True, it is the responsibility of the caller to
        change the modification time of the active meta-conf, if there is one. All server instances should be watching
        the mod time of the meta-conf to know when to update their maps.
        :return: True if this map has been flagged for update. This should mean that this map's config file has been
                 changed.
        """
        needs_update = self._send_update
        self._send_update = False
        return needs_update
