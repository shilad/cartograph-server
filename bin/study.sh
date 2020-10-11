export PYTHONPATH=$PYTHONPATH:.:./server
export CARTOGRAPH_CONFIGS=./conf/study.txt

gunicorn --workers 4 -b 0.0.0.0:3000 app2:app --reload
