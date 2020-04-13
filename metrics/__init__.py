from metrics.DivergingMetric import DivergingMetric
from metrics.SequentialMetric import SequentialMetric
from metrics.QualitativeMetric import QualitativeMetric


def getMetric(js):
    args = dict(js)
    del args['type']
    del args['path']

    mType = js['type']
    if mType == 'sequential':
        return SequentialMetric(**args)
    elif mType == 'diverging':
        return DivergingMetric(**args)
    elif mType == 'qualitative':
        return QualitativeMetric(**args)
    else:
        raise Exception, 'unknown type %s' % `mType`