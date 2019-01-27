#!/bin/bash
virtualenv venv
sleep 1
source venv/bin/activate
sleep 1
python setup.py develop
