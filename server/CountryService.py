import logging

import shapely

from server.PolyLayer import PolyLayer
from server.ServerUtils import tileExtent

logger = logging.getLogger('cartograph.countryservice')


class CountryService:
    def __init__(self, config):
        self.config = config
        self.simplifications = { 1: .2, 7: .05, 10: 0.01}
        self.maxZoom = config.getint('Server', 'vector_zoom')
        self.polys = [
            PolyLayer('countries',
                      path=config.get('MapData', 'countries_geojson'),
                      fields=['labels', 'clusterid'],
                      simplification=self.simplifications,
                      labelField='labels'
                      )
            # PolyLayer('centroid_contours',
            #           path=config.get('MapData', 'centroid_contours_geojson'),
            #           fields=['clusterid', 'contournum', 'contourid'],
            #           simplification=self.simplifications,
            #           ),
            # PolyLayer('density_contours',
            #           table='contoursdensity',
            #           fields=['clusterid', 'contournum', 'contourid'],
            #           simplification=self.simplifications,
            #           ),
        ]

        for p in self.polys:
            logger.info('initializing polygon layer %s', p.name)
            p.init()

    def addLayers(self, builder, z, x, y):
        # logger.info(z)
        # logger.info(self.maxZoom)

        if z < 5:  # if z < self.maxZoom:
            return

        (polys, points, centers) = self.getPolys(z, x, y)
        for (layer, shp, props) in points:
            builder.addPoint(layer, props, shp)
        for (layer, shp, props) in polys:
            builder.addMultiPolygon(layer, shp, props)
        for center in centers:
            builder.addPoint('countries_labels', props['label'], center)




    def getPolys(self, z, x, y):
        polys = []
        points = []
        centers = []
        (x0, y0, x1, y1) = tileExtent(z, x, y)
        assert (x0 <= x1)
        assert (y0 <= y1)
        delta = abs(x0 - x1) * 0.1
        box = shapely.geometry.box(x0 - delta, y0 - delta, x1 + delta, y1 + delta)
        for poly in self.polys:
            for shp, props, center in poly.getPolysInBox(z, box):
                polys.append((poly.name, shp, props))
                if center is not None:
                    centers.append(center)
        logger.info(len(centers))
        logger.info(centers)
        return (polys, points, centers)

