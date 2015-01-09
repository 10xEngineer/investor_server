#!/bin/bash
# Restore mongodb from backup
tar -xzvf ucanpay.backup.tar.gz
mongorestore --db ucanpay_dev ucanpay.backup/ucanpay_dev
