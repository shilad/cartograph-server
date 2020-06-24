import os
import sys
import subprocess
import pandas as pd
import numpy as np
import logging

from collections import defaultdict
from Config import Config

def read_features(*files):
    # id_set = kwargs.get('id_set', None)
    point_dic = defaultdict(dict)
    # required = kwargs.get('required', [])

    # read article_coordinates
    article_coordinates_df = pd.read_csv(files[0])
    for row in article_coordinates_df.itertuples():
        article_id = row.article_id
        point_dic[article_id]['x'] = float(row.x)
        point_dic[article_id]['y'] = float(row.y)
        # point_dic[article_id]['coords'] = np.array([float(row.x), float(row.y)])

    # read zpop_with_id
    zpop_with_id_df = pd.read_csv(files[1])
    for row in zpop_with_id_df.itertuples():
        article_id = row.article_id
        point_dic[article_id]['zpop'] = row.zpop

    # read cluster_with_id
    cluster_with_id_df = pd.read_csv(files[2])
    for row in cluster_with_id_df.itertuples():
        article_id = row.article_id
        point_dic[article_id]['cluster'] = row.country

    # read names_with_id
    names_with_id = pd.read_csv(files[3])
    for row in names_with_id.itertuples():
        article_id = row.article_id
        if article_id in point_dic:
            point_dic[article_id]['name'] = row.article_name

    return point_dic


def build_map(config_path):
    """Build the map config file at config_path and output the build log/errors to files in its baseDir
    :param config_path: full path to the config file of the map to be built
    """

    # Extract the location of the base dir from the config file
    config = Config(config_path)
    output_path = config.get('DEFAULT', 'externalDir')

    # Set up the environment variables
    python_path = os.path.expandvars('$PYTHONPATH:.:./server')
    working_dir = os.getcwd()
    exec_path = os.getenv('PATH')

    env = {'CARTOGRAPH_CONF': config_path, 'PYTHONPATH': python_path, 'PWD': working_dir, 'PATH': exec_path}

    # Build it!
    retCode = subprocess.call(
        ['luigi', '--module', 'cartograph', 'ParentTask', '--local-scheduler', '--retcode-task-failed', '1'],
        env=env,
        stdout=open(os.path.join(output_path, 'build.log'), 'w'),
        stderr=open(os.path.join(output_path, 'build.err'), 'w')
    )
    if retCode != 0:
        raise OSError, 'Luigi build failed! Log available in ' + output_path + '/build.err'
